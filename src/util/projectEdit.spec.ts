import type { LxdProject } from "types/project";
import { getProjectEditValues, getProjectPayload } from "util/projectEdit";

describe("conversion to form values and back with getProjectEditValues and getProjectPayload", () => {
  it("preserves custom main level field", () => {
    type CustomPayload = LxdProject & { "custom-key": string };
    const project = {
      config: {},
      "custom-key": "custom-value",
    } as unknown as LxdProject;

    const formValues = getProjectEditValues(project);
    const payload = getProjectPayload(project, formValues) as CustomPayload;

    expect(payload["custom-key"]).toBe("custom-value");
  });

  it("preserves custom config field", () => {
    const project = {
      devices: {},
      config: {
        "user.key": "custom-config-value",
      },
    } as unknown as LxdProject;

    const formValues = getProjectEditValues(project);
    const payload = getProjectPayload(project, formValues);

    expect(payload.config?.["user.key"]).toBe("custom-config-value");
  });
});
