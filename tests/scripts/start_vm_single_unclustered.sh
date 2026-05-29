#!/bin/sh

set -e
set -x

# configure single node for unclustered tests
sudo lxc launch ubuntu:24.04 vm1 --vm  -c limits.cpu=4 -c limits.memory=4GiB
until sudo lxc exec vm1 -- true 2>/dev/null; do
  sleep 1
done
sudo lxc exec vm1 -- cloud-init status --wait

sudo lxc exec vm1 -- snap install lxd --channel="$1"

VM1_IP=$(sudo lxc list vm1 --format csv -c 4 | cut -d' ' -f1 | cut -d',' -f1)

# Bootstrap VM1
sudo lxc exec vm1 -- lxd init --auto
sudo lxc exec vm1 -- lxc config set core.https_address "[::]:8443"

echo "LXD_UI_BACKEND_IP=$VM1_IP" > .env.local
