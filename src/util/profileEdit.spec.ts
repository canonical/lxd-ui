import { getProfileEditValues } from "./instanceEdit";
import type { LxdProfile } from "types/profile";
import { getProfilePayload } from "./profiles";

describe("conversion to form values and back with getProfileEditValues and getProfilePayload", () => {
  it("preserves custom top level profile setting field", () => {
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
