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
  pool: string;
  volume: LxdStorageVolume;
  project: string;
}

const DeleteStorageVolumeBtn: FC<Props> = ({ pool, project, volume }) => {
  const notify = useNotify();
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  if (volume.content_type !== "iso") {
    return null;
  }

  const handleDelete = () => {
    setLoading(true);

    deleteStorageVolume(volume.name, pool, project)
      .then(() =>
        notify.success(
          <>
            Storage volume <b>{volume.name}</b> deleted.
          </>
        )
      )
      .catch((e) => {
        notify.failure("Storage volume deletion failed", e);
      })
      .finally(() => {
        setLoading(false);
        void queryClient.invalidateQueries([queryKeys.isoImages]);
        void queryClient.invalidateQueries([
          queryKeys.storage,
          pool,
          queryKeys.volumes,
          project,
        ]);
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
      appearance="base"
      className="has-icon u-no-margin--bottom"
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default DeleteStorageVolumeBtn;
