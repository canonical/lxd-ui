import type { FC } from "react";
import { Button, Icon } from "@canonical/react-components";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useNetworkEntitlements } from "util/entitlements/networks";
import usePanelParams from "util/usePanelParams";
import type { LxdNetwork } from "types/network";
import classnames from "classnames";
import { useNavigate } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  network: LxdNetwork;
  className?: string;
}

const CreateNetworkForwardBtn: FC<Props> = ({ network, className }) => {
  const isSmallScreen = useIsScreenBelow();
  const { canEditNetwork } = useNetworkEntitlements();
  const panelParams = usePanelParams();
  const navigate = useNavigate();

  return (
    <Button
      appearance="positive"
      hasIcon={!isSmallScreen}
      onClick={() => {
        navigate(
          `${ROOT_PATH}/ui/project/${encodeURIComponent(panelParams.project)}/network/${encodeURIComponent(network.name)}/forwards/create`,
        );
      }}
      className={classnames(
        "p-button--positive u-no-margin--bottom",
        className,
      )}
      disabled={!canEditNetwork(network)}
      title={
        canEditNetwork(network)
          ? "Create forward"
          : "You do not have permission to create network forwards for this network"
      }
    >
      {!isSmallScreen && <Icon name="plus" light />}
      <span>Create forward</span>
    </Button>
  );
};

export default CreateNetworkForwardBtn;
