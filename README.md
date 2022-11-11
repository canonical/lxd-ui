# LXD-UI

Web UI on top of LXD. Make container and VM management easy and accessible. Targets small and large scale private clouds.

# Setting up for development

Install lxd

    snap install lxd
    lxd init # can accept all defaults
    lxc config set core.https_address "[::]:8443"

You might want to enable a firewall as the last step exposes an api to start or interact with unprivileged containers on your public ip.

Install HAProxy

    apt install haproxy

Generate a certificate for the proxy

    sudo openssl req -nodes -x509 -newkey rsa:2048 -keyout /etc/ssl/private/lxd-ui.key -out /etc/ssl/private/lxd-ui.crt -days 3000
    sudo cat /etc/ssl/private/lxd-ui.key /etc/ssl/private/lxd-ui.crt | sudo tee -a /etc/ssl/private/lxd-ui.pem

Configure HAProxy with below content in /etc/haproxy/haproxy.cfg

    global
      user haproxy
      group lxd
      daemon

    defaults
      mode  http

    frontend lxd_frontend
      bind *:9443 ssl crt /etc/ssl/private/lxd-ui.pem
      acl is_upgrade hdr(Connection) -i upgrade
      acl is_websocket hdr(Upgrade) -i websocket
      acl is_lxd_core path_beg /1.0
      use_backend lxd_core if is_lxd_core
      use_backend lxd_core if is_upgrade
      use_backend lxd_core if is_websocket
      default_backend lxd_ui

    backend lxd_ui
      server yarn_serve_port 0.0.0.0:3000

    backend lxd_core
      server lxd_socket /var/snap/lxd/common/lxd/unix.socket

Restart HAProxy

    sudo service haproxy restart

Install dotrun and launch it from the head of this repo

    sudo pip3 install dotrun
    dotrun

Browse through http://0.0.0.0:9000/ and **avoid** querying port 3000 directly. Requests to the lxd core won't reach HAProxy on the port 3000.
