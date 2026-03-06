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

interface Props {
  clusterLink: LxdClusterLink;
}

const DeleteClusterLinkBtn: FC<Props> = ({ clusterLink }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

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
        setLoading(false);
        notify.failure("Cluster link deletion failed", e);
      })
      .finally(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.cluster, queryKeys.links],
        });
      });
  };

  return (
    <ConfirmationButton
      appearance="base"
      title="Delete cluster link"
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete cluster link{" "}
            <ResourceLabel type="cluster-link" value={clusterLink.name} bold />.
          </p>
        ),
        confirmButtonLabel: "Delete",
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
