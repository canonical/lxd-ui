import {
  getInstancePayload,
  getInstanceEditValues,
  getProfileEditValues,
  getProfilePayload,
  formDeviceToPayload,
} from "util/instanceAndProfilePayloads";
import type { LxdInstance } from "types/instance";
import type { LxdProfile } from "types/profile";
import { objectToYaml, yamlToObject } from "./yaml";
import { parseDevices } from "./formDevices";

describe("conversion to form values and back with getInstanceEditValues and getInstancePayload", () => {
  it("preserves custom top level instance setting field", () => {
    type CustomPayload = LxdInstance & { "custom-key": string };
    const instance = {
      config: {},
      devices: {},
      "custom-key": "custom-value",
    } as unknown as LxdInstance;

    const formValues = getInstanceEditValues(instance);
    const payload = getInstancePayload(instance, formValues) as CustomPayload;

    expect(payload["custom-key"]).toBe("custom-value");
  });

  it("preserves custom config level instance setting field", () => {
    const instance = {
      devices: {},
      config: {
        "custom-config-key": "custom-config-value",
      },
    } as unknown as LxdInstance;

    const formValues = getInstanceEditValues(instance);
    const payload = getInstancePayload(instance, formValues);

    expect(payload.config["custom-config-key"]).toBe("custom-config-value");
  });

  it("preserves limits on instance settings", () => {
    const instance = {
      devices: {},
      config: {
        "limits.memory": "2GB",
        "limits.cpu": "2-3",
      },
    } as unknown as LxdInstance;

    const formValues = getInstanceEditValues(instance);
    const payload = getInstancePayload(instance, formValues);

    expect(payload.config["limits.cpu"]).toBe("2-3");
    expect(payload.config["limits.memory"]).toBe("2GB");
  });

  it("preserves custom devices on instance settings", () => {
    type DevicePayload = LxdInstance & {
      devices: { grafananat: { connect: string } };
    };
    const instance = {
      config: {},
      devices: {
        grafananat: {
          connect: "tcp:1.2.3.4:3000",
        },
      },
    } as unknown as LxdInstance;

    const formValues = getInstanceEditValues(instance);
    const payload = getInstancePayload(instance, formValues) as DevicePayload;

    expect(payload.devices.grafananat.connect).toBe("tcp:1.2.3.4:3000");
  });

  it("converts ssh keys to form values and back", () => {
    const instance = {
      config: {
        "cloud-init.ssh-keys.ssh-key-1": "root:ssh-rsa ABAB",
        "cloud-init.ssh-keys.ssh-key-2": "ubuntu:gh:username",
      },
      devices: {},
    } as unknown as LxdInstance;
    const formValues = getInstanceEditValues(instance);

    expect(formValues.cloud_init_ssh_keys[0].fingerprint).toBe("ssh-rsa ABAB");
    expect(formValues.cloud_init_ssh_keys[0].user).toBe("root");
    expect(formValues.cloud_init_ssh_keys[0].name).toBe("ssh-key-1");
    expect(formValues.cloud_init_ssh_keys[0].id).toBe("ssh-key-1");

    expect(formValues.cloud_init_ssh_keys[1].fingerprint).toBe("gh:username");
    expect(formValues.cloud_init_ssh_keys[1].user).toBe("ubuntu");
    expect(formValues.cloud_init_ssh_keys[1].name).toBe("ssh-key-2");
    expect(formValues.cloud_init_ssh_keys[1].id).toBe("ssh-key-2");

    const payload = getInstancePayload(instance, formValues);

    expect(payload.config["cloud-init.ssh-keys.ssh-key-1"]).toBe(
      "root:ssh-rsa ABAB",
    );

    expect(payload.config["cloud-init.ssh-keys.ssh-key-2"]).toBe(
      "ubuntu:gh:username",
    );
  });

  it("converts user keys to form values and back", () => {
    const instance = {
      config: {
        "user.owner": "alice",
        "user.enabled": "false",
        "user.empty": "",
      },
      devices: {},
    } as unknown as LxdInstance;
    const formValues = getInstanceEditValues(instance);

    // the edit form anchors every row to its key, so that renaming a key does
    // not move its row in the table
    expect(formValues.user_keys).toEqual([
      { key: "empty", value: "", sortKey: "empty" },
      { key: "enabled", value: "false", sortKey: "enabled" },
      { key: "owner", value: "alice", sortKey: "owner" },
    ]);

    const payload = getInstancePayload(instance, formValues);

    expect(payload.config["user.owner"]).toBe("alice");
    expect(payload.config["user.enabled"]).toBe("false");
    // lxd stores no key without a value, so it is not sent back
    expect(payload.config["user.empty"]).toBeUndefined();
  });

  it("ignores user key rows without a key", () => {
    const instance = {
      config: {},
      devices: {},
    } as unknown as LxdInstance;
    const formValues = getInstanceEditValues(instance);

    const payload = getInstancePayload(instance, {
      ...formValues,
      user_keys: [
        { key: "", value: "" },
        { key: "", value: "orphan" },
        { key: "owner", value: "alice" },
      ],
    });

    expect(payload.config["user."]).toBeUndefined();
    expect(payload.config["user.owner"]).toBe("alice");
  });

  it("ignores user key rows without a value", () => {
    const instance = {
      config: {},
      devices: {},
    } as unknown as LxdInstance;
    const formValues = getInstanceEditValues(instance);

    const payload = getInstancePayload(instance, {
      ...formValues,
      user_keys: [
        { key: "blank", value: "" },
        { key: "owner", value: "alice" },
      ],
    });

    expect(payload.config["user.blank"]).toBeUndefined();
    expect(payload.config["user.owner"]).toBe("alice");
  });

  it("adds, edits and removes user keys", () => {
    const instance = {
      config: {
        "user.owner": "alice",
        "user.obsolete": "gone",
      },
      devices: {},
    } as unknown as LxdInstance;
    const formValues = getInstanceEditValues(instance);

    const payload = getInstancePayload(instance, {
      ...formValues,
      user_keys: [
        { key: "owner", value: "bob" },
        { key: "added", value: "new" },
      ],
    });

    expect(payload.config["user.owner"]).toBe("bob");
    expect(payload.config["user.added"]).toBe("new");
    expect(payload.config["user.obsolete"]).toBeUndefined();
  });

  it("keeps ui specific user keys on an unrelated edit", () => {
    const instance = {
      config: {
        "user.ui_terminal_default_payload": '{"command":["bash"]}',
        "user.owner": "alice",
      },
      devices: {},
    } as unknown as LxdInstance;
    const formValues = getInstanceEditValues(instance);

    const payload = getInstancePayload(instance, {
      ...formValues,
      description: "an unrelated edit",
    });

    expect(payload.config["user.ui_terminal_default_payload"]).toBe(
      '{"command":["bash"]}',
    );
  });
});

