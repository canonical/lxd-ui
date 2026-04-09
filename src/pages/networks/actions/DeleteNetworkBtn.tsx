import type { FC } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useIsScreenBelow } from "context/useIsScreenBelow";
import classnames from "classnames";
import { useNetworkEntitlements } from "util/entitlements/networks";
import NetworkRichChip from "../NetworkRichChip";
import { ROOT_PATH } from "util/rootPath";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useEventQueue } from "context/eventQueue";

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
  const location = useLocation();
  const isSmallScreen = useIsScreenBelow();
  const { canDeleteNetwork } = useNetworkEntitlements();
  const { hasStorageAndNetworkOperations } = useSupportedFeatures();
  const eventQueue = useEventQueue();

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === queryKeys.projects &&
        query.queryKey[1] === project &&
        query.queryKey[2] === queryKeys.networks,
    });
  };

  const onSuccess = () => {
    invalidateCache();

    // Only navigate to the networks list if we are still on the deleted network's detail page
    const networkDetailPath = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(network.name)}`;
    if (location.pathname.startsWith(networkDetailPath)) {
      navigate(
        `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/networks`,
      );
    }

    setLoading(false);
    toastNotify.success(
      <>
        Network <ResourceLabel bold type="network" value={network.name} />{" "}
        deleted.
      </>,
    );
  };

  const onFailure = (e: unknown) => {
    invalidateCache();
    setLoading(false);
    notify.failure(`Deleting network ${network.name} failed`, e);
  };

  const handleDelete = () => {
    setLoading(true);
    deleteNetwork(network.name, project)
      .then((operation) => {
        if (hasStorageAndNetworkOperations) {
          toastNotify.info(
            <>
              Deletion of network{" "}
              <NetworkRichChip
                networkName={network.name}
                projectName={project}
              />{" "}
              has started.
            </>,
          );

          eventQueue.set(
            operation.metadata.id,
            () => {
              onSuccess();
            },
            (msg) => {
              onFailure(new Error(msg));
            },
          );
        } else {
          onSuccess();
        }
      })
      .catch((e) => {
        onFailure(e);
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
            <NetworkRichChip networkName={network.name} projectName={project} />
            ?<br />
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
