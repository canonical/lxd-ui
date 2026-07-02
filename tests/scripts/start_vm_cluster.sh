#!/bin/sh

set -e
set -x

# configure two node cluster for cluster tests
sudo lxc launch ubuntu:24.04 vm1 --vm -c limits.cpu=2 -c limits.memory=4GiB
until sudo lxc exec vm1 -- true 2>/dev/null; do
  sleep 1
done
sudo lxc exec vm1 -- cloud-init status --wait
sudo lxc launch ubuntu:24.04 vm2 --vm -c limits.cpu=2 -c limits.memory=4GiB
until sudo lxc exec vm2 -- true 2>/dev/null; do
  sleep 1
done
sudo lxc exec vm2 -- cloud-init status --wait
sudo lxc launch ubuntu:24.04 vm3 --vm -c limits.cpu=2 -c limits.memory=4GiB
until sudo lxc exec vm3 -- true 2>/dev/null; do
  sleep 1
done
sudo lxc exec vm3 -- cloud-init status --wait

# Additional standalone node used as a second cluster target (for cluster link tests).
sudo lxc launch ubuntu:24.04 vm-standalone --vm -c limits.cpu=2 -c limits.memory=4GiB
until sudo lxc exec vm-standalone -- true 2>/dev/null; do
  sleep 1
done
sudo lxc exec vm-standalone -- cloud-init status --wait

sudo lxc exec vm1 -- apt-get update
sudo lxc exec vm1 -- sudo apt-get install snapd -y
sudo lxc exec vm1 -- snap install lxd --channel="$1"
sudo lxc exec vm2 -- apt-get update
sudo lxc exec vm2 -- sudo apt-get install snapd -y
sudo lxc exec vm2 -- snap install lxd --channel="$1"
sudo lxc exec vm3 -- apt-get update
sudo lxc exec vm3 -- sudo apt-get install snapd -y
sudo lxc exec vm3 -- snap install lxd --channel="$1"
sudo lxc exec vm-standalone -- apt-get update
sudo lxc exec vm-standalone -- sudo apt-get install snapd -y
sudo lxc exec vm-standalone -- snap install lxd --channel="$1"

VM1_IP=$(sudo lxc list vm1 --format csv -c 4 | cut -d' ' -f1 | cut -d',' -f1)
VM2_IP=$(sudo lxc list vm2 --format csv -c 4 | cut -d' ' -f1 | cut -d',' -f1)
VM3_IP=$(sudo lxc list vm3 --format csv -c 4 | cut -d' ' -f1 | cut -d',' -f1)

# Bootstrap VM1
cat <<EOF | sudo lxc exec vm1 -- lxd init --preseed
config:
  core.https_address: ${VM1_IP}:8443
cluster:
  enabled: true
  server_name: vm1
networks:
- name: lxdbr0
  type: bridge
  config:
    ipv4.address: auto
    ipv6.address: auto
storage_pools:
- name: default
  driver: dir
  config: {}
profiles:
- name: default
  devices:
    root:
      path: /
      pool: default
      type: disk
EOF

# Join VM2
TOKEN=$(sudo lxc exec vm1 -- lxc cluster add vm2 | grep -oE 'ey[A-Za-z0-9._=-]+')
cat <<EOF | sudo lxc exec vm2 -- lxd init --preseed
cluster:
  enabled: true
  server_name: vm2
  server_address: ${VM2_IP}:8443
  cluster_token: ${TOKEN}
EOF

# Join VM3
TOKEN=$(sudo lxc exec vm1 -- lxc cluster add vm3 | grep -oE 'ey[A-Za-z0-9._=-]+')
cat <<EOF | sudo lxc exec vm3 -- lxd init --preseed
cluster:
  enabled: true
  server_name: vm3
  server_address: ${VM3_IP}:8443
  cluster_token: ${TOKEN}
EOF

# Bootstrap vm-standalone as an unclustered standalone LXD.
sudo lxc exec vm-standalone -- lxd init --auto
sudo lxc exec vm-standalone -- lxc config set core.https_address :8443

cat keys/lxd-ui.crt | sudo lxc exec vm1 -- lxc config trust add - || true

