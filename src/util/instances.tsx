import { LxdOperationResponse } from "types/operation";
import { getInstanceName } from "./operations";
import InstanceLink from "pages/instances/InstanceLink";
import { ReactNode } from "react";

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
