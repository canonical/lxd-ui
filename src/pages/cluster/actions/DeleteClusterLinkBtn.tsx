import { useState, type FC } from "react";
import { deleteClusterLink } from "api/cluster-links";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { LxdClusterLink } from "types/cluster";
import ResourceLabel from "components/ResourceLabel";
import { useClusterLinkEntitlements } from "util/entitlements/cluster-links";
import ClusterLinkRichChip from "pages/cluster/ClusterLinkRichChip";

interface Props {
  clusterLink: LxdClusterLink;
}

const DeleteClusterLinkBtn: FC<Props> = ({ clusterLink }) => {
  const { canDeleteClusterLink } = useClusterLinkEntitlements();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const canDelete = canDeleteClusterLink(clusterLink);

  const handleDelete = () => {
    setLoading(true);
    deleteClusterLink(clusterLink.name)
      .then(() => {
        toastNotify.success(
          <>
            Cluster link{" "}
            <ResourceLabel type="cluster-link" value={clusterLink.name} />{" "}
            deleted.
          </>,
        );
      })
      .catch((e) => {
        notify.failure("Cluster link deletion failed", e);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.cluster, queryKeys.links],
        });
      });
  };

  const disabledReason = () => {
    if (clusterLink.used_by?.length) {
      return `Cannot delete this cluster link as it is currently in use.`;
    }
    if (!canDelete) {
      return "You do not have permission to delete this cluster link";
    }
    return undefined;
  };

  return (
    <ConfirmationButton
      appearance="base"
      className="has-icon"
      onHoverText={disabledReason()}
      disabled={Boolean(disabledReason())}
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete cluster link{" "}
            <ClusterLinkRichChip clusterLink={clusterLink.name} />.
          </p>
        ),
        confirmButtonLabel: "Delete cluster link",
        onConfirm: handleDelete,
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteClusterLinkBtn;
