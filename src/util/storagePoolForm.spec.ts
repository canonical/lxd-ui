import type { LxdStoragePool } from "types/storage";
import { toStoragePoolFormValues } from "util/storagePoolForm";
import { toStoragePool } from "pages/storage/forms/StoragePoolForm";

describe("conversion to form values and back with toStoragePoolFormValues and toStoragePool", () => {
  it("preserves custom top level storage pool setting field", () => {
    type CustomPayload = LxdStoragePool & { "custom-key": string };
    const pool = {
      config: {},
      "custom-key": "custom-value",
    } as unknown as LxdStoragePool;

    const formValues = toStoragePoolFormValues(pool);
    const payload = toStoragePool(formValues) as CustomPayload;

    expect(payload["custom-key"]).toBe("custom-value");
  });

  it("preserves custom config level storage pool setting field", () => {
    const pool = {
      devices: {},
      config: {
        "user.key": "custom-config-value",
      },
    } as unknown as LxdStoragePool;

    const formValues = toStoragePoolFormValues(pool);
    const payload = toStoragePool(formValues);

    expect(payload.config?.["user.key"]).toBe("custom-config-value");
  });
});
