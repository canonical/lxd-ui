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

sudo lxc exec vm1 -- apt-get update
sudo lxc exec vm1 -- sudo apt-get install snapd -y
sudo lxc exec vm1 -- snap install lxd --channel="$1"
sudo lxc exec vm2 -- apt-get update
sudo lxc exec vm2 -- sudo apt-get install snapd -y
sudo lxc exec vm2 -- snap install lxd --channel="$1"

VM1_IP=$(sudo lxc list vm1 --format csv -c 4 | cut -d' ' -f1 | cut -d',' -f1)
VM2_IP=$(sudo lxc list vm2 --format csv -c 4 | cut -d' ' -f1 | cut -d',' -f1)

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

TOKEN=$(sudo lxc exec vm1 -- lxc cluster add vm2 | grep -oE 'ey[A-Za-z0-9._=-]+')

# Join VM2
cat <<EOF | sudo lxc exec vm2 -- lxd init --preseed
cluster:
  enabled: true
  server_name: vm2
  server_address: ${VM2_IP}:8443
  cluster_token: ${TOKEN}
EOF

cat keys/lxd-ui.crt | sudo lxc exec vm1 -- lxc config trust add - || true

echo "LXD_UI_BACKEND_IP=$VM1_IP" > .env.local

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

sudo lxc exec vm1 -- lxc config set network.ovn.northbound_connection "ssl:$VM1_IP:6641,ssl:$VM2_IP:6641"

sudo lxc exec vm1 -- sudo snap install microceph --channel latest/edge
sudo lxc exec vm1 -- sudo microceph cluster bootstrap
sudo lxc exec vm1 -- sudo microceph waitready
sudo lxc exec vm1 -- sudo microceph status

CEPH_TOKEN=$(sudo lxc exec vm1 -- sudo microceph cluster add vm2)

sudo lxc exec vm2 -- sudo snap install microceph --channel latest/edge
sudo lxc exec vm2 -- sudo microceph cluster join "$CEPH_TOKEN"
sudo lxc exec vm2 -- sudo microceph waitready
sudo lxc exec vm2 -- sudo microceph status

sudo lxc exec vm1 -- sudo microceph disk add loop,1G,3
sudo lxc exec vm1 -- sudo microceph enable rgw --port 80

sudo lxc exec vm2 -- sudo microceph disk add loop,1G,3
sudo lxc exec vm2 -- sudo microceph enable rgw --port 80

# Wait for OVN chassis to be fully registered
echo "Waiting for OVN chassis registration..."
sleep 15

# Verify chassis are registered
echo "Checking chassis status..."
sudo lxc exec vm1 -- sudo ovn-sbctl show

# Wait for ovn-controller to be ready on both nodes
for vm in vm1 vm2; do
  echo "Checking ovn-controller on $vm..."
  sudo lxc exec $vm -- sudo systemctl is-active ovn-controller || true
  sudo lxc exec $vm -- sudo ovn-sbctl list chassis || true
done
