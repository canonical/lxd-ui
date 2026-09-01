import type { FC } from "react";
import { Button } from "@canonical/react-components";
import {
  mediumScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";
import { useNetworkEntitlements } from "util/entitlements/networks";
import type { LxdNetwork } from "types/network";
import classnames from "classnames";
import { useNavigate } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";
import { useCurrentProject } from "context/useCurrentProject";
import DsIcon from "components/DsIcon";

interface Props {
  network: LxdNetwork;
  className?: string;
}

const CreateNetworkForwardBtn: FC<Props> = ({ network, className }) => {
  const isMediumScreen = useIsScreenBelow(mediumScreenBreakpoint);
  const { canEditNetwork } = useNetworkEntitlements();
  const { projectName: project } = useCurrentProject();
  const navigate = useNavigate();

  return (
    <Button
      appearance="positive"
      hasIcon={!isMediumScreen}
      onClick={() => {
        navigate(
          `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/forwards/create`,
        );
      }}
      className={classnames(
        "p-button--positive u-no-margin--bottom network-create-action-btn",
        className,
      )}
      disabled={!canEditNetwork(network)}
      title={
        canEditNetwork(network)
          ? "Create forward"
          : "You do not have permission to create network forwards for this network"
      }
    >
      {!isMediumScreen && <DsIcon icon="plus" />}
      <span>{isMediumScreen ? "Create" : "Create forward"}</span>
    </Button>
  );
};

export default CreateNetworkForwardBtn;
