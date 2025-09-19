import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams, { panels } from "util/usePanelParams";
import classnames from "classnames";
import EditClusterMemberPanel from "pages/cluster/panels/EditClusterMemberPanel";
import { useServerEntitlements } from "util/entitlements/server";

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
  const { canEditServerConfiguration } = useServerEntitlements();

  const hasPermission = canEditServerConfiguration();

  return (
    <>
      <Button
        appearance={hasLabel ? "" : "base"}
        className={classnames(className, "u-no-margin--bottom")}
        disabled={!hasPermission}
        onClick={() => {
          panelParams.openEditMember(member);
        }}
        title={
          hasPermission
            ? "Edit cluster member"
            : "You do not have permission to edit cluster members"
        }
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
