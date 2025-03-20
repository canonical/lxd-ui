import { getInstanceEditValues, getInstancePayload } from "./instanceEdit";
import type { LxdInstance } from "types/instance";

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
});
