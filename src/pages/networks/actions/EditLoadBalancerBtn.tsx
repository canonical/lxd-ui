import type { FC } from "react";
import { Button } from "@canonical/react-components";
import type { LxdNetwork } from "types/network";
import { useNetworkEntitlements } from "util/entitlements/networks";
import { Link } from "react-router-dom";
import { ROOT_PATH } from "util/rootPath";
import type { LxdLoadBalancer } from "types/loadBalancers";
import { isLegacyLoadBalancer } from "util/loadBalancers";
import DsIcon from "components/DsIcon";

interface Props {
  network: LxdNetwork;
  loadBalancer: LxdLoadBalancer;
  project: string;
}

const EditLoadBalancerBtn: FC<Props> = ({ network, loadBalancer, project }) => {
  const { canEditNetwork } = useNetworkEntitlements();
  const isLegacy = isLegacyLoadBalancer(loadBalancer);

  if (!canEditNetwork(network) || isLegacy) {
    return (
      <Button
        key="edit"
        appearance="base"
        className="u-no-margin--bottom"
        dense
        hasIcon
        type="button"
        title={
          isLegacy
            ? "Legacy backend configurations are read-only."
            : "You do not have permission to edit load balancers for this network"
        }
        disabled
      >
        <DsIcon icon="edit" />
      </Button>
    );
  }

  return (
    <Link
      className="p-button--base u-no-margin--bottom has-icon"
      to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}/load-balancers/${encodeURIComponent(loadBalancer.listen_address)}/edit`}
      title="Edit load balancer"
    >
      <DsIcon icon="edit" />
    </Link>
  );
};

export default EditLoadBalancerBtn;
