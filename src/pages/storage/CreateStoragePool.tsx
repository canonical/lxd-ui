import React, { FC, useState } from "react";
import { useNotify, Button } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { createClusteredPool, createPool } from "api/storage-pools";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import SubmitButton from "components/SubmitButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import { zfsDriver } from "util/storageOptions";
import { testDuplicateStoragePoolName } from "util/storagePool";
import StoragePoolForm, {
  StoragePoolFormValues,
  storagePoolFormToPayload,
} from "./forms/StoragePoolForm";
import { useClusterMembers } from "context/useClusterMembers";
import FormFooterLayout from "components/forms/FormFooterLayout";

const CreateStoragePool: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();
  const controllerState = useState<AbortController | null>(null);
  const { data: clusterMembers = [] } = useClusterMembers();

  if (!project) {
    return <>Missing project</>;
  }

  const CreateStoragePoolSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateStoragePoolName(project, controllerState))
      .required("This field is required"),
  });

  const formik = useFormik<StoragePoolFormValues>({
    initialValues: {
      isCreating: true,
      readOnly: false,
      name: "",
      description: "",
      driver: zfsDriver,
      source: "",
      size: "",
      entityType: "storagePool",
    },
    validationSchema: CreateStoragePoolSchema,
    onSubmit: (values) => {
      const storagePool = storagePoolFormToPayload(values);
      const mutation =
        clusterMembers.length > 0
          ? () => createClusteredPool(storagePool, project, clusterMembers)
          : () => createPool(storagePool, project);

      mutation()
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
          navigate(
            `/ui/project/${project}/storage`,
            notify.queue(
              notify.success(`Storage pool ${storagePool.name} created.`),
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
      <FormFooterLayout>
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
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateStoragePool;
