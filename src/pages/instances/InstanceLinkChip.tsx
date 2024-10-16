import { FC } from "react";
import { LxdInstance } from "types/instance";
import ResourceLink from "components/ResourceLink";
import { PartialWithRequired } from "types/partial";

interface Props {
  instance: PartialWithRequired<LxdInstance, "type" | "name" | "project">;
}

const InstanceLinkChip: FC<Props> = ({ instance }) => {
  return (
    <ResourceLink
      type={instance.type}
      value={instance.name}
      to={`/ui/project/${instance.project}/instance/${instance.name}`}
    />
  );
};

export default InstanceLinkChip;
