import type { FC } from "react";
import { useState } from "react";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { deleteStoragePool } from "api/storage-pools";
import classnames from "classnames";
import ItemName from "components/ItemName";
import { useSmallScreen } from "context/useSmallScreen";
import { useNavigate } from "react-router-dom";
import type { LxdStoragePool } from "types/storage";
import { queryKeys } from "util/queryKeys";
import { useToastNotification } from "context/toastNotificationProvider";
import ResourceLabel from "components/ResourceLabel";
import { useStoragePoolEntitlements } from "util/entitlements/storage-pools";

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
  const isSmallScreen = useSmallScreen();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canDeletePool } = useStoragePoolEntitlements();

  const handleDelete = () => {
    setLoading(true);
    deleteStoragePool(pool.name)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.storage],
        });
        navigate(`/ui/project/${project}/storage/pools`);
        toastNotify.success(
          <>
            Storage pool <ResourceLabel bold type="pool" value={pool.name} />{" "}
            deleted.
          </>,
        );
      })
      .catch((e) => {
        setLoading(false);
        notify.failure("Storage pool deletion failed", e);
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
            This will permanently delete storage <ItemName item={pool} bold />.
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
