import React, { FC, useState } from "react";
import ConfirmationButton from "components/ConfirmationButton";
import { LxdStorageVolume } from "types/storage";
import { deleteStorageVolume } from "api/storage-pools";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "@canonical/react-components";

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
        void queryClient.invalidateQueries([
          queryKeys.storage,
          pool,
          queryKeys.volumes,
        ]);
      });
  };

  return (
    <ConfirmationButton
      toggleAppearance="base"
      className="u-no-margin--bottom"
      isLoading={isLoading}
      title="Confirm delete"
      confirmMessage={
        <>
          This will permanently delete volume <b>{volume.name}</b>.{"\n"}This
          action cannot be undone, and can result in data loss.
        </>
      }
      confirmButtonLabel="Delete"
      onConfirm={handleDelete}
      icon="delete"
    />
  );
};

export default DeleteStorageVolumeBtn;
