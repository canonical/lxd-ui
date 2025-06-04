import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ItemName from "components/ItemName";
import type { LxdNetwork } from "types/network";
import { deleteNetwork } from "api/networks";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import { useSmallScreen } from "context/useSmallScreen";
import classnames from "classnames";
import { useNetworkEntitlements } from "util/entitlements/networks";

interface Props {
  network: LxdNetwork;
  project: string;
}

const DeleteNetworkBtn: FC<Props> = ({ network, project }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isSmallScreen = useSmallScreen();
  const { canDeleteNetwork } = useNetworkEntitlements();

  const handleDelete = () => {
    setLoading(true);
    deleteNetwork(network.name, project)
      .then(() => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === queryKeys.projects &&
            query.queryKey[1] === project &&
            query.queryKey[2] === queryKeys.networks,
        });
        navigate(`/ui/project/${project}/networks`);
        toastNotify.success(
          <>
            Network <ResourceLabel bold type="network" value={network.name} />{" "}
            deleted.
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Network deletion failed", e);
      });
  };

  const isUsed = (network.used_by?.length ?? 0) > 0;
  const isManaged = network.managed;

  const getOnHoverText = () => {
    if (!canDeleteNetwork(network)) {
      return "You do not have permission to delete this network";
    }

    if (!isManaged) {
      return "Can not delete, network is not managed";
    }

    if (isUsed) {
      return "Can not delete, network is currently in use";
    }

    return "";
  };

  return (
    <ConfirmationButton
      onHoverText={getOnHoverText()}
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
      className={classnames("u-no-margin--bottom", {
        "has-icon": !isSmallScreen,
      })}
      loading={isLoading}
      disabled={!canDeleteNetwork(network) || isUsed || !isManaged || isLoading}
      shiftClickEnabled
      showShiftClickHint
    >
      {!isSmallScreen && <Icon name="delete" />}
      <span>Delete network</span>
    </ConfirmationButton>
  );
};

export default DeleteNetworkBtn;
