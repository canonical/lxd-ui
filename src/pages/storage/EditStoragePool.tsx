import React, { FC, useState } from "react";
import { useNotify, Row, Col, Button } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { updateStoragePool } from "api/storage-pools";
import SubmitButton from "components/SubmitButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useParams } from "react-router-dom";
import { LxdStoragePool } from "types/storage";
import { queryKeys } from "util/queryKeys";
import StoragePoolForm, {
  StoragePoolFormValues,
} from "./forms/StoragePoolForm";
import { checkDuplicateName } from "util/helpers";

interface Props {
  pool: LxdStoragePool;
}

const EditStoragePool: FC<Props> = ({ pool }) => {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();
  const controllerState = useState<AbortController | null>(null);

  if (!project) {
    return <>Missing project</>;
  }

  const StoragePoolSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A pool with this name already exists",
        (value) =>
          value === pool.name ||
          checkDuplicateName(value, project, controllerState, `storage-pools`),
      )
      .required("This field is required"),
  });

  const getEditValues = (pool: LxdStoragePool) => {
    return {
      isCreating: false,
      isReadOnly: true,
      name: pool.name,
      description: pool.description,
      driver: pool.driver,
      source: pool.config?.source || "",
      size: pool.config?.size || "GiB",
    };
  };

  const formik = useFormik<StoragePoolFormValues>({
    initialValues: getEditValues(pool),
    validationSchema: StoragePoolSchema,
    onSubmit: ({ name, description, driver, source, size }) => {
      const hasValidSize = size.match(/^\d/);
      const savedPool: LxdStoragePool = {
        name,
        description,
        driver,
        config: {
          ...pool.config,
          size: hasValidSize ? size : undefined,
          source,
        },
      };

      updateStoragePool(savedPool, project)
        .then(() => {
          void formik.setValues(getEditValues(savedPool));
          notify.success("Storage pool updated.");
        })
        .catch((e) => {
          notify.failure("Storage pool update failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
        });
    },
  });

  return (
    <div className="edit-storage-pool">
      <StoragePoolForm formik={formik} />
      <div className="p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            {formik.values.isReadOnly ? (
              <Button
                appearance="positive"
                onClick={() => void formik.setFieldValue("isReadOnly", false)}
              >
                Edit pool
              </Button>
            ) : (
              <>
                <Button
                  appearance="base"
                  onClick={() => formik.setValues(getEditValues(pool))}
                >
                  Cancel
                </Button>
                <SubmitButton
                  isSubmitting={formik.isSubmitting}
                  isDisabled={!formik.isValid}
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

export default EditStoragePool;
