import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteClusterGroup } from "api/cluster-groups";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useServerEntitlements } from "util/entitlements/server";
import { ROOT_PATH } from "util/rootPath";

interface Props {
  group: string;
}

const DeleteClusterGroupBtn: FC<Props> = ({ group }) => {
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canEditServerConfiguration } = useServerEntitlements();

  const hasPermission = canEditServerConfiguration();

  const handleDelete = () => {
    setLoading(true);
    deleteClusterGroup(group)
      .then(() => {
        navigate(`${ROOT_PATH}/ui/cluster/groups`);
        toastNotify.success(
          <>
            Cluster group{" "}
            <ResourceLabel type="cluster-group" value={group} bold /> deleted.
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        toastNotify.failure("Cluster group deletion failed", e);
      })
      .finally(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.cluster, queryKeys.groups],
        });
      });
  };

  const isDefaultGroup = group === "default";
  const getHoverText = () => {
    if (isDefaultGroup) {
      return "The default cluster group cannot be deleted";
    }
    if (!hasPermission) {
      return "You do not have permission to delete cluster groups";
    }
    return "Delete group";
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      appearance="base"
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete cluster group{" "}
            <ResourceLabel type="cluster-group" value={group} bold />.
          </p>
        ),
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      disabled={isDefaultGroup || isLoading || !hasPermission}
      shiftClickEnabled
      showShiftClickHint
      title="Delete group"
      className="has-icon"
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteClusterGroupBtn;
