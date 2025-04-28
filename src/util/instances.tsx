import type { LxdOperationResponse } from "types/operation";
import { getInstanceName } from "./operations";
import type { ReactNode } from "react";
import type { AbortControllerState } from "./helpers";
import { checkDuplicateName, getFileExtension } from "./helpers";
import * as Yup from "yup";
import InstanceLinkChip from "pages/instances/InstanceLinkChip";
import type { InstanceIconType } from "components/ResourceIcon";

export const instanceLinkFromOperation = (args: {
  operation?: LxdOperationResponse;
  project?: string;
  instanceType: InstanceIconType;
}): ReactNode | undefined => {
  const { operation, project, instanceType } = args;
  const linkText = getInstanceName(operation?.metadata);
  if (!linkText) {
    return;
  }
  return (
    <InstanceLinkChip
      instance={{
        name: linkText,
        project: project || "default",
        type: instanceType,
      }}
    />
  );
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

export const truncateInstanceName = (name: string, suffix = ""): string => {
  const instanceNameMaxLength = 63;
  if (name.length > instanceNameMaxLength - suffix.length) {
    name = name.slice(0, instanceNameMaxLength - suffix.length);
  }

  return name + suffix;
};

export const sanitizeInstanceName = (name: string): string => {
  return name.replace(/[^A-Za-z0-9-]/g, "-");
};

export const fileToInstanceName = (
  fileName: string,
  suffix?: string,
): string => {
  const fileExtension = getFileExtension(fileName);
  fileName = fileExtension ? fileName.replace(fileExtension, "") : fileName;
  const sanitisedFileName = sanitizeInstanceName(fileName);
  const instanceName = truncateInstanceName(sanitisedFileName, suffix);
  return instanceName;
};
