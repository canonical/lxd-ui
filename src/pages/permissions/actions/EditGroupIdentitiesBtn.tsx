import { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { LxdGroup } from "types/permissions";
import usePanelParams from "util/usePanelParams";

interface Props {
  groups: LxdGroup[];
  className?: string;
}

const EditGroupIdentitiesBtn: FC<Props> = ({ groups, className }) => {
  const panelParams = usePanelParams();
  return (
    <>
      <Button
        onClick={() => panelParams.openGroupIdentities()}
        aria-label="Manage identities"
        title="Manage identities"
        className={className}
        disabled={!groups.length}
        hasIcon
      >
        <Icon name="user-group" />
        <span>Manage identities</span>
      </Button>
    </>
  );
};

export default EditGroupIdentitiesBtn;
