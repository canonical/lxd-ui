import { expandInheritedValuesYaml } from "./yaml";
import type { LxdInstance } from "types/instance";
import type { LxdProfile } from "types/profile";

describe("expandInheritedValuesYaml", () => {
  const profiles: LxdProfile[] = [
    {
      name: "default",
      description: "Default LXD profile",
      config: { "boot.autostart": "true" },
      devices: {
        root: { path: "/", pool: "default", type: "disk" },
      },
    },
    {
      name: "cloud-init",
      description: "Cloud-init configuration",
      config: {
        "cloud-init.user-data": "#cloud-config\npackage_update: true\n",
      },
      devices: {
        eth0: {
          nictype: "bridged",
          parent: "lxdbr0",
          type: "nic",
          network: "lxdbr0",
        },
      },
    },
  ];

  const instance: LxdInstance = {
    name: "test-vm",
    status: "Running",
    profiles: ["default", "cloud-init"],
    config: {
      "user.meta": "local-value",
    },
    expanded_config: {
      "boot.autostart": "true",
      "user.meta": "local-value",
      "cloud-init.user-data": "#cloud-config\npackage_update: true\n",
    },
    devices: {
      root: { path: "/", pool: "default", type: "disk" },
    },
    expanded_devices: {
      root: { path: "/", pool: "default", type: "disk" },
      eth0: {
        nictype: "bridged",
        parent: "lxdbr0",
        type: "nic",
        network: "lxdbr0",
      },
    },
    architecture: "x86_64",
    created_at: "2024-01-01T00:00:00Z",
    description: "A test VM",
    ephemeral: false,
    last_used_at: "2024-01-02T00:00:00Z",
    location: "local",
    project: "default",
    stateful: false,
    type: "virtual-machine",
    snapshots: null,
  };

  it("should generate an annotated expanded YAML", () => {
    const expectedYaml = `name: test-vm
status: Running
profiles:
  - default
  - cloud-init
architecture: x86_64
created_at: '2024-01-01T00:00:00Z'
description: A test VM
ephemeral: false
last_used_at: '2024-01-02T00:00:00Z'
location: local
project: default
stateful: false
type: virtual-machine
config:
  boot.autostart: 'true' # inherited from profile: default
  user.meta: local-value
  cloud-init.user-data: | # inherited from profile: cloud-init
    #cloud-config
    package_update: true

devices:
  root:
    path: /
    pool: default
    type: disk
  eth0: # inherited from profile: cloud-init
    nictype: bridged
    parent: lxdbr0
    type: nic
    network: lxdbr0`;

    const result = expandInheritedValuesYaml(instance, profiles);
    expect(result).toBe(expectedYaml);
  });

  it("should handle empty inherited values with single quotes", () => {
    const instanceWithEmpty = {
      ...instance,
      config: {},
      expanded_config: { "user.empty": "" },
    };
    const profilesWithEmpty = [
      { ...profiles[0], config: { "user.empty": "" } },
    ];

    const result = expandInheritedValuesYaml(
      instanceWithEmpty,
      profilesWithEmpty,
    );

    // Checks specific formatting for empty strings from js-yaml
    expect(result).toContain(
      "user.empty: '' # inherited from profile: default",
    );
  });
});
