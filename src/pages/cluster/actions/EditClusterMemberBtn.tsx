import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams, { panels } from "util/usePanelParams";
import classnames from "classnames";
import EditClusterMemberPanel from "pages/cluster/panels/EditClusterMemberPanel";

interface Props {
  member: string;
  hasLabel?: boolean;
  className?: string;
  onClose?: () => void;
}

const EditClusterMemberBtn: FC<Props> = ({
  member,
  hasLabel = false,
  className,
  onClose,
}) => {
  const panelParams = usePanelParams();

  return (
    <>
      <Button
        appearance={hasLabel ? "" : "base"}
        className={classnames(className, "u-no-margin--bottom")}
        onClick={() => {
          panelParams.openEditMember(member);
        }}
        title="Edit cluster member"
        hasIcon
      >
        <Icon name="edit" />
        {hasLabel && <span>Edit</span>}
      </Button>
      {panelParams.panel === panels.editClusterMember &&
        panelParams.member === member && (
          <EditClusterMemberPanel onClose={onClose} />
        )}
    </>
  );
};

export default EditClusterMemberBtn;
