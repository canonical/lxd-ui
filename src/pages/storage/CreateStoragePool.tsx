import React, { FC, useState } from "react";
import { useNotify, Row, Col, Button } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { createStoragePool } from "api/storage-pools";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import SubmitButton from "components/SubmitButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { LxdStoragePool } from "types/storage";
import { queryKeys } from "util/queryKeys";
import { zfsDriver, btrfsDriver } from "util/storageOptions";
import { testDuplicateStoragePoolName } from "util/storagePool";
import StoragePoolForm, {
  StoragePoolFormValues,
} from "./forms/StoragePoolForm";

const CreateStoragePool: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();
  const controllerState = useState<AbortController | null>(null);

  if (!project) {
    return <>Missing project</>;
  }

  const StorageSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateStoragePoolName(project, controllerState))
      .required("This field is required"),
  });

  const formik = useFormik<StoragePoolFormValues>({
    initialValues: {
      name: "",
      description: "",
      driver: zfsDriver,
      source: "",
      size: "",
    },
    validationSchema: StorageSchema,
    onSubmit: ({ name, description, driver, source, size }) => {
      const storagePool: LxdStoragePool = {
        name,
        description,
        driver,
        source: driver !== btrfsDriver ? source : undefined,
        config: {
          size: size ? `${size}GiB` : undefined,
        },
      };

      createStoragePool(storagePool, project)
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
          navigate(
            `/ui/project/${project}/storage`,
            notify.queue(
              notify.success(`Storage ${storagePool.name} created.`),
            ),
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Storage pool creation failed", e);
        });
    },
  });

  return (
    <BaseLayout
      title="Create a storage pool"
      contentClassName="create-storage-pool"
    >
      <NotificationRow />
      <StoragePoolForm formik={formik} />
      <div className="p-bottom-controls">
        <hr />
        <Row className="u-align--right">
          <Col size={12}>
            <Button
              appearance="base"
              onClick={() => navigate(`/ui/project/${project}/storage`)}
            >
              Cancel
            </Button>
            <SubmitButton
              isSubmitting={formik.isSubmitting}
              isDisabled={!formik.isValid || !formik.values.name}
              buttonLabel="Create"
              onClick={() => void formik.submitForm()}
            />
          </Col>
        </Row>
      </div>
    </BaseLayout>
  );
};

export default CreateStoragePool;
