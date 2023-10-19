import React, { FC } from "react";
import { Button, Col, Row, useNotify } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
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

interface Props {
  volume: LxdStorageVolume;
}

const StorageVolumeEdit: FC<Props> = ({ volume }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { activeSection: section } = useParams<{ activeSection: string }>();
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
      const saveVolume = volumeFormToPayload(values, project);
      updateStorageVolume(values.pool, project, {
        ...saveVolume,
        etag: volume.etag,
      })
        .then(() => {
          formik.setSubmitting(false);
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
          notify.success(`Storage volume updated.`);
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Storage volume update failed", e);
        });
    },
  });

  const setSection = (newSection: string) => {
    const baseUrl = `/ui/project/${project}/storage/detail/${volume.pool}/${volume.type}/${volume.name}/configuration`;
    newSection === MAIN_CONFIGURATION
      ? navigate(baseUrl)
      : navigate(`${baseUrl}/${slugify(newSection)}`);
  };

  return (
    <div className="storage-volume-form">
      <StorageVolumeForm
        formik={formik}
        section={section ?? slugify(MAIN_CONFIGURATION)}
        setSection={setSection}
      />
      <div className="l-footer--sticky p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            {formik.values.isReadOnly ? (
              <Button
                appearance="positive"
                onClick={() => void formik.setFieldValue("isReadOnly", false)}
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
                <SubmitButton
                  isSubmitting={formik.isSubmitting}
                  isDisabled={!formik.isValid || !formik.values.name}
                  buttonLabel="Save changes"
                  onClick={() => void formik.submitForm()}
                />
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default StorageVolumeEdit;
