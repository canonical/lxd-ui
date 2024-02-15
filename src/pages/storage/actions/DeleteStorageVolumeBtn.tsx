import { FC, useState } from "react";
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
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === queryKeys.volumes,
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
