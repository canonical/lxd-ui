import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import usePanelParams from "util/usePanelParams";

interface Props {
  group: string;
}

const EditClusterGroupBtn: FC<Props> = ({ group }) => {
  const panelParams = usePanelParams();

  return (
    <Button
      appearance="base"
      className="u-no-margin--bottom"
      onClick={() => {
        panelParams.openEditClusterGroup(group);
      }}
      title="Edit group"
      hasIcon
    >
      <Icon name="edit" />
    </Button>
  );
};

export default EditClusterGroupBtn;
