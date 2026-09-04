import type { FC } from "react";
import { Button } from "@canonical/react-components";
import type { LxdAuthGroup } from "types/permissions";
import usePanelParams from "util/usePanelParams";
import DsIcon from "components/DsIcon";

interface Props {
  groups: LxdAuthGroup[];
  className?: string;
}

const EditGroupIdentitiesBtn: FC<Props> = ({ groups, className }) => {
  const panelParams = usePanelParams();
  return (
    <>
      <Button
        onClick={() => {
          panelParams.openGroupIdentities();
        }}
        aria-label="Manage identities"
        title="Manage identities"
        className={className}
        disabled={!groups.length}
        hasIcon
      >
        <DsIcon icon="user-group" />
        <span>Manage identities</span>
      </Button>
    </>
  );
};

export default EditGroupIdentitiesBtn;
