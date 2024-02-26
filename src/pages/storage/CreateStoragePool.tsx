import { FC, useState } from "react";
import { useNotify, Button, ActionButton } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { createClusteredPool, createPool } from "api/storage-pools";
import BaseLayout from "components/BaseLayout";
import NotificationRow from "components/NotificationRow";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import { zfsDriver } from "util/storageOptions";
import {
  isPowerflexIncomplete,
  testDuplicateStoragePoolName,
} from "util/storagePool";
import StoragePoolForm, {
  StoragePoolFormValues,
  toStoragePool,
} from "./forms/StoragePoolForm";
import { useClusterMembers } from "context/useClusterMembers";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { slugify } from "util/slugify";
import { MAIN_CONFIGURATION } from "./forms/StoragePoolFormMenu";
import { useToastNotification } from "context/toastNotificationProvider";
import { yamlToObject } from "util/yaml";
import { LxdStoragePool } from "types/storage";

const CreateStoragePool: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();
  const [section, setSection] = useState(slugify(MAIN_CONFIGURATION));
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
      const storagePool = values.yaml
        ? (yamlToObject(values.yaml) as LxdStoragePool)
        : toStoragePool(values);

      const mutation =
        clusterMembers.length > 0
          ? () => createClusteredPool(storagePool, project, clusterMembers)
          : () => createPool(storagePool, project);

      mutation()
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
          navigate(`/ui/project/${project}/storage`);
          toastNotify.success(`Storage pool ${storagePool.name} created.`);
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Storage pool creation failed", e);
        });
    },
  });

  const updateSection = (newSection: string) => {
    setSection(slugify(newSection));
  };

  return (
    <BaseLayout
      title="Create a storage pool"
      contentClassName="create-storage-pool"
    >
      <NotificationRow />
      <StoragePoolForm
        formik={formik}
        section={section}
        setSection={updateSection}
      />
      <FormFooterLayout>
        <Button
          appearance="base"
          onClick={() => navigate(`/ui/project/${project}/storage`)}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={
            !formik.isValid ||
            !formik.values.name ||
            isPowerflexIncomplete(formik)
          }
          onClick={() => void formik.submitForm()}
        >
          Create
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateStoragePool;
