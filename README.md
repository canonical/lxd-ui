# LXD-UI

LXD-UI is a browser frontend for LXD. It enables easy and accessible container and virtual machine management.
Targets small and large scale private clouds.

# Install

1. Get the LXD snap

       sudo snap install lxd

   Or refresh to ensure at least version 5.21 LTS is installed. Be aware, that downgrading to a previous channel will not be possible. 

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

| Create an instance   | Instance list        |
|----------------------|----------------------|
| ![create-instance](https://assets.ubuntu.com/v1/7c8e3805-create-instance.png) | ![instance-list](https://assets.ubuntu.com/v1/a45c20d0-instance-list.png) |

|  Instance terminal   | Graphic console      |
|----------------------|----------------------|
| ![instance-terminal](https://assets.ubuntu.com/v1/8b5c1144-instance-terminal.png) | ![instance-graphical-console](https://assets.ubuntu.com/v1/6c9f268f-instance-graphical-console.png) |

| Storage pools         | Storage volume       |
|----------------------|----------------------|
| ![storage-pool-list](https://assets.ubuntu.com/v1/697d98b1-storage-pool-list.png)  | ![storage-volume-snap](https://assets.ubuntu.com/v1/0d407301-storage-volume-snap.png) |

| Network              | Network ACL          | 
|----------------------|----------------------|
| ![network-detail](https://assets.ubuntu.com/v1/cea32c07-network-detail.png) | ![network-acl-create](https://assets.ubuntu.com/v1/c9e5e114-network-acl-create.png) |

| Create a group       | Assign permissions   |
|----------------------|----------------------|
| ![group-create-overview](https://assets.ubuntu.com/v1/48d3cea4-group-create-overview.png) | ![group-create-permission](https://assets.ubuntu.com/v1/c92cbd68-group-create-permission.png) |

| Permission groups    | Operations           |
|----------------------|----------------------|
| ![group-list](https://assets.ubuntu.com/v1/ecab47f6-group-list.png) | ![operations-list](https://assets.ubuntu.com/v1/b5b214ea-operations-list.png) |

| Profiles             | Warnings             |
|----------------------|----------------------|
| ![profile-list](https://assets.ubuntu.com/v1/acb5f1d6-profile-list.png) | ![warnings-list](https://assets.ubuntu.com/v1/5c7eae10-warnings-list.png) |

| Cluster groups       | Server settings      |
|----------------------|----------------------|
| ![cluster-list](https://assets.ubuntu.com/v1/12019e05-cluster-list.png) | ![server-settings](https://assets.ubuntu.com/v1/566fac1a-server-settings.png) |
