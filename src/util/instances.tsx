import { checkDuplicateName, type AbortControllerState } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import * as Yup from "yup";
import type { LxdInstance } from "types/instance";
import { instanceCreationTypes } from "./instanceOptions";
import { getInstanceLocation } from "./instanceLocation";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";

export const CLUSTER_GROUP_PREFIX = "@";

export const getInstanceDetailUrl = (name: string, project?: string) => {
  return `${ROOT_PATH}/ui/project/${encodeURIComponent(project ?? "default")}/instance/${encodeURIComponent(name)}`;
};

export const instanceNameValidation = (
  project: string,
  controllerState: AbortControllerState,
  oldName?: string,
): Yup.StringSchema =>
  Yup.string()
    .test(
      "deduplicate",
      "An instance with this name already exists",
      async (value, context) => {
        // in some cases like copy instance or create instance from snapshot
        // we let the user choose a target project in the form. We should use
        // the target project instead of the current project in those cases.
        const targetProject =
          (context.parent as { targetProject?: string }).targetProject ??
          project;

        return (
          oldName === value ||
          checkDuplicateName(value, targetProject, controllerState, "instances")
        );
      },
    )
    .test(
      "size",
      "Instance name must be between 1 and 63 characters",
      (value) => !value || value.length < 64,
    )
    .matches(/^[A-Za-z0-9-]+$/, {
      message: "Only alphanumeric and hyphen characters are allowed",
    })
    .matches(/^[A-Za-z].*$/, {
      message: "Instance name must start with a letter",
    });

export const getInstanceKey = (instance: LxdInstance) => {
  return `${instance.name} ${instance.project}`;
};

export const getInstanceMacAddresses = (instance: LxdInstance) => {
  const hwaddrs = [];

  for (const [key, value] of Object.entries(instance.config)) {
    if (
      key.startsWith("volatile.") &&
      key.endsWith(".hwaddr") &&
      key.split(".").length === 3 &&
      value
    ) {
      hwaddrs.push(value);
    }
  }
  return hwaddrs;
};

export const getInstanceType = (instance: LxdInstance) => {
  return instanceCreationTypes.find((item) => item.value === instance.type)
    ?.label;
};

export const getInstanceClusterMember = (
  formik: InstanceAndProfileFormikProps,
) => {
  const location = getInstanceLocation(formik);
  if (!location || location === "any") {
    return undefined;
  }
  const isClusterGroup = location?.startsWith(CLUSTER_GROUP_PREFIX);
  if (isClusterGroup) {
    return undefined;
  }
  return location;
};

export const getFileExplorerDirectoryURL = (
  fullPath: string,
  instance: LxdInstance,
) => {
  const params = new URLSearchParams();
  params.set("project", instance.project);
  params.set("path", fullPath);

  return `${ROOT_PATH}/ui/project/${encodeURIComponent(instance.project)}/instance/${encodeURIComponent(instance.name)}/file-explorer?${params.toString()}`;
};

export const getFileExplorerURL = (
  parentPath: string,
  fileName: string | undefined,
  instance: LxdInstance,
) => {
  const params = new URLSearchParams();
  params.set("project", instance.project);

  if (!fileName) {
    params.set("path", parentPath);
    return `${ROOT_PATH}/1.0/instances/${encodeURIComponent(instance.name)}/files?${params.toString()}`;
  }

  const path = getFullPath(parentPath, fileName);
  params.set("path", path);
  return `${ROOT_PATH}/1.0/instances/${encodeURIComponent(instance.name)}/files?${params.toString()}`;
};

export const validateDirectoryPathSyntax = (
  path: string,
): string | undefined => {
  if (!path.startsWith("/")) {
    return "Path must start with /";
  }

  const segments = path.split("/").filter(Boolean);
  for (const segment of segments) {
    if (segment === "." || segment === "..") {
      return "Relative path segments . and .. are not allowed.";
    }
  }

  return undefined;
};

export const getFullPath = (parentPath: string, fileName: string): string => {
  return parentPath === "/" ? `/${fileName}` : `${parentPath}/${fileName}`;
};

export const resolveSymlinkTarget = (
  target: string,
  currentPath: string,
): string => {
  if (target.startsWith("/")) {
    return target;
  }
  const parentDir =
    currentPath.substring(0, currentPath.lastIndexOf("/")) || "/";
  const combined = getFullPath(parentDir, target);
  const parts = combined.split("/");
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "..") {
      resolved.pop();
    } else if (part !== "." && part !== "") {
      resolved.push(part);
    }
  }
  return "/" + resolved.join("/");
};
