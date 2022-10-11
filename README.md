# LXD-UI

Web UI on top of LXD. Make container and VM management easy and accessible. Target small and large scale private clouds.

# Setting up for development

Install lxd

    todo

Install haproxy

    apt install haproxy

Configure Haproxy with below content in /etc/haproxy/haproxy.cfg

    global
      user haproxy
      group lxd
      daemon

    defaults
      mode  http

    frontend lxd_frontend
      bind *:9000
      mode http
      use_backend lxd_socat if { path /1.0 } || { path_beg /1.0/ }
      default_backend lxd_ui

    backend lxd_ui
      mode http
      server yarn_watcher 0.0.0.0:3000

    backend lxd_socat
      server socat_port /var/snap/lxd/common/lxd/unix.socket

Restart HaProxy

    sudo service haproxy restart

Start dotrun in the head of this repo

    dotrun

Browse through http://0.0.0.0:9000/ **avoid** the port 3000 listed by dotrun. Otherwise same origin policy will block requests to the lxd core socket.