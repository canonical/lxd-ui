import { getStorageVolumeEditValues } from "util/storageVolumeEdit";
import { volumeFormToPayload } from "pages/storage/forms/StorageVolumeForm";
import type { LxdStorageVolume } from "types/storage";

describe("conversion to form values and back with getStorageVolumeEditValues and volumeFormToPayload", () => {
  it("preserves custom top level storage volume setting field", () => {
    type CustomPayload = LxdStorageVolume & { "custom-key": string };
    const volume = {
      config: {},
      "custom-key": "custom-value",
    } as unknown as LxdStorageVolume;

    const formValues = getStorageVolumeEditValues(volume);
    const payload = volumeFormToPayload(
      formValues,
      "project-foo",
      volume,
    ) as CustomPayload;

    expect(payload["custom-key"]).toBe("custom-value");
  });

  it("preserves custom config level storage volume setting field", () => {
    const volume = {
      devices: {},
      config: {
        "user.key": "custom-config-value",
      },
    } as unknown as LxdStorageVolume;

    const formValues = getStorageVolumeEditValues(volume);
    const payload = volumeFormToPayload(formValues, "project-foo", volume);

    expect(payload.config?.["user.key"]).toBe("custom-config-value");
  });
});
