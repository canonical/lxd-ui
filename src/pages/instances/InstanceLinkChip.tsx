import { FC } from "react";
import { LxdInstance } from "types/instance";
import ResourceLink from "components/ResourceLink";
import { InstanceIconType } from "components/ResourceIcon";

interface Props {
  instance: Partial<Omit<LxdInstance, "type">> & {
    name: string;
    type: InstanceIconType;
  };
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
