import { getInstanceName, getProjectName } from "./operations";
import { LxdOperation } from "types/operation";

const craftOperation = (url: string) => {
  return {
    resources: {
      instances: [url],
    },
  } as LxdOperation;
};

describe("getInstanceName", () => {
  it("identifies instance name from an instance operation", () => {
    const operation = craftOperation("/1.0/instances/testInstance1");
    const name = getInstanceName(operation);

    expect(name).toBe("testInstance1");
  });

  it("identifies instance name from an instance operation in a custom project", () => {
    const operation = craftOperation(
      "/1.0/instances/testInstance2?project=project",
    );
    const name = getInstanceName(operation);

    expect(name).toBe("testInstance2");
  });

  it("identifies instance name from snapshot operation", () => {
    const operation = craftOperation(
      "/1.0/instances/testInstance3/snapshots/testSnap",
    );
    const name = getInstanceName(operation);

    expect(name).toBe("testInstance3");
  });

  it("identifies instance name from a snapshot operation in a custom project", () => {
    const operation = craftOperation(
      "/1.0/instances/testInstance3/snapshots/testSnap?project=project",
    );
    const name = getInstanceName(operation);

    expect(name).toBe("testInstance3");
  });
});

describe("getProjectName", () => {
  it("identifies project name from an instance operation when no project parameter is present", () => {
    const operation = craftOperation("/1.0/instances/testInstance1");
    const name = getProjectName(operation);

    expect(name).toBe("default");
  });

  it("identifies project name from an instance operation in a custom project", () => {
    const operation = craftOperation(
      "/1.0/instances/testInstance2?project=fooProject",
    );
    const name = getProjectName(operation);

    expect(name).toBe("fooProject");
  });

  it("identifies project name from an instance operation in a custom project with other parameters", () => {
    const operation = craftOperation(
      "/1.0/instances/testInstance2?foo=bar&project=barProject",
    );
    const name = getProjectName(operation);

    expect(name).toBe("barProject");
  });
});
