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
import ResourceLink from "components/ResourceLink";
import NetworkRichChip from "../NetworkRichChip";

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
  const networkURL = `/ui/project/${encodeURIComponent(projectName)}/network/${encodeURIComponent(network.name)}`;

  const onSuccess = () => {
    toastNotify.success(
      <>
        Local peering <ResourceLabel type="peering" value={localPeering} bold />{" "}
        deleted for network{" "}
        <NetworkRichChip networkName={network.name} projectName={projectName} />
      </>,
    );
  };

  const handleDelete = () => {
    setLoading(true);
    deleteNetworkPeer(network.name, projectName, localPeering)
      .then(onSuccess)
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
            This will permanently delete the local peering{" "}
            <ResourceLink
              type="peering"
              value={localPeering}
              to={`${networkURL}/local-peerings`}
            />{" "}
            for network{" "}
            <NetworkRichChip
              networkName={network.name}
              projectName={projectName}
            />
            .<br />
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
