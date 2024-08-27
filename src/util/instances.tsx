import { LxdOperationResponse } from "types/operation";
import { getInstanceName } from "./operations";
import InstanceLink from "pages/instances/InstanceLink";
import { ReactNode } from "react";
import {
  AbortControllerState,
  checkDuplicateName,
  getFileExtension,
} from "./helpers";
import * as Yup from "yup";

export const instanceLinkFromName = (args: {
  instanceName: string;
  project?: string;
}): ReactNode => {
  const { project, instanceName } = args;
  return (
    <InstanceLink instance={{ name: instanceName, project: project || "" }} />
  );
};

export const instanceLinkFromOperation = (args: {
  operation?: LxdOperationResponse;
  project?: string;
}): ReactNode | undefined => {
  const { operation, project } = args;
  const linkText = getInstanceName(operation?.metadata);
  if (!linkText) {
    return;
  }
  return <InstanceLink instance={{ name: linkText, project: project || "" }} />;
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
      (value) =>
        oldName === value ||
        checkDuplicateName(value, project, controllerState, "instances"),
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

export const truncateInstanceName = (
  name: string,
  suffix: string = "",
): string => {
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
