import {
  getInstanceName,
  getInstanceSnapshotName,
  getProjectName,
  getVolumeSnapshotName,
} from "./operations";
import type { LxdOperation } from "types/operation";

const craftOperation = (...url: string[]) => {
  const images: string[] = [];
  const instances: string[] = [];
  const instances_snapshots: string[] = [];
  const storage_volume_snapshots: string[] = [];
  for (const u of url) {
    const segments = u.split("/");
    if (u.includes("snapshots") && u.includes("storage-pools")) {
      storage_volume_snapshots.push(u);
      continue;
    }

    if (u.includes("snapshots") && u.includes("instances")) {
      instances_snapshots.push(u);
      continue;
    }

    if (u.includes("/1.0/images")) {
      images.push(u);
      continue;
    }

    if (segments.length > 4) {
      instances_snapshots.push(u);
    } else {
      instances.push(u);
    }
  }

  return {
    resources: {
      images,
      instances,
      instances_snapshots,
      storage_volume_snapshots,
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

  it("identifies instance name from an instance creation operation with snapshot as source", () => {
    const operation = craftOperation(
      "/1.0/instances/targetInstanceName",
      "/1.0/instances/sourceInstanceName/testSnap",
    );
    const name = getInstanceName(operation);
    expect(name).toBe("targetInstanceName");
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

  it("identifies project name from an image operation in a custom project", () => {
    const operation = craftOperation(
      "/1.0/images/333449f566531c586d405772afaf9ced7eb9c2ca2f191d487c63b170f62b3172?project=imageProject",
    );
    const name = getProjectName(operation);

    expect(name).toBe("imageProject");
  });
});

describe("getInstanceSnapshotName", () => {
  it("identifies snapshot name from an instance snapshot operation", () => {
    const operation = craftOperation(
      "/1.0/instances/test-instance/snapshots/test-snapshot",
    );
    const name = getInstanceSnapshotName(operation);

    expect(name).toBe("test-snapshot");
  });

  it("identifies snapshot name from an instance snapshot operation in a custom project", () => {
    const operation = craftOperation(
      "/1.0/instances/test-instance/snapshots/test-snapshot?project=project",
    );
    const name = getInstanceSnapshotName(operation);

    expect(name).toBe("test-snapshot");
  });
});

describe("getVolumeSnapshotName", () => {
  it("identifies snapshot name from a volume snapshot operation", () => {
    const operation = craftOperation(
      "/1.0/storage-pools/test-pool/volumes/custom/test-volume/snapshots/test-snapshot",
    );
    const name = getVolumeSnapshotName(operation);

    expect(name).toBe("test-snapshot");
  });

  it("identifies snapshot name from a volume snapshot operation in a custom project", () => {
    const operation = craftOperation(
      "/1.0/storage-pools/test-pool/volumes/custom/test-volume/snapshots/test-snapshot?project=project",
    );
    const name = getVolumeSnapshotName(operation);

    expect(name).toBe("test-snapshot");
  });
});
