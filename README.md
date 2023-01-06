# LXD-UI

LXD-UI is a browser frontend for LXD. It enables easy and accessible container and virtual machine management.
Targets small and large scale private clouds.

# Setting up for development

Generate certificates

    sudo openssl req -nodes -x509 -newkey rsa:2048 -keyout /etc/ssl/private/lxd-ui.key -out /etc/ssl/private/lxd-ui.crt -days 3000
    sudo cat /etc/ssl/private/lxd-ui.key /etc/ssl/private/lxd-ui.crt | sudo tee -a /etc/ssl/private/lxd-ui.pem
    sudo cp /etc/ssl/private/lxd-ui.key /etc/ssl/private/lxd-ui.crt.key
    sudo chown haproxy /etc/ssl/private/lxd-ui.crt.key
    sudo openssl pkcs12 -keypbe PBE-SHA1-3DES -certpbe PBE-SHA1-3DES -export -in /etc/ssl/private/lxd-ui.crt -inkey /etc/ssl/private/lxd-ui.key -out lxd-ui.pfx -name "LXD UI"
    sudo chown $USER ~/lxd-ui.pfx

Import the key to you browser
- chrome linux: browse to chrome://settings/certificates and import lxd-ui.pfx from your user home
- chrome windows: https://www.comodo.com/support/products/authentication_certs/setup/win_chrome.php#import
- firefox: http://www.digi-sign.com/support/client%20certificates/import%20firefox

Setup lxd

    snap install lxd
    lxd init # can accept all defaults
    lxc config set core.https_address "[::]:8443"
    sudo lxc config trust add /etc/ssl/private/lxd-ui.crt

Install HAProxy

    apt install haproxy

Configure HAProxy with below content in /etc/haproxy/haproxy.cfg

    global
      daemon

    defaults
      mode  http

    frontend lxd_frontend
      bind 127.0.0.1:9443 ssl verify required crt /etc/ssl/private/lxd-ui.pem ca-file /etc/ssl/private/lxd-ui.crt
      acl is_upgrade hdr(Connection) -i upgrade
      acl is_websocket hdr(Upgrade) -i websocket
      acl is_lxd_core path_beg /1.0
      use_backend lxd_core if is_lxd_core
      use_backend lxd_core if is_upgrade
      use_backend lxd_core if is_websocket
      default_backend lxd_ui

    backend lxd_ui
      server yarn_serve_port 127.0.0.1:3000

    backend lxd_core
      server lxd_https localhost:8443 ssl verify none crt /etc/ssl/private/lxd-ui.crt

Restart HAProxy

    sudo service haproxy restart

Install dotrun as described in https://github.com/canonical/dotrun#installation Launch it from the head of this repo

    dotrun

Browse through https://localhost:9443/ and **avoid** querying port 3000 directly. Requests to the lxd core won't reach HAProxy on the port 3000.