describe("conversion to form values and back with getProfileEditValues and getProfilePayload", () => {
  it("preserves custom config level profile setting field", () => {
    type CustomPayload = LxdProfile & { "custom-key": string };
    const profile = {
      config: {},
      devices: {},
      "custom-key": "custom-value",
    } as unknown as LxdProfile;

    const formValues = getProfileEditValues(profile);
    const payload = getProfilePayload(profile, formValues) as CustomPayload;

    expect(payload["custom-key"]).toBe("custom-value");
  });

  it("adds and removes user keys on a profile", () => {
    const profile = {
      config: {
        "user.obsolete": "gone",
      },
      devices: {},
    } as unknown as LxdProfile;

    const formValues = getProfileEditValues(profile);
    const payload = getProfilePayload(profile, {
      ...formValues,
      user_keys: [{ key: "env", value: "prod" }],
    });

    expect(payload.config["user.env"]).toBe("prod");
    expect(payload.config["user.obsolete"]).toBeUndefined();
  });

  it("preserves custom top level profile setting field", () => {
    const Profile = {
      devices: {},
      config: {
        "custom-config-key": "custom-config-value",
      },
    } as unknown as LxdProfile;

    const formValues = getProfileEditValues(Profile);
    const payload = getProfilePayload(Profile, formValues);

    expect(payload.config["custom-config-key"]).toBe("custom-config-value");
  });

  it("preserves limits on profile settings", () => {
    const Profile = {
      devices: {},
      config: {
        "limits.memory": "2GB",
        "limits.cpu": "2-3",
      },
    } as unknown as LxdProfile;

    const formValues = getProfileEditValues(Profile);
    const payload = getProfilePayload(Profile, formValues);

    expect(payload.config["limits.cpu"]).toBe("2-3");
    expect(payload.config["limits.memory"]).toBe("2GB");
  });

  it("preserves custom devices on profile settings", () => {
    type DevicePayload = LxdProfile & {
      devices: { grafananat: { connect: string } };
    };
    const Profile = {
      config: {},
      devices: {
        grafananat: {
          connect: "tcp:1.2.3.4:3000",
        },
      },
    } as unknown as LxdProfile;

    const formValues = getProfileEditValues(Profile);
    const payload = getProfilePayload(Profile, formValues) as DevicePayload;

    expect(payload.devices.grafananat.connect).toBe("tcp:1.2.3.4:3000");
  });
});

const deviceYaml =
  "devices:\n" +
  "  root:\n" +
  "    path: /\n" +
  "    pool: big-pool\n" +
  "    readonly: 'true'\n" +
  "    recursive: 'false'\n" +
  "    required: 'true'\n" +
  "    shift: 'false'\n" +
  "    size: 10GiB\n" +
  "    type: disk\n" +
  "    size.state: 3GiB\n" +
  "    boot.priority: 7\n" +
  "  eth0:\n" +
  "    network: lxcbr\n" +
  "    type: nic\n" +
  "  eth1:\n" +
  "    ipv4.address: 10.76.171.21\n" +
  "    network: mybr\n" +
  "    type: nic\n" +
  "  eth2:\n" +
  "    ipv4.address: 10.76.172.21\n" +
  "    network: mybr1\n" +
  "    type: nic\n" +
  "    hostname: myhost\n" +
  "  grafananat:\n" +
  "    connect: tcp:10.76.171.21:3000\n" +
  "    listen: tcp:192.168.0.90:3000\n" +
  "    nat: 'true'\n" +
  "    type: proxy\n" +
  "  prometheusnat:\n" +
  "    connect: tcp:10.76.171.21:9090\n" +
  "    listen: tcp:192.168.0.90:9090\n" +
  "    nat: 'true'\n" +
  "    type: proxy\n" +
  "  foobar:\n" +
  "    id: ababab\n" +
  "    gputype: physical\n" +
  "    type: gpu\n" +
  "";

describe("formDeviceToPayload", () => {
  it("produces yaml matching the original when given fully specified form devices", () => {
    const instance = yamlToObject(deviceYaml) as LxdInstance;
    const formDevices = parseDevices(instance.devices);
    const payload = formDeviceToPayload(formDevices);
    const outYaml = objectToYaml({ devices: payload });

    expect(outYaml).toBe(deviceYaml);
  });
});
