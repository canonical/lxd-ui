import React, { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemName from "components/ItemName";
import { LxdNetwork } from "types/network";
import { deleteNetwork } from "api/networks";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationButton, useNotify } from "@canonical/react-components";

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
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.networks],
        });
        navigate(
          `/ui/project/${project}/networks`,
          notify.queue(notify.success(`Network ${network.name} deleted.`)),
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Network deletion failed", e);
      });
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
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonAppearance: "negative",
        confirmButtonLabel: "Delete",
        children: (
          <p>
            Are you sure you want to delete the network{" "}
            <ItemName item={network} bold />?<br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        onConfirm: handleDelete,
      }}
      className="u-no-margin--bottom"
      loading={isLoading}
      disabled={isUsed || !isManaged}
      shiftClickEnabled
      showShiftClickHint
    >
      Delete network
    </ConfirmationButton>
  );
};

export default DeleteNetworkBtn;
