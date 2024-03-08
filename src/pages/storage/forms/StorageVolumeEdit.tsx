import { FC } from "react";
import { ActionButton, Button, useNotify } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { updateStorageVolume } from "api/storage-pools";
import { useNavigate, useParams } from "react-router-dom";
import StorageVolumeForm, {
  StorageVolumeFormValues,
  volumeFormToPayload,
} from "pages/storage/forms/StorageVolumeForm";
import { LxdStorageVolume } from "types/storage";
import { getStorageVolumeEditValues } from "util/storageVolumeEdit";
import { MAIN_CONFIGURATION } from "pages/storage/forms/StorageVolumeFormMenu";
import { slugify } from "util/slugify";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";

interface Props {
  volume: LxdStorageVolume;
}

const StorageVolumeEdit: FC<Props> = ({ volume }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { section } = useParams<{ section: string }>();
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const StorageVolumeSchema = Yup.object().shape({
    name: Yup.string().required("This field is required"),
  });

  const formik = useFormik<StorageVolumeFormValues>({
    initialValues: getStorageVolumeEditValues(volume),
    validationSchema: StorageVolumeSchema,
    onSubmit: (values) => {
      const saveVolume = volumeFormToPayload(values, project, volume);
      updateStorageVolume(values.pool, project, {
        ...saveVolume,
        etag: volume.etag,
      })
        .then(() => {
          void formik.setValues(getStorageVolumeEditValues(saveVolume));
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
          void queryClient.invalidateQueries({
            queryKey: [
              queryKeys.storage,
              volume.pool,
              project,
              saveVolume.type,
              saveVolume.name,
            ],
          });
          toastNotify.success(`Storage volume ${saveVolume.name} updated.`);
        })
        .catch((e) => {
          notify.failure("Storage volume update failed", e);
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  const setSection = (newSection: string) => {
    const baseUrl = `/ui/project/${project}/storage/pool/${volume.pool}/volumes/${volume.type}/${volume.name}/configuration`;
    newSection === MAIN_CONFIGURATION
      ? navigate(baseUrl)
      : navigate(`${baseUrl}/${slugify(newSection)}`);
  };

  return (
    <div className="edit-storage-volume">
      <StorageVolumeForm
        formik={formik}
        section={section ?? slugify(MAIN_CONFIGURATION)}
        setSection={setSection}
      />
      <FormFooterLayout>
        {formik.values.readOnly ? (
          <Button
            appearance="positive"
            onClick={() => void formik.setFieldValue("readOnly", false)}
          >
            Edit volume
          </Button>
        ) : (
          <>
            <Button
              appearance="base"
              onClick={() =>
                formik.setValues(getStorageVolumeEditValues(volume))
              }
            >
              Cancel
            </Button>
            <ActionButton
              appearance="positive"
              loading={formik.isSubmitting}
              disabled={!formik.isValid || !formik.values.name}
              onClick={() => void formik.submitForm()}
            >
              Save changes
            </ActionButton>
          </>
        )}
      </FormFooterLayout>
    </div>
  );
};

export default StorageVolumeEdit;
