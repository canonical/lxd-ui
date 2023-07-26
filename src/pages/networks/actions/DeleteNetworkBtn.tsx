import React, { FC, useState } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import { useNavigate } from "react-router-dom";
import ItemName from "components/ItemName";
import { LxdNetwork } from "types/network";
import { deleteNetwork } from "api/networks";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { useNotify } from "@canonical/react-components";

interface Props {
  network: LxdNetwork;
  project: string;
}

const DeleteNetworkBtn: FC<Props> = ({ network, project }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    setLoading(true);
    deleteNetwork(network.name, project)
      .then(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.networks],
        });
        navigate(
          `/ui/project/${project}/networks`,
          notify.queue(notify.success(`Network ${network.name} deleted.`))
        );
      })
      .catch((e) => notify.failure("Network deletion failed", e))
      .finally(() => setLoading(false));
  };

  const isUsed = (network.used_by?.length ?? 0) > 0;
  const isManaged = network.managed;

  return (
    <ConfirmationButton
      onHoverText={
        !isManaged
          ? "Can not delete, network is not managed"
          : isUsed
          ? "Can not delete, network is currently in use"
          : "Delete network"
      }
      toggleAppearance="bare"
      toggleCaption="Delete network"
      className="u-no-margin--bottom"
      isLoading={isLoading}
      title="Confirm delete"
      confirmMessage={
        <>
          Are you sure you want to delete the network{" "}
          <ItemName item={network} bold />?{"\n"}This action cannot be undone,
          and can result in data loss.
        </>
      }
      confirmButtonLabel="Delete"
      onConfirm={handleDelete}
      isDense={false}
      isDisabled={isUsed || !isManaged}
    />
  );
};

export default DeleteNetworkBtn;
