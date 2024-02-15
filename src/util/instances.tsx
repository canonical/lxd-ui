import { LxdOperationResponse } from "types/operation";
import { getInstanceName } from "./operations";
import InstanceLink from "pages/instances/InstanceLink";

export const instanceLinkFromName = (args: {
  instanceName: string;
  project?: string;
}) => {
  const { project, instanceName } = args;
  return (
    <InstanceLink instance={{ name: instanceName, project: project || "" }} />
  );
};

export const instanceLinkFromOperation = (args: {
  operation?: LxdOperationResponse;
  project?: string;
}) => {
  const { operation, project } = args;
  const linkText = getInstanceName(operation?.metadata);
  if (!linkText) {
    return;
  }
  return <InstanceLink instance={{ name: linkText, project: project || "" }} />;
};
