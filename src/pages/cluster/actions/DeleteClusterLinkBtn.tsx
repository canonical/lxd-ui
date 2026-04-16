import type { FC } from "react";
import { useState } from "react";
import { deleteClusterLink } from "api/cluster-links";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import type { LxdClusterLink } from "types/cluster";
import ResourceLabel from "components/ResourceLabel";
import { ROOT_PATH } from "util/rootPath";
import { useClusterLinkEntitlements } from "util/entitlements/cluster-links";

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
            <ResourceLink
              type="cluster-link"
              value={clusterLink.name}
              to={`${ROOT_PATH}/ui/cluster/links`}
            />{" "}
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

  return (
    <ConfirmationButton
      appearance="base"
      className="has-icon"
      title="Delete cluster link"
      disabled={!canDelete}
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete cluster link{" "}
            <ResourceLabel type="cluster-link" value={clusterLink.name} bold />.
          </p>
        ),
        confirmButtonLabel: canDelete
          ? "Delete cluster link"
          : "You do not have permission to delete this cluster link",
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