cat <<EOF > .env.local
LXD_UI_BACKEND_IP=$VM1_IP
LXD_UI_CLUSTER_LINK_LOCAL_VM=vm1
LXD_UI_CLUSTER_LINK_REMOTE_VM=vm-standalone
EOF

sudo lxc exec vm1 -- sudo snap install snapd --channel=latest/beta
sudo lxc exec vm1 -- sudo snap install core26 --channel latest/edge
sudo lxc exec vm1 -- sudo snap install microovn --channel latest/edge
sudo lxc exec vm1 -- sudo microovn waitready
sudo lxc exec vm1 -- sudo microovn cluster bootstrap
sudo lxc exec vm1 -- sudo microovn status

OVN_TOKEN=$(sudo lxc exec vm1 -- sudo microovn cluster add vm2)
sudo lxc exec vm2 -- sudo snap install snapd --channel=latest/beta
sudo lxc exec vm2 -- sudo snap install core26 --channel latest/edge
sudo lxc exec vm2 -- sudo snap install microovn --channel latest/edge
sudo lxc exec vm2 -- sudo microovn waitready
sudo lxc exec vm2 -- sudo microovn cluster join "$OVN_TOKEN"
sudo lxc exec vm2 -- sudo microovn status

OVN_TOKEN=$(sudo lxc exec vm1 -- sudo microovn cluster add vm3)
sudo lxc exec vm3 -- sudo snap install snapd --channel=latest/beta
sudo lxc exec vm3 -- sudo snap install core26 --channel latest/edge
sudo lxc exec vm3 -- sudo snap install microovn --channel latest/edge
sudo lxc exec vm3 -- sudo microovn waitready
sudo lxc exec vm3 -- sudo microovn cluster join "$OVN_TOKEN"
sudo lxc exec vm3 -- sudo microovn status

sudo lxc exec vm1 -- lxc config set network.ovn.northbound_connection "ssl:$VM1_IP:6641,ssl:$VM2_IP:6641,ssl:$VM3_IP:6641"

sudo lxc exec vm1 -- sudo snap install microceph --channel latest/edge
sudo lxc exec vm1 -- sudo microceph cluster bootstrap
sudo lxc exec vm1 -- sudo microceph waitready
sudo lxc exec vm1 -- sudo microceph status

CEPH_TOKEN=$(sudo lxc exec vm1 -- sudo microceph cluster add vm2)
sudo lxc exec vm2 -- sudo snap install microceph --channel latest/edge
sudo lxc exec vm2 -- sudo microceph cluster join "$CEPH_TOKEN"
sudo lxc exec vm2 -- sudo microceph waitready
sudo lxc exec vm2 -- sudo microceph status

CEPH_TOKEN=$(sudo lxc exec vm1 -- sudo microceph cluster add vm3)
sudo lxc exec vm3 -- sudo snap install microceph --channel latest/edge
sudo lxc exec vm3 -- sudo microceph cluster join "$CEPH_TOKEN"
sudo lxc exec vm3 -- sudo microceph waitready
sudo lxc exec vm3 -- sudo microceph status

sudo lxc exec vm1 -- sudo microceph disk add loop,1G,3
sudo lxc exec vm1 -- sudo microceph enable rgw --port 80

sudo lxc exec vm2 -- sudo microceph disk add loop,1G,3
sudo lxc exec vm2 -- sudo microceph enable rgw --port 80

sudo lxc exec vm3 -- sudo microceph disk add loop,1G,3
sudo lxc exec vm3 -- sudo microceph enable rgw --port 80

# Wait for OVN chassis to be fully registered
echo "Waiting for OVN chassis registration..."
sleep 15

# Verify chassis are registered
echo "Checking chassis status..."
sudo lxc exec vm1 -- sudo ovn-sbctl show

# Wait for ovn-controller to be ready on both nodes
for vm in vm1 vm2 vm3; do
  echo "Checking ovn-controller on $vm..."
  sudo lxc exec $vm -- sudo systemctl is-active ovn-controller || true
  sudo lxc exec $vm -- sudo ovn-sbctl list chassis || true
done
