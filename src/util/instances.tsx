import type { LxdOperationResponse } from "types/operation";
import { getInstanceName } from "./operations";
import type { ReactNode } from "react";
import type { AbortControllerState } from "./helpers";
import { checkDuplicateName } from "./helpers";
import * as Yup from "yup";
import InstanceLinkChip from "pages/instances/InstanceLinkChip";
import type { InstanceIconType } from "components/ResourceIcon";
import type { LxdInstance } from "types/instance";
import { useImagesInProject } from "context/useImages";
import ResourceLabel from "components/ResourceLabel";
import ResourceLink from "components/ResourceLink";

export const CLUSTER_GROUP_PREFIX = "@";

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

export const linkForInstanceDetail = (name: string, project?: string) => {
  return `/ui/project/${encodeURIComponent(project ?? "default")}/instance/${encodeURIComponent(name)}`;
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

export const getImageLink = (instance: LxdInstance) => {
  const { data: images = [] } = useImagesInProject(instance.project);
  const imageDescription = instance.config["image.description"];
  const imageFound = images?.some(
    (image) => image.properties?.description === imageDescription,
  );

  if (!imageDescription) {
    return "-";
  }

  if (!imageFound) {
    return <ResourceLabel type="image" value={imageDescription} />;
  }

  return (
    <ResourceLink
      type="image"
      value={imageDescription}
      to={`/ui/project/${encodeURIComponent(instance.project)}/images`}
    />
  );
};
