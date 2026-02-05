import type { FC } from "react";
import {
  Button,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNavigate, useParams } from "react-router-dom";
import type { StorageVolumeFormValues } from "types/forms/storageVolume";
import StorageVolumeForm, {
  volumeFormToPayload,
} from "pages/storage/forms/StorageVolumeForm";
import type { LxdStorageVolume } from "types/storage";
import { getStorageVolumeEditValues } from "util/storageVolumeEdit";
import { MAIN_CONFIGURATION } from "pages/storage/forms/StorageVolumeFormMenu";
import { slugify } from "util/slugify";
import FormFooterLayout from "components/forms/FormFooterLayout";
import FormSubmitBtn from "components/forms/FormSubmitBtn";
import { updateStorageVolume } from "api/storage-volumes";
import { useStorageVolumeEntitlements } from "util/entitlements/storage-volumes";
import { linkForVolumeDetail } from "util/storageVolume";
import VolumeLinkChip from "pages/storage/VolumeLinkChip";
import { useEventQueue } from "context/eventQueue";
import { useSupportedFeatures } from "context/useSupportedFeatures";

interface Props {
  volume: LxdStorageVolume;
}

const EditStorageVolume: FC<Props> = ({ volume }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { section } = useParams<{ section: string }>();
  const { project } = useParams<{ project: string }>();
  const { canEditVolume } = useStorageVolumeEntitlements();
  const eventQueue = useEventQueue();
  const { hasStorageAndProfileOperations } = useSupportedFeatures();

  if (!project) {
    return <>Missing project</>;
  }

  const StorageVolumeSchema = Yup.object().shape({
    name: Yup.string().required("This field is required"),
  });

  const editRestriction = canEditVolume(volume)
    ? undefined
    : "You do not have permission to edit this volume";

  const handleSuccess = (saveVolume: LxdStorageVolume) => {
    void formik.setValues(getStorageVolumeEditValues(saveVolume));
    queryClient.invalidateQueries({
      queryKey: [queryKeys.storage],
    });
    queryClient.invalidateQueries({
      queryKey: [
        queryKeys.storage,
        volume.pool,
        project,
        saveVolume.type,
        saveVolume.name,
      ],
    });
    toastNotify.success(
      <>
        Storage volume <VolumeLinkChip volume={volume} /> updated.
      </>,
    );
  };

  const handleFailure = (error: Error) => {
    notify.failure("Storage volume update failed", error);
  };

  const handleFinish = () => {
    formik.setSubmitting(false);
  };

  const formik = useFormik<StorageVolumeFormValues>({
    initialValues: getStorageVolumeEditValues(volume, editRestriction),
    validationSchema: StorageVolumeSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const saveVolume = volumeFormToPayload(values, project, volume);
      updateStorageVolume(
        values.pool,
        project,
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
              () => {
                handleSuccess(saveVolume);
              },
              (msg) => {
                handleFailure(new Error(msg));
              },
              handleFinish,
            );
          } else {
            handleSuccess(saveVolume);
            handleFinish();
          }
        })
        .catch(handleFailure);
    },
  });

  const baseUrl = `${linkForVolumeDetail(volume)}/configuration`;

  const setSection = (newSection: string) => {
    if (newSection === MAIN_CONFIGURATION) {
      navigate(baseUrl);
    } else {
      navigate(`${baseUrl}/${slugify(newSection)}`);
    }
  };

  return (
    <div className="edit-storage-volume">
      <StorageVolumeForm
        formik={formik}
        section={section ?? slugify(MAIN_CONFIGURATION)}
        setSection={setSection}
      />
      <FormFooterLayout>
        {formik.values.readOnly ? null : (
          <>
            <Button
              appearance="base"
              onClick={async () =>
                formik.setValues(getStorageVolumeEditValues(volume))
              }
            >
              Cancel
            </Button>
            <FormSubmitBtn
              formik={formik}
              baseUrl={baseUrl}
              disabled={!formik.values.name}
            />
          </>
        )}
      </FormFooterLayout>
    </div>
  );
};

export default EditStorageVolume;
