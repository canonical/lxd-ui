import { FC, useState } from "react";
import { LxdNetwork, LxdNetworkForward } from "types/network";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { deleteNetworkForward } from "api/network-forwards";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  network: LxdNetwork;
  forward: LxdNetworkForward;
  project: string;
}

const DeleteNetworkForwardBtn: FC<Props> = ({ network, forward, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    deleteNetworkForward(network, forward, project)
      .then(() => {
        toastNotify.success(
          `Network forward for ${forward.listen_address} deleted`,
        );
        void queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.projects &&
            query.queryKey[1] === project &&
            query.queryKey[2] === queryKeys.networks &&
            query.queryKey[3] === network.name,
        });
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Network forward deletion failed", e);
      });
  };

  return (
    <ConfirmationButton
      appearance="base"
      onHoverText="Delete network forward"
      confirmationModalProps={{
        title: "Confirm delete",
        confirmButtonAppearance: "negative",
        confirmButtonLabel: "Delete",
        children: (
          <p>
            Are you sure you want to delete the network forward with listen
            address {forward.listen_address}?<br />
          </p>
        ),
        onConfirm: handleDelete,
      }}
      className="u-no-margin--bottom has-icon"
      loading={isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteNetworkForwardBtn;
