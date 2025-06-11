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
| ![create-instance](https://github.com/user-attachments/assets/832fb6f0-1295-46cd-a969-6ffe30c6eaca) | ![instance-list](https://github.com/user-attachments/assets/705a9846-900c-46c8-bff0-4095e3dfc221) |

|  Instance terminal   | Graphic console      |
|----------------------|----------------------|
| ![instance-terminal](https://github.com/user-attachments/assets/45c2ecb7-7203-4875-a790-89656f3f4579) | ![instance-graphical-console](https://github.com/user-attachments/assets/fb486117-c7a0-47f1-b4f3-604b228687d8) |

| Storage pools         | Storage volume       |
|----------------------|----------------------|
| ![storage-pool-list](https://github.com/user-attachments/assets/1be59c40-99d5-4f03-80c8-1c0555899564)  | ![storage-volume-snap](https://github.com/user-attachments/assets/065db19f-a076-4d57-8027-32aead069ca5) |

| Network              | Network ACL          | 
|----------------------|----------------------|
| ![network-detail](https://github.com/user-attachments/assets/f4f36001-9394-45fc-9730-487db4faf699) | ![network-acl-create](https://github.com/user-attachments/assets/8b20026b-72f0-41ba-9483-f254acaab53a) |

| Create a group       | Assign permissions   |
|----------------------|----------------------|
| ![group-create-overview](https://github.com/user-attachments/assets/444187b7-5f0a-49ac-a8de-71159d01cc0a) | ![group-create-permission](https://github.com/user-attachments/assets/b9d631b5-1eda-4645-9883-97208f641c62) |

| Permission groups    | Operations           |
|----------------------|----------------------|
| ![group-list](https://github.com/user-attachments/assets/65b348f9-447a-4b30-a795-f1a0f3a17f2a) | ![operations-list](https://github.com/user-attachments/assets/b803df86-f2d0-4fbf-ac8b-a118cc0e1bd7) |

| Profiles             | Warnings             |
|----------------------|----------------------|
| ![profile-list](https://github.com/user-attachments/assets/9e87050b-5906-4665-9bc2-065e85ba6564) | ![warnings-list](https://github.com/user-attachments/assets/a2e6eb1b-1418-4cb9-b6c9-e109bc16b3e8) |

| Cluster groups       | Server settings      |
|----------------------|----------------------|
| ![cluster-list](https://github.com/user-attachments/assets/25ef384e-6ee8-4548-8e4d-dbe5504b8ee4) | ![server-settings](https://github.com/user-attachments/assets/7d0d1272-6bed-4a24-8b55-19a36150a8d6) |
