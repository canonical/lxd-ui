import type { FC, KeyboardEvent } from "react";
import {
  ActionButton,
  Button,
  Modal,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import type { LxdStorageVolume } from "types/storage";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { volumeFormToPayload } from "pages/storage/forms/StorageVolumeForm";
import { getStorageVolumeEditValues } from "util/storageVolumeEdit";
import StorageVolumeFormSnapshots from "pages/storage/forms/StorageVolumeFormSnapshots";
import { updateStorageVolume } from "api/storage-volumes";
import VolumeLinkChip from "pages/storage/VolumeLinkChip";
import { useEventQueue } from "context/eventQueue";
import { useSupportedFeatures } from "context/useSupportedFeatures";

interface Props {
  volume: LxdStorageVolume;
  close: () => void;
}

const VolumeConfigureSnapshotModal: FC<Props> = ({ volume, close }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const eventQueue = useEventQueue();
  const { hasStorageAndProfileOperations } = useSupportedFeatures();

  const handleSuccess = () => {
    toastNotify.success(
      <>
        Snapshot configuration updated for volume{" "}
        <VolumeLinkChip volume={volume} />.
      </>,
    );
    queryClient.invalidateQueries({
      queryKey: [queryKeys.storage],
      predicate: (query) =>
        query.queryKey[0] === queryKeys.volumes ||
        query.queryKey[0] === queryKeys.storage,
    });
  };

  const handleFailure = (error: Error) => {
    notify.failure("Configuration update failed", error);
  };

  const handleFinish = () => {
    close();
    formik.setSubmitting(false);
  };

  const formik = useFormik<StorageVolumeFormValues>({
    initialValues: getStorageVolumeEditValues(volume),
    onSubmit: (values) => {
      const saveVolume = volumeFormToPayload(values, volume.project, volume);
      updateStorageVolume(
        volume.pool,
        volume.project,
        {
          ...saveVolume,
          etag: volume.etag,
        },
        volume.location,
      )
        .then((operation) => {
          if (hasStorageAndProfileOperations) {
            eventQueue.set(
              operation.metadata.id,
              handleSuccess,
              (msg) => {
                handleFailure(new Error(msg));
              },
              handleFinish,
            );
          } else {
            handleSuccess();
            handleFinish();
          }
        })
        .catch(handleFailure);
    },
  });

  const handleEscKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      close();
    }
  };

  return (
    <Modal
      close={close}
      className="edit-snapshot-config"
      title="Snapshot configuration"
      buttonRow={
        formik.values.readOnly ? (
          <Button
            className="u-no-margin--bottom u-no-margin--right"
            onClick={close}
          >
            Close
          </Button>
        ) : (
          <>
            <Button
              appearance="base"
              className="u-no-margin--bottom"
              type="button"
              onClick={close}
            >
              Cancel
            </Button>
            <ActionButton
              appearance="positive"
              className="u-no-margin--bottom"
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}
              onClick={() => void formik.submitForm()}
            >
              Save
            </ActionButton>
          </>
        )
      }
      onKeyDown={handleEscKey}
    >
      <StorageVolumeFormSnapshots formik={formik} />
    </Modal>
  );
};

export default VolumeConfigureSnapshotModal;
