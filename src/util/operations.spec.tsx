import { getInstanceName } from "./operations";
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
      "/1.0/instances/testInstance2?project=project"
    );
    const name = getInstanceName(operation);

    expect(name).toBe("testInstance2");
  });

  it("identifies instance name from snapshot operation", () => {
    const operation = craftOperation(
      "/1.0/instances/testInstance3/snapshots/testSnap"
    );
    const name = getInstanceName(operation);

    expect(name).toBe("testInstance3");
  });

  it("identifies instance name from a snapshot operation in a custom project", () => {
    const operation = craftOperation(
      "/1.0/instances/testInstance3/snapshots/testSnap?project=project"
    );
    const name = getInstanceName(operation);

    expect(name).toBe("testInstance3");
  });
});
