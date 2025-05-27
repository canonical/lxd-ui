import type { LxdOperationResponse } from "types/operation";
import { getInstanceName } from "./operations";
import type { ReactNode } from "react";
import type { AbortControllerState } from "./helpers";
import { checkDuplicateName } from "./helpers";
import * as Yup from "yup";
import InstanceLinkChip from "pages/instances/InstanceLinkChip";
import type { InstanceIconType } from "components/ResourceIcon";
import type { LxdInstance } from "types/instance";

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

export const getInstanceKey = (instance: LxdInstance) => {
  return `${instance.name} ${instance.project}`;
};
