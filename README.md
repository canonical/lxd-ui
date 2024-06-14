# LXD-UI

LXD-UI is a browser frontend for LXD. It enables easy and accessible container and virtual machine management.
Targets small and large scale private clouds.

# Install

1. Get the LXD snap

       sudo snap install --channel=latest/stable lxd

   Or refresh to ensure at least version 5.21 LTS is installed

       sudo snap refresh --channel=latest/stable lxd

2. Make sure that your LXD server is exposed to the network. For example listen on port 8443 of all available interfaces:

       lxc config set core.https_address :8443

3. Done. Access the UI in your browser by entering the server address (for example on localhost, https://127.0.0.1:8443). You can find more information on the UI in the [LXD documentation](https://documentation.ubuntu.com/lxd/en/latest/howto/access_ui/).

# Contributing

You might want to:

- Read the [contributing guide](CONTRIBUTING.md), to learn about our development process and how to build and test your changes.
- [View the source](https://github.com/canonical/lxd-ui) on GitHub.

# Architecture

LXD-UI is a single page application written in TypeScript and React. See [Architecture](ARCHITECTURE.MD) for details on bundling with [LXD](https://github.com/canonical/lxd) and the dev setup.

# Changelog

The [changelog](https://github.com/canonical/lxd-ui/releases) is regularly updated to reflect what's changed in each new release.

# Roadmap
Future plans and high-priority features and enhancements can be found in the [roadmap](ROADMAP.md).

# Examples

| Create an instance                                                                                  | Instance list                                                                                                  | Instance terminal                                                                                          |
|-----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| ![0create](https://github.com/canonical/lxd-ui/assets/1155472/8c4f5eee-9d5a-40ca-93e1-57b1c393dbd9) | ![1instance-overview](https://github.com/canonical/lxd-ui/assets/1155472/af4a92ce-e562-43eb-945f-98b78b4bb03e) | ![2instance-term](https://github.com/canonical/lxd-ui/assets/1155472/14eaaffb-c770-4f34-936f-075ceb6be42e) |

| Graphic console                                                                                                | Profile list                                                                                             | Cluster groups                                                                                                        |
|----------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| ![3-instance-console](https://github.com/canonical/lxd-ui/assets/1155472/e3301135-e737-4f7f-8bfb-1297135402a4) | ![profile-list](https://github.com/canonical/lxd-ui/assets/1155472/f19c3d70-5c25-47b0-9c8e-636bfa42fabe) | ![6cluster](https://github.com/canonical/lxd-ui/assets/1155472/85f61ef9-a45f-4b4a-abee-8fa9dfa69bd2) |

| Storage                                                                                               | Operations                                                                                             | Warnings                                                                                             |
|-------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| ![5storage](https://github.com/canonical/lxd-ui/assets/1155472/d78759a6-9e54-41d4-b9b9-f9905c550763)  | ![operations](https://github.com/canonical/lxd-ui/assets/1155472/c8dfd5c8-5634-4d2e-9167-204c730df574) | ![warnings](https://github.com/canonical/lxd-ui/assets/1155472/a22334c8-61b8-4f8a-b49e-b4d4ad311285) |
