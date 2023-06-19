import React, { FC, useState } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import { useNavigate } from "react-router-dom";
import { useNotify } from "context/notify";
import ItemName from "components/ItemName";
import { deleteClusterGroup } from "api/cluster";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  group: string;
}

const DeleteClusterGroupBtn: FC<Props> = ({ group }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    setLoading(true);
    deleteClusterGroup(group)
      .then(() => {
        setLoading(false);
        navigate(
          `/ui/cluster`,
          notify.queue(notify.success(`Cluster group ${group} deleted.`))
        );
      })
      .catch((e) => notify.failure("Cluster group deletion failed", e))
      .finally(() => {
        setLoading(false);
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
      toggleAppearance=""
      toggleCaption="Delete cluster group"
      isLoading={isLoading}
      title="Confirm delete"
      confirmMessage={
        <>
          Are you sure you want to delete cluster group{" "}
          <ItemName item={{ name: group }} bold />?{"\n"}This action cannot be
          undone, and can result in data loss.
        </>
      }
      confirmButtonLabel="Delete"
      onConfirm={handleDelete}
      isDisabled={isDefaultGroup}
      isDense={false}
    />
  );
};

export default DeleteClusterGroupBtn;
