# LXD-UI

Web UI on top of LXD. Make container and VM management easy and accessible. Target small and large scale private clouds.

# Setting up for development

Install lxd

    snap install lxd
    lxd init # can accept all defaults
    lxc config set core.https_address "[::]:8443"

Install HAProxy

    apt install haproxy

Configure HAProxy with below content in /etc/haproxy/haproxy.cfg

    global
      user haproxy
      group lxd
      daemon

    defaults
      mode  http

    frontend lxd_frontend
      bind *:9000
      mode http
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

Start dotrun in the head of this repo

    sudo snap install dotrun
    dotrun

Browse through http://0.0.0.0:9000/ and **avoid** querying port 3000 directly. Requests to the lxd core won't reach HAProxy on the port 3000.