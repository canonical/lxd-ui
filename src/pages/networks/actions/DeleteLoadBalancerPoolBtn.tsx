import { useState, type FC } from "react";
import type { LxdNetwork } from "types/network";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import { useNetworkEntitlements } from "util/entitlements/networks";
import ResourceLabel from "components/ResourceLabel";
import { deleteLoadBalancerPool } from "api/load-balancer-pools";
import { useCurrentProject } from "context/useCurrentProject";
import type { LxdLoadBalancerPool } from "types/loadBalancers";

interface Props {
  network: LxdNetwork;
  pool: LxdLoadBalancerPool;
  hasCaption?: boolean;
}

const DeleteLoadBalancerPoolBtn: FC<Props> = ({
  network,
  pool,
  hasCaption = true,
}) => {
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canEditNetwork } = useNetworkEntitlements();
  const { projectName: project } = useCurrentProject();
  const isPoolUsed = (pool.used_by ?? []).length > 0;

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === queryKeys.projects &&
        query.queryKey[1] === project &&
        query.queryKey[2] === queryKeys.networks &&
        query.queryKey[3] === network?.name,
    });
  };

  const onSuccess = () => {
    invalidateCache();
    setLoading(false);
    toastNotify.success(
      <>
        Load balancer pool{" "}
        <ResourceLabel type="load-balancer-pool" value={pool.name} bold />{" "}
        deleted.
      </>,
    );
  };

  const onFailure = (e: unknown) => {
    invalidateCache();
    setLoading(false);
    toastNotify.failure(
      `Deletion of load balancer pool ${pool.name} failed`,
      e,
    );
  };

  const handleDelete = () => {
    setLoading(true);
    deleteLoadBalancerPool(network.name, project, pool.name)
      .then(() => {
        onSuccess();
      })
      .catch((e) => {
        onFailure(e);
      });
  };

  const getHoverText = () => {
    if (isPoolUsed) {
      return "Remove all usages of this pool to delete it";
    }

    if (!canEditNetwork(network)) {
      return "You do not have permission to delete this load balancer pool";
    }

    return `Delete load balancer pool`;
  };

  return (
    <ConfirmationButton
      appearance="base"
      type="button"
      onHoverText={getHoverText()}
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonAppearance: "negative",
        confirmButtonLabel: "Delete",
        children: (
          <p>
            Are you sure you want to delete the load balancer pool{" "}
            <ResourceLabel type="load-balancer-pool" value={pool.name} bold />?
          </p>
        ),
        onConfirm: handleDelete,
      }}
      className="u-no-margin--bottom has-icon"
      loading={isLoading}
      shiftClickEnabled
      showShiftClickHint
      disabled={!canEditNetwork(network) || isLoading || isPoolUsed}
    >
      <Icon name="delete" />
      {hasCaption && <span>Delete pool</span>}
    </ConfirmationButton>
  );
};

export default DeleteLoadBalancerPoolBtn;
