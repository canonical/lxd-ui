import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";
import type { LxdClusterMember } from "types/cluster";
import classnames from "classnames";

interface Props {
  member: LxdClusterMember;
  hasLabel?: boolean;
  className?: string;
}

const EditClusterMemberBtn: FC<Props> = ({
  member,
  hasLabel = false,
  className,
}) => {
  const panel = usePanelParams();

  return (
    <Button
      appearance={hasLabel ? "" : "base"}
      className={classnames(className, "u-no-margin--bottom")}
      onClick={() => {
        panel.openEditMember(member.server_name);
      }}
      title="Edit cluster member"
      hasIcon
    >
      <Icon name="edit" />
      {hasLabel && <span>Edit</span>}
    </Button>
  );
};

export default EditClusterMemberBtn;
