import { LxdOperation } from "types/operation";

export const getInstanceName = (operation?: LxdOperation): string => {
  // the url can be one of below formats
  // /1.0/instances/<instance_name>
  // /1.0/instances/<instance_name>?project=<project_name>
  // /1.0/instances/<instance_name>/snapshots/<snapshot_name>
  return (
    operation?.resources?.instances
      ?.filter((item) => item.startsWith("/1.0/instances/"))
      .map((item) => item.split("/")[3])
      .pop()
      ?.split("?")[0] ?? ""
  );
};

export const getProjectName = (operation: LxdOperation): string => {
  // the url can be
  // /1.0/instances/<instance_name>?project=<project_name>
  // /1.0/instances/<instance_name>?other=params&project=<project_name>
  // /1.0/instances/testInstance1?other=params&project=<project_name>&other=params
  // when no project parameter is present, the project will be "default"

  return (
    operation.resources?.instances
      ?.filter((item) => item.startsWith("/1.0/instances/"))
      .map((item) => item.split("project=")[1])
      .pop()
      ?.split("&")[0] ?? "default"
  );
};
