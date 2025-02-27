import type { FC, KeyboardEvent } from "react";
import {
  ActionButton,
  Button,
  Modal,
  useNotify,
} from "@canonical/react-components";
import { useFormik } from "formik";
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import type { LxdStorageVolume } from "types/storage";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { volumeFormToPayload } from "pages/storage/forms/StorageVolumeForm";
import { getStorageVolumeEditValues } from "util/storageVolumeEdit";
import { updateStorageVolume } from "api/storage-pools";
import StorageVolumeFormSnapshots from "pages/storage/forms/StorageVolumeFormSnapshots";
import { useToastNotification } from "context/toastNotificationProvider";
import ResourceLink from "components/ResourceLink";

interface Props {
  volume: LxdStorageVolume;
  close: () => void;
}

const VolumeConfigureSnapshotModal: FC<Props> = ({ volume, close }) => {
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();

  const formik = useFormik<StorageVolumeFormValues>({
    initialValues: getStorageVolumeEditValues(volume),
    onSubmit: (values) => {
      const saveVolume = volumeFormToPayload(values, volume.project);
      updateStorageVolume(volume.pool, volume.project, {
        ...saveVolume,
        etag: volume.etag,
      })
        .then(() => {
          toastNotify.success(
            <>
              Snapshot configuration updated for volume{" "}
              <ResourceLink
                type="volume"
                value={volume.name}
                to={`/ui/project/${volume.project}/storage/pool/${volume.pool}/volumes/custom/${volume.name}`}
              />
              .
            </>,
          );
          queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
            predicate: (query) =>
              query.queryKey[0] === queryKeys.volumes ||
              query.queryKey[0] === queryKeys.storage,
          });
        })
        .catch((e: Error) => {
          notify.failure("Configuration update failed", e);
        })
        .finally(() => {
          close();
          formik.setSubmitting(false);
        });
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
          <div className="u-space-between u-flex-row-reverse">
            <Button
              className="u-no-margin--bottom u-no-margin--right"
              onClick={close}
            >
              Close
            </Button>
            <Button
              className="u-no-margin--bottom"
              type="button"
              onClick={async () => formik.setFieldValue("readOnly", false)}
            >
              Edit configuration
            </Button>
          </div>
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
