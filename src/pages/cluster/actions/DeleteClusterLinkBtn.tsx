import { useState, type FC } from "react";
import { deleteClusterLink } from "api/cluster-links";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { LxdClusterLink } from "types/cluster";
import ResourceLabel from "components/ResourceLabel";
import { useClusterLinkEntitlements } from "util/entitlements/cluster-links";
import ClusterLinkRichChip from "pages/cluster/ClusterLinkRichChip";
import ClusterLinkUsedBy from "pages/cluster/ClusterLinkUsedBy";
import DsIcon from "components/DsIcon";

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
  const isInUse = Boolean(clusterLink.used_by?.length);

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

  const disabledReason = !canDelete
    ? "You do not have permission to delete this cluster link"
    : undefined;

  return (
    <ConfirmationButton
      appearance="base"
      className="has-icon"
      onHoverText={disabledReason}
      disabled={!canDelete || isLoading}
      loading={isLoading}
      confirmationModalProps={{
        title: isInUse ? "Cannot delete cluster link" : "Confirm delete",
        children: (
          <>
            {isInUse ? (
              <>
                <p>This cluster link is used by:</p>
                <ClusterLinkUsedBy clusterLink={clusterLink} />
              </>
            ) : (
              <p>
                This will permanently delete cluster link{" "}
                <ClusterLinkRichChip clusterLink={clusterLink.name} />.
              </p>
            )}
          </>
        ),
        confirmButtonLabel: "Delete cluster link",
        confirmButtonDisabled: isInUse,
        onConfirm: handleDelete,
        className: "delete-cluster-link-dialog",
      }}
      shiftClickEnabled={!isInUse}
      showShiftClickHint={!isInUse}
    >
      <DsIcon icon="delete" />
    </ConfirmationButton>
  );
};

export default DeleteClusterLinkBtn;
