#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <instance> <project>"
    echo "Error: Both 'instance' and 'project' arguments are required."
    exit 1
fi

INSTANCE=$1
PROJECT=$2

IS_LXD_CLUSTERED=$(lxc info | grep "server_clustered:" | grep "false")
if [ -z "$IS_LXD_CLUSTERED" ]; then
    echo "Error: LXD is clustered, this script only works for single node installations."
    echo "See https://documentation.ubuntu.com/lxd/en/latest/metrics/ for more information."
    exit 1
fi

CONTAINER_IP=$(lxc info "$INSTANCE" --project="$PROJECT" | grep inet: | grep "global" | head -n1 | cut -d ":" -f2 | cut -d " " -f3 | cut -d "/" -f1)
CONTAINER_UPLINK_IP=$(echo "$CONTAINER_IP" | cut -d "." -f1,2,3)".1"
echo "Found container IP as '$CONTAINER_IP' and uplink as '$CONTAINER_UPLINK_IP'"

set -e
set -x

# upload server.crt to container
lxc info | sed -n "/BEGIN CERTIFICATE/,/END CERTIFICATE/p" | sed 's/^[ \t]*//;s/[ \t]*$//' > /tmp/server.crt
lxc file push /tmp/server.crt "$INSTANCE"/root/server.crt --project="$PROJECT"
rm /tmp/server.crt

# install and configure grafana and prometheus in container
lxc exec "$INSTANCE" --project="$PROJECT" bash <<EOF
set -x
set -e
# install grafana and prometheus
apt-get update
apt-get install -y apt-transport-https software-properties-common wget prometheus
mkdir -p /etc/apt/keyrings/
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | tee /etc/apt/keyrings/grafana.gpg > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | tee -a /etc/apt/sources.list.d/grafana.list
apt-get update
apt-get install -y grafana=11.4.0 loki=3.3.2 promtail=3.3.2
systemctl daemon-reload
systemctl start grafana-server
systemctl enable grafana-server.service
sed -ie '44d' /etc/loki/config.yml # fix the loki configuration, see https://github.com/grafana/loki/issues/15039
systemctl start loki
systemctl enable loki
systemctl start promtail
systemctl enable promtail

# generate ssl key for grafana to serve via https
openssl req -x509 -newkey rsa:4096 -keyout /etc/grafana/grafana.key -out /etc/grafana/grafana.crt -days 365 -nodes -subj "/CN=metrics.local"
chown grafana:grafana /etc/grafana/grafana.crt
chown grafana:grafana /etc/grafana/grafana.key
chmod 400 /etc/grafana/grafana.key /etc/grafana/grafana.crt
sed -i "s#;protocol = http#protocol = https#" /etc/grafana/grafana.ini
cat <<EOT > /etc/grafana/provisioning/datasources/lxd-sources.yaml
apiVersion: 1

datasources:
  - name: prometheus
    type: prometheus
    access: proxy
    url: http://$CONTAINER_IP:9090
  - name: loki
    type: loki
    access: proxy
    url: http://$CONTAINER_IP:3100
EOT
systemctl restart grafana-server

# generate certs for prometheus
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:secp384r1 -sha384 -keyout metrics.key -nodes -out metrics.crt -days 3650 -subj "/CN=metrics.local"
mkdir /etc/prometheus/tls
mv metrics.* /etc/prometheus/tls/
mv server.crt /etc/prometheus/tls/
chown -R prometheus:root /etc/prometheus/tls
chmod 400 /etc/prometheus/tls/metrics.key /etc/prometheus/tls/metrics.crt /etc/prometheus/tls/server.crt

# configure prometheus
cat <<EOT > /etc/prometheus/prometheus.yml
global:
  scrape_interval:     15s
  evaluation_interval: 15s
  scrape_timeout: 15s
scrape_configs:
  - job_name: lxd
    scrape_interval: 15s
    scrape_timeout: 15s
    metrics_path: '/1.0/metrics'
    scheme: 'https'
    static_configs:
      - targets: ['$CONTAINER_UPLINK_IP:8443']
    tls_config:
      ca_file: '/etc/prometheus/tls/server.crt'
      cert_file: '/etc/prometheus/tls/metrics.crt'
      key_file: '/etc/prometheus/tls/metrics.key'
      # XXX: server_name is required if the target name
      #      is not covered by the certificate (not in the SAN list)
      server_name: '$HOSTNAME'
EOT
systemctl daemon-reload
systemctl start prometheus
systemctl enable prometheus.service
EOF

# download metrics.crt from container and add to host lxd trust store
lxc file pull "$INSTANCE"/etc/prometheus/tls/metrics.crt --project="$PROJECT" /tmp/metrics.crt
lxc config trust add /tmp/metrics.crt --type=metrics
rm -rf /tmp/metrics.crt

# configure host lxd for loki and grafana
lxc config set user.ui_grafana_base_url=https://"$CONTAINER_IP":3000/d/bGY-LSB7k/lxd?orgId=1
lxc config set loki.api.url=http://"$CONTAINER_IP":3100 loki.instance=lxd &

# restart container
lxc exec "$INSTANCE" --project="$PROJECT" reboot
sleep 10

set +x

# print grafana url
echo "Successfully initialized grafana"
echo "Next steps:"
echo "1. Wait for the container to finish booting"
echo "2. Sign in with admin/admin to grafana at https://$CONTAINER_IP:3000"
echo "3. Change password"
echo "4. Create a dashboard, see https://documentation.ubuntu.com/lxd/en/latest/howto/grafana/ for more details."
