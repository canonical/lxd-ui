import { LxdOperation } from "types/operation";

export const getInstanceName = (operation: LxdOperation): string => {
  // the url can be one of below formats
  // /1.0/instances/<instance_name>
  // /1.0/instances/<instance_name>?project=<project_name>
  // /1.0/instances/<instance_name>/snapshots/<snapshot_name>
  return (
    operation.resources?.instances
      ?.filter((item) => item.startsWith("/1.0/instances/"))
      .map((item) => item.split("/")[3])
      .pop()
      ?.split("?")[0] ?? ""
  );
};
