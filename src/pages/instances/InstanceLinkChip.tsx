import type { FC } from "react";
import type { LxdInstance } from "types/instance";
import ResourceLink from "components/ResourceLink";
import type { InstanceIconType } from "components/ResourceIcon";
import { linkForInstanceDetail } from "util/instances";

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
      to={linkForInstanceDetail(instance.name, instance.project)}
    />
  );
};

export default InstanceLinkChip;
