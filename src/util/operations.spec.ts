import {
  getInstanceName,
  getInstanceSnapshotName,
  getProjectName,
  getVolumeSnapshotName,
  isCreatingInstance,
} from "./operations";
import type { LxdOperation } from "types/operation";

const craftOperation = (
  resourceUrls: string[] = [],
  entityUrl?: string,
  originalEntityUrl?: string,
) => {
  const images: string[] = [];
  const instances: string[] = [];
  const instances_snapshots: string[] = [];
  const storage_volume_snapshots: string[] = [];
  for (const u of resourceUrls) {
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
    metadata: {
      entity_url: entityUrl ? entityUrl : undefined,
      original_entity_url: originalEntityUrl ? originalEntityUrl : undefined,
    },
    resources: {
      images,
      instances,
      instances_snapshots,
      storage_volume_snapshots,
    },
  } as unknown as LxdOperation;
};

describe("getInstanceName", () => {
  it("identifies instance name from an instance operation using resources field", () => {
    const operation = craftOperation(["/1.0/instances/testInstance1"]);
    const name = getInstanceName(operation);

    expect(name).toBe("testInstance1");
  });

  it("identifies instance name from an instance operation using entity_url field", () => {
    const operation = craftOperation([], "/1.0/instances/testInstance1");
    const name = getInstanceName(operation);

    expect(name).toBe("testInstance1");
  });

  it("identifies instance name from an instance operation in a custom project", () => {
    const operation = craftOperation(
      [],
      "/1.0/instances/testInstance2?project=project",
    );
    const name = getInstanceName(operation);

    expect(name).toBe("testInstance2");
  });

  it("identifies instance name from an instance creation operation with snapshot as source", () => {
    const operation = craftOperation(
      [
        "/1.0/instances/targetInstanceName",
        "/1.0/instances/sourceInstanceName/testSnap",
      ],
      "/1.0/instances/targetInstanceName",
    );
    const name = getInstanceName(operation);
    expect(name).toBe("targetInstanceName");
  });

  it("identifies the new instance name from an instance copy operation", () => {
    const operation = craftOperation(
      ["/1.0/instances/sourceInstance?project=default"],
      "/1.0/instances/copiedInstance?project=default",
    );
    const name = getInstanceName(operation);

    expect(name).toBe("copiedInstance");
  });

  it("identifies original instance name from an instance rename operation using original_entity_url field", () => {
    const operation = craftOperation(
      [],
      undefined,
      "/1.0/instances/testInstance1",
    );
    const name = getInstanceName(operation);

    expect(name).toBe("testInstance1");
  });
});

describe("getProjectName", () => {
  it("identifies project name from an instance operation when no project parameter is present", () => {
    const operation = craftOperation([], "/1.0/instances/testInstance1");
    const name = getProjectName(operation);

    expect(name).toBe("default");
  });

  it("identifies project name from an instance operation in a custom project", () => {
    const operation = craftOperation(
      [],
      "/1.0/instances/testInstance2?project=fooProject",
    );
    const name = getProjectName(operation);

    expect(name).toBe("fooProject");
  });

  it("identifies project name from an instance operation in a custom project with other parameters", () => {
    const operation = craftOperation(
      [],
      "/1.0/instances/testInstance2?foo=bar&project=barProject",
    );
    const name = getProjectName(operation);

    expect(name).toBe("barProject");
  });

  it("identifies project name from an image operation in a custom project", () => {
    const operation = craftOperation(
      [],
      "/1.0/images/333449f566531c586d405772afaf9ced7eb9c2ca2f191d487c63b170f62b3172?project=imageProject",
    );
    const name = getProjectName(operation);

    expect(name).toBe("imageProject");
  });
});

describe("getInstanceSnapshotName", () => {
  it("identifies snapshot name from an instance snapshot operation using resources field", () => {
    const operation = craftOperation([
      "/1.0/instances/test-instance/snapshots/test-snapshot",
    ]);
    const name = getInstanceSnapshotName(operation);

    expect(name).toBe("test-snapshot");
  });

  it("identifies snapshot name from an instance snapshot operation using entity_url field", () => {
    const operation = craftOperation(
      [],
      "/1.0/instances/test-instance/snapshots/test-snapshot",
    );
    const name = getInstanceSnapshotName(operation);

    expect(name).toBe("test-snapshot");
  });

  it("identifies snapshot name from an instance snapshot operation in a custom project", () => {
    const operation = craftOperation(
      [],
      "/1.0/instances/test-instance/snapshots/test-snapshot?project=project",
    );
    const name = getInstanceSnapshotName(operation);

    expect(name).toBe("test-snapshot");
  });
});

describe("getVolumeSnapshotName", () => {
  it("identifies snapshot name from a volume snapshot operation using resources field", () => {
    const operation = craftOperation([
      "/1.0/storage-pools/test-pool/volumes/custom/test-volume/snapshots/test-snapshot",
    ]);
    const name = getVolumeSnapshotName(operation);

    expect(name).toBe("test-snapshot");
  });

  it("identifies snapshot name from a volume snapshot operation using entity_url field", () => {
    const operation = craftOperation(
      [],
      "/1.0/storage-pools/test-pool/volumes/custom/test-volume/snapshots/test-snapshot",
    );
    const name = getVolumeSnapshotName(operation);

    expect(name).toBe("test-snapshot");
  });

  it("identifies snapshot name from a volume snapshot operation in a custom project", () => {
    const operation = craftOperation(
      [],
      "/1.0/storage-pools/test-pool/volumes/custom/test-volume/snapshots/test-snapshot?project=project",
    );
    const name = getVolumeSnapshotName(operation);

    expect(name).toBe("test-snapshot");
  });
});

describe("isCreatingInstance", () => {
  const withDescription = (description: string) =>
    ({ description }) as LxdOperation;

  it("detects instance creation", () => {
    expect(isCreatingInstance(withDescription("Creating instance"))).toBe(true);
  });

  it("detects instance and snapshot copies, which create a new instance", () => {
    expect(isCreatingInstance(withDescription("Copying instance"))).toBe(true);
    expect(isCreatingInstance(withDescription("Copying snapshot"))).toBe(true);
  });

  it("ignores other operations", () => {
    expect(isCreatingInstance(withDescription("Starting instance"))).toBe(
      false,
    );
    expect(isCreatingInstance(withDescription("Copying storage volume"))).toBe(
      false,
    );
  });
});
