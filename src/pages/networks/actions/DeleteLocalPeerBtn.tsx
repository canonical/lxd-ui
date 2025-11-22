import type { FC } from "react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useCurrentProject } from "context/useCurrentProject";
import ResourceLabel from "components/ResourceLabel";
import type { LxdNetwork } from "types/network";
import { useNetworkEntitlements } from "util/entitlements/networks";
import { deleteNetworkPeer } from "api/network-local-peering";

interface Props {
  network: LxdNetwork;
  localPeering: string;
}

const DeleteLocalPeerBtn: FC<Props> = ({ network, localPeering }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canEditNetwork } = useNetworkEntitlements();
  const { project } = useCurrentProject();
  const projectName = project?.name || "";
  const toastNotify = useToastNotification();

  const onFinish = () => {
    toastNotify.success(
      <>
        Local peering <ResourceLabel type={"peering"} value={localPeering} />{" "}
        deleted for network{" "}
        <ResourceLabel bold type="network" value={network.name} />.
      </>,
    );
  };

  const handleDelete = () => {
    setLoading(true);
    deleteNetworkPeer(network.name, projectName, localPeering)
      .then(onFinish)
      .catch((e) => {
        notify.failure("Local peering deletion failed", e);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [
            queryKeys.projects,
            projectName,
            queryKeys.networks,
            network.name,
            queryKeys.peers,
          ],
        });
      });
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete local peering{" "}
            <ResourceLabel type={"peering"} value={localPeering} /> .
            <br /> for network{" "}
            <ResourceLabel bold type="network" value={network.name} />. This
            action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      appearance="base"
      className="has-icon"
      shiftClickEnabled
      showShiftClickHint
      disabled={!canEditNetwork(network)}
      onHoverText={
        canEditNetwork(network)
          ? "Delete local peering"
          : "You do not have permission to delete this local peering."
      }
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteLocalPeerBtn;
