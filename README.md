# LXD-UI

LXD-UI is a browser frontend for LXD. It enables easy and accessible container and virtual machine management.
Targets small and large scale private clouds.

# Install

Get the LXD snap

    sudo snap install --channel=latest/stable lxd

Or refresh to ensure at least version 5.14 is installed

    sudo snap refresh --channel=latest/stable lxd

Follow the guide to [access the LXD web UI](https://documentation.ubuntu.com/lxd/en/latest/howto/access_ui/).

# Contributing

You might want to:

- [View the source](https://github.com/canonical/lxd-ui) on GitHub.
- Read about [running the UI from git checkout](HACKING.md), tests and advanced setup.

# Architecture

LXD-UI is a single page application written in TypeScript and React. See [Architecture](ARCHITECTURE.MD) for details on bundling with [LXD](https://github.com/canonical/lxd) and the dev setup. 

# Examples

| Create an instance                                                                                  | Instance list                                                                                                  | Instance terminal                                                                                          |
|-----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| ![0create](https://github.com/canonical/lxd-ui/assets/1155472/7f0c45a6-2ba2-4cc7-bd7c-c0ebca76d648) | ![1instance-overview](https://github.com/canonical/lxd-ui/assets/1155472/c71d2153-ea71-4ecb-ab25-fabcd6fb1e55) | ![2instance-term](https://github.com/canonical/lxd-ui/assets/1155472/c2b741e2-8806-4d4d-9a9a-f536f76a13b9) |

| Graphic console                                                                                                | Profile list                                                                                             | Cluster groups                                                                                                        |
|----------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| ![3-instance-console](https://github.com/canonical/lxd-ui/assets/1155472/0f8d742d-3f9c-4906-90da-e740e8ff353b) | ![profile-list](https://github.com/canonical/lxd-ui/assets/1155472/36a0f619-767f-4949-804d-061e5e28c87a) | ![6cluster](https://github.com/canonical/lxd-ui/assets/1155472/85f61ef9-a45f-4b4a-abee-8fa9dfa69bd2) |

| Storage                                                                                               | Operations                                                                                             | Warnings                                                                                             |
|-------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| ![5storage](https://github.com/canonical/lxd-ui/assets/1155472/38d7b8ab-d652-4c18-b71e-0098efe73702)  | ![operations](https://github.com/canonical/lxd-ui/assets/1155472/d3168891-19fb-4724-95cb-9afc91191555) | ![warnings](https://github.com/canonical/lxd-ui/assets/1155472/56499dfc-15a2-4c59-8761-47709b4be957) |
