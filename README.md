# LXD-UI

LXD-UI is a browser frontend for LXD. It enables easy and accessible container and virtual machine management.
Targets small and large scale private clouds.

# Setting up for development

Setup lxd

    snap install lxd
    lxd init # can accept all defaults
    lxc config set core.https_address "[::]:8443"

Install dotrun as described in https://github.com/canonical/dotrun#installation Launch it from the head of this repo

    dotrun

You should enable a firewall as `dotrun` exposes an api to start or interact with unprivileged containers on your public
ip via port `9443`. Ensure that the lxd API on port `8443` is open, so `dotrun` can access it.

First time running `dotrun` will generate certificates for you. You can find them in the `keys` folder on the top of
this repo. Trust them from your local lxd with

    sudo lxc config trust add keys/lxd-ui.crt

Now you can browse through https://localhost:9443/ to reach lxd-ui.

# End-to-end tests

The tests expect the environment on localhost to be accessible. Execute `dotrun` and start tests with

    npx playwright test

Generate new tests with helper

    npx playwright codegen --ignore-https-errors https://localhost:9443/
    
# Examples

### Home Page
![image](https://user-images.githubusercontent.com/45884264/216782634-855c4d85-4f9a-409c-8443-b069dbba258c.png)


### Container / VM Creation - Image Selection Menu
![image](https://user-images.githubusercontent.com/45884264/216782621-54fa4b6e-84b0-4854-bb38-187eea6a9071.png)
