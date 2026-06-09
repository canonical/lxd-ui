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
import { useEventQueue } from "context/eventQueue";
import { deleteLoadBalancer } from "api/load-balancers";
import type { LxdLoadBalancer } from "types/loadBalancers";

interface Props {
  network: LxdNetwork;
  loadBalancer: LxdLoadBalancer;
  project: string;
}

const DeleteLoadBalancerBtn: FC<Props> = ({
  network,
  loadBalancer,
  project,
}) => {
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const { canEditNetwork } = useNetworkEntitlements();
  const eventQueue = useEventQueue();

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === queryKeys.projects &&
        query.queryKey[1] === project &&
        query.queryKey[2] === queryKeys.networks &&
        query.queryKey[3] === network.name,
    });
  };

  const onSuccess = () => {
    invalidateCache();
    setLoading(false);
    toastNotify.success(
      <>
        Load balancer with listen address{" "}
        <ResourceLabel
          type="load-balancer"
          value={loadBalancer.listen_address}
          bold
        />{" "}
        deleted.
      </>,
    );
  };

  const onFailure = (e: unknown) => {
    invalidateCache();
    setLoading(false);
    toastNotify.failure(
      `Deletion of load balancer with listen address ${loadBalancer.listen_address} failed`,
      e,
    );
  };

  const handleDelete = () => {
    setLoading(true);
    deleteLoadBalancer(network.name, project, loadBalancer)
      .then((operation) => {
        toastNotify.info(
          <>
            Deletion of load balancer with listen address{" "}
            <ResourceLabel
              bold
              type="load-balancer"
              value={loadBalancer.listen_address}
            />{" "}
            has started.
          </>,
        );
        eventQueue.set(
          operation.metadata.id,
          () => {
            onSuccess();
          },
          (msg) => {
            onFailure(new Error(msg));
          },
        );
      })
      .catch((e) => {
        onFailure(e);
      });
  };

  return (
    <ConfirmationButton
      appearance="base"
      onHoverText={
        canEditNetwork(network)
          ? "Delete load balancer"
          : "You do not have permission to delete this load balancer"
      }
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonAppearance: "negative",
        confirmButtonLabel: "Delete",
        children: (
          <p>
            Are you sure you want to delete the load balancer with listen
            address{" "}
            <ResourceLabel
              type="load-balancer"
              value={loadBalancer.listen_address}
              bold
            />
            ?
          </p>
        ),
        onConfirm: handleDelete,
      }}
      className="u-no-margin--bottom has-icon"
      loading={isLoading}
      shiftClickEnabled
      showShiftClickHint
      disabled={!canEditNetwork(network) || isLoading}
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteLoadBalancerBtn;
