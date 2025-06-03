import type { FC } from "react";
import { useState } from "react";
import type { LxdStorageVolume } from "types/storage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";
import { deleteStorageVolume } from "api/storage-volumes";
import classNames from "classnames";

interface Props {
  volume: LxdStorageVolume;
  project: string;
  onFinish: () => void;
  appearance?: string;
  hasIcon?: boolean;
  label?: string;
  classname?: string;
  onClose?: () => void;
}

const DeleteStorageVolumeBtn: FC<Props> = ({
  project,
  volume,
  onFinish,
  appearance = "base",
  hasIcon = true,
  label,
  classname,
  onClose,
}) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { canDeleteVolume } = useStorageVolumeEntitlements();

  const getDisabledReason = () => {
    if (volume.name.includes("/")) {
      return "Go to the instance detail page, to remove this snapshot";
    }
    if (volume.type === "container") {
      return "Go to the instance detail page, to remove this container";
    }
    if (volume.type === "virtual-machine") {
      return "Go to the instance detail page, to remove this virtual-machine";
    }
    if (volume.type === "image") {
      return "Go to the image list, to remove this image";
    }
    if (volume.type !== "custom") {
      return "Only custom volumes can be deleted";
    }
    if (volume.used_by?.length ?? 0) {
      return "Remove all usages of the volume to delete it";
    }
    return undefined;
  };
  const disabledReason = getDisabledReason();

  const handleDelete = () => {
    setLoading(true);

    deleteStorageVolume(volume.name, volume.pool, project, volume.location)
      .then(onFinish)
      .catch((e) => {
        notify.failure("Storage volume deletion failed", e);
      })
      .finally(() => {
        setLoading(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.isoVolumes],
        });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.projects, project],
        });
        queryClient.invalidateQueries({
          queryKey: [
            queryKeys.storage,
            volume.pool,
            queryKeys.volumes,
            project,
            volume.location,
          ],
        });
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.volumes,
        });
      });
  };
  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
        close: onClose,
        title: "Confirm delete",
        children: (
          <p>
            This will permanently delete volume <b>{volume.name}</b>.<br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      appearance={appearance}
      className={classNames("u-no-margin--bottom", classname, {
        "has-icon": hasIcon,
      })}
      shiftClickEnabled
      showShiftClickHint
      disabled={
        !canDeleteVolume(volume) || Boolean(disabledReason) || isLoading
      }
      onHoverText={
        canDeleteVolume(volume)
          ? disabledReason
          : "You do not have permission to delete this volume."
      }
    >
      {hasIcon && <Icon name="delete" />}
      {label && <span>{label}</span>}
    </ConfirmationButton>
  );
};

export default DeleteStorageVolumeBtn;
