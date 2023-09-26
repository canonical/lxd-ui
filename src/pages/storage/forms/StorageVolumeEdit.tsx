import React, { FC } from "react";
import { Button, Col, Row, useNotify } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import { updateStorageVolume } from "api/storage-pools";
import { useParams } from "react-router-dom";
import StorageVolumeForm, {
  StorageVolumeFormValues,
  volumeFormToPayload,
} from "pages/storage/forms/StorageVolumeForm";
import { LxdStorageVolume } from "types/storage";
import { getStorageVolumeEditValues } from "util/storageVolumeEdit";

interface Props {
  volume: LxdStorageVolume;
  pool: string;
}

const StorageVolumeEdit: FC<Props> = ({ volume, pool }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const StorageSchema = Yup.object().shape({
    name: Yup.string().required("This field is required"),
  });

  const formik = useFormik<StorageVolumeFormValues>({
    initialValues: getStorageVolumeEditValues(volume, pool),
    validationSchema: StorageSchema,
    onSubmit: (values) => {
      const saveVolume = volumeFormToPayload(values, project);
      updateStorageVolume(values.pool, project, {
        ...saveVolume,
        etag: volume.etag,
      })
        .then(() => {
          formik.setSubmitting(false);
          void formik.setValues(getStorageVolumeEditValues(saveVolume, pool));
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
          void queryClient.invalidateQueries({
            queryKey: [
              queryKeys.storage,
              pool,
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

  return (
    <div className="storage-volume-form">
      <StorageVolumeForm formik={formik} />
      <div className="l-footer--sticky p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            {formik.values.isReadOnly ? (
              <Button
                appearance="positive"
                onClick={() => formik.setFieldValue("isReadOnly", false)}
              >
                Edit volume
              </Button>
            ) : (
              <>
                <Button
                  onClick={() =>
                    formik.setValues(getStorageVolumeEditValues(volume, pool))
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
