import React, { FC, useState } from "react";
import { LxdStorageVolume } from "types/storage";
import { deleteStorageVolume } from "api/storage-pools";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ConfirmationButton,
  Icon,
  useNotify,
} from "@canonical/react-components";

interface Props {
  volume: LxdStorageVolume;
  project: string;
  onFinish: () => void;
  appearance?: string;
  hasIcon?: boolean;
  label?: string;
}

const DeleteStorageVolumeBtn: FC<Props> = ({
  project,
  volume,
  onFinish,
  appearance = "base",
  hasIcon = true,
  label,
}) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const disabledReason =
    volume.type !== "custom"
      ? "Only custom volumes can be deleted"
      : (volume.used_by?.length ?? 0) > 0
      ? "Remove all usages of the volume to delete it"
      : undefined;

  const handleDelete = () => {
    setLoading(true);

    deleteStorageVolume(volume.name, volume.pool, project)
      .then(onFinish)
      .catch((e) => {
        notify.failure("Storage volume deletion failed", e);
      })
      .finally(() => {
        setLoading(false);
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.isoVolumes],
        });
        void queryClient.invalidateQueries({
          queryKey: [queryKeys.projects, project],
        });
        void queryClient.invalidateQueries({
          queryKey: [
            queryKeys.storage,
            volume.pool,
            queryKeys.volumes,
            project,
          ],
        });
      });
  };

  return (
    <ConfirmationButton
      loading={isLoading}
      confirmationModalProps={{
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
      className="has-icon u-no-margin--bottom"
      shiftClickEnabled
      showShiftClickHint
      disabled={Boolean(disabledReason)}
      onHoverText={disabledReason}
    >
      {label && <span>{label}</span>}
      {hasIcon && <Icon name="delete" />}
    </ConfirmationButton>
  );
};

export default DeleteStorageVolumeBtn;
