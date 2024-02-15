import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemName from "components/ItemName";
import { deleteClusterGroup } from "api/cluster";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationButton, useNotify } from "@canonical/react-components";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  group: string;
}

const DeleteClusterGroupBtn: FC<Props> = ({ group }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteClusterGroup(group)
      .then(() => {
        navigate(`/ui/cluster`);
        toastNotify.success(`Cluster group ${group} deleted.`);
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Cluster group deletion failed", e);
      })
      .finally(() => {
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.cluster, queryKeys.groups],
        });
      });
  };

  const isDefaultGroup = group === "default";
  const getHoverText = () => {
    if (isDefaultGroup) {
      return "The default cluster group cannot be deleted";
    }
    return "Delete cluster group";
  };

  return (
    <ConfirmationButton
      onHoverText={getHoverText()}
      appearance=""
      loading={isLoading}
      confirmationModalProps={{
        title: "Confirm delete",
        confirmMessage: (
          <p>
            This will permanently delete cluster group{" "}
            <ItemName item={{ name: group }} bold />. <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      disabled={isDefaultGroup}
      shiftClickEnabled
      showShiftClickHint
    >
      <span>Delete cluster group</span>
    </ConfirmationButton>
  );
};

export default DeleteClusterGroupBtn;
