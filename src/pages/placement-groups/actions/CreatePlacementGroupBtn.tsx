import type { FC } from "react";
import { Button } from "@canonical/react-components";
import {
  smallScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";
import usePanelParams from "util/usePanelParams";
import DsIcon from "components/DsIcon";

interface Props {
  className?: string;
  disabled?: boolean;
}

const CreatePlacementGroupBtn: FC<Props> = ({ className, disabled }) => {
  const isSmallScreen = useIsScreenBelow(smallScreenBreakpoint);
  const panelParams = usePanelParams();
  return (
    <Button
      appearance="positive"
      className={className}
      onClick={panelParams.openCreatePlacementGroup}
      hasIcon={!isSmallScreen}
      disabled={disabled}
    >
      {!isSmallScreen && <DsIcon icon="plus" />}
      <span>Create placement group</span>
    </Button>
  );
};

export default CreatePlacementGroupBtn;
