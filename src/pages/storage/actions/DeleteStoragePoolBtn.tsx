import type { FC } from "react";
import { useState } from "react";
import {
  ConfirmationButton,
  Icon,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { deleteStoragePool } from "api/storage-pools";
import classnames from "classnames";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import { useNavigate } from "react-router-dom";
import type { LxdStoragePool } from "types/storage";
import { queryKeys } from "util/queryKeys";
import ResourceLabel from "components/ResourceLabel";
import { useStoragePoolEntitlements } from "util/entitlements/storage-pools";
import { ROOT_PATH } from "util/rootPath";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useEventQueue } from "context/eventQueue";
import StoragePoolRichChip from "../StoragePoolRichChip";

interface Props {
  pool: LxdStoragePool;
  project: string;
  shouldExpand?: boolean;
}

const DeleteStoragePoolBtn: FC<Props> = ({
  pool,
  project,
  shouldExpand = false,
}) => {
  const isSmallScreen = useIsScreenBelow();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canDeletePool } = useStoragePoolEntitlements();
  const { hasStorageAndNetworkOperations } = useSupportedFeatures();
  const eventQueue = useEventQueue();

  const notifySuccess = (poolName: string) => {
    toastNotify.success(
      <>
        Storage pool <ResourceLabel bold type="pool" value={poolName} />{" "}
        deleted.
      </>,
    );
  };

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.storage],
    });
  };

  const onSuccess = () => {
    invalidateCache();
    navigate(
      `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pools`,
    );
    notifySuccess(pool.name);
  };

  const onFailure = (e: unknown) => {
    invalidateCache();
    setLoading(false);
    notify.failure(`Deleting storage pool ${pool.name} failed`, e);
  };

  const handleDelete = () => {
    setLoading(true);
    deleteStoragePool(pool.name)
      .then((operation) => {
        if (hasStorageAndNetworkOperations) {
          toastNotify.info(
            <>
              Deletion of storage pool{" "}
              <StoragePoolRichChip poolName={pool.name} projectName={project} />{" "}
              has started.
            </>,
          );
          eventQueue.set(
            operation.metadata.id,
            () => {
              setLoading(false);
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

  const disabledReason = () => {
    if (!canDeletePool(pool)) {
      return "You do not have permission to delete this storage pool";
    }

    if (pool.used_by?.length ?? 0 > 0) {
      return "Storage pool is in use";
    }

    return undefined;
  };

  return (
    <ConfirmationButton
      confirmationModalProps={{
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete storage pool{" "}
            <ResourceLabel type="pool" value={pool.name} bold />.
            <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete pool",
        onConfirm: handleDelete,
        message: "Delete storage",
      }}
      appearance={shouldExpand ? "default" : "base"}
      className={classnames("u-no-margin--bottom", {
        "is-dense": !shouldExpand,
        "has-icon": !isSmallScreen,
      })}
      loading={isLoading}
      shiftClickEnabled
      showShiftClickHint
      disabled={Boolean(disabledReason()) || isLoading}
      onHoverText={disabledReason()}
    >
      {(!isSmallScreen || !shouldExpand) && <Icon name="delete" />}
      {shouldExpand && <span>Delete pool</span>}
    </ConfirmationButton>
  );
};

export default DeleteStoragePoolBtn;
