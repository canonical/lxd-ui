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

| Image Selection | Instances | Instances - Detail |
|--|--|--|
| ![imageselect](https://user-images.githubusercontent.com/45884264/216782621-54fa4b6e-84b0-4854-bb38-187eea6a9071.png) | ![instances](https://user-images.githubusercontent.com/1155472/217049612-945199f0-218f-40d8-8920-145748e71566.png) | ![instancedetail](https://user-images.githubusercontent.com/45884264/217056145-b06177b3-d96d-47ab-827f-5174f10ab8a4.png) |

| Snapshots | Terminal | Profiles - Detail |
|--|--|--|
| ![snapshots](https://user-images.githubusercontent.com/45884264/217056175-8f4abde0-c371-4dd1-862b-c73d2f594337.png) | ![terminal](https://user-images.githubusercontent.com/45884264/217056195-919372ee-aab2-44f3-b1d3-267c517fa5af.png) | ![profiledetail](https://user-images.githubusercontent.com/45884264/217056232-0297eeb0-0682-4d81-8485-d8fad487410b.png) |
