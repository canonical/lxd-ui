import { getFormChangeCount } from "util/formChangeCount";
import { ConfigurationRowFormikProps } from "components/ConfigurationRow";
import { FormDevice } from "util/formDevices";

describe("formChangeCount", () => {
  it("counts reordering of profiles", () => {
    const formik = {
      initialValues: {
        profiles: ["homer", "bart"],
      },
      values: {
        profiles: ["bart", "homer"],
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(2);
  });

  it("counts adding of a profile", () => {
    const formik = {
      initialValues: {
        profiles: ["bart"],
      },
      values: {
        profiles: ["bart", "homer"],
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(1);
  });

  it("counts removal of a profile", () => {
    const formik = {
      initialValues: {
        profiles: ["bart", "homer"],
      },
      values: {
        profiles: ["bart"],
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(1);
  });

  it("counts replacement of a profile", () => {
    const formik = {
      initialValues: {
        profiles: ["bart", "homer"],
      },
      values: {
        profiles: ["bart", "marge"],
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(1);
  });

  it("counts adding and replacement of a profile", () => {
    const formik = {
      initialValues: {
        profiles: ["bart", "homer"],
      },
      values: {
        profiles: ["bart", "marge", "lisa"],
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(2);
  });

  it("counts adding and replacement of two profiles", () => {
    const formik = {
      initialValues: {
        profiles: ["bart", "homer"],
      },
      values: {
        profiles: ["marge", "lisa", "maggy"],
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(3);
  });

  it("counts removal and replacement of a profile", () => {
    const formik = {
      initialValues: {
        profiles: ["bart", "homer"],
      },
      values: {
        profiles: ["marge"],
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(2);
  });

  it("value added", () => {
    const formik = {
      initialValues: {
        name: undefined,
      },
      values: {
        name: "value",
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(1);
  });

  it("value removed", () => {
    const formik = {
      initialValues: {
        name: "value",
      },
      values: {
        name: undefined,
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(1);
  });

  it("value changed", () => {
    const formik = {
      initialValues: {
        name: "value",
      },
      values: {
        name: "new",
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(1);
  });

  it("key was removed", () => {
    const formik = {
      initialValues: {
        name: "value",
      },
      values: {},
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(1);
  });

  it("root disk change invisible fields", () => {
    const formik = {
      initialValues: {
        devices: [
          {
            name: "root",
            path: "/",
            type: "disk",
            pool: "pool",
            "boot.priority": "10",
          },
        ],
      },
      values: {
        devices: [
          {
            name: "root",
            path: "/",
            type: "disk",
            pool: "pool",
          },
        ],
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(0);
  });

  it("root disk change visible fields", () => {
    const formik = {
      initialValues: {
        devices: [
          {
            name: "root",
            path: "/",
            type: "disk",
            pool: "pool",
          },
        ],
      },
      values: {
        devices: [
          {
            name: "root",
            path: "/",
            type: "disk",
            pool: "new-pool",
          },
        ],
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(1);
  });

  it("counts adding none device", () => {
    const formik = {
      initialValues: {
        devices: [] as FormDevice[],
      },
      values: {
        devices: [
          {
            name: "eth0",
            type: "none",
          },
        ],
      },
    } as ConfigurationRowFormikProps;

    const result = getFormChangeCount(formik);

    expect(result).toBe(1);
  });
});