import type { FC } from "react";
import { useState } from "react";
import {
  useNotify,
  Button,
  ActionButton,
  useToastNotification,
} from "@canonical/react-components";
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
  isPureStorageIncomplete,
  testDuplicateStoragePoolName,
} from "util/storagePool";
import type { StoragePoolFormValues } from "./forms/StoragePoolForm";
import StoragePoolForm, { toStoragePool } from "./forms/StoragePoolForm";
import { useClusterMembers } from "context/useClusterMembers";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { slugify } from "util/slugify";
import { MAIN_CONFIGURATION } from "./forms/StoragePoolFormMenu";
import { yamlToObject } from "util/yaml";
import type { LxdStoragePool } from "types/storage";
import YamlSwitch from "components/forms/YamlSwitch";
import ResourceLink from "components/ResourceLink";

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
          ? async () =>
              createClusteredPool(
                storagePool,
                clusterMembers,
                values.sourcePerClusterMember,
                values.zfsPoolNamePerClusterMember,
                values.sizePerClusterMember,
              )
          : async () => createPool(storagePool);

      mutation()
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
          navigate(`/ui/project/${encodeURIComponent(project)}/storage/pools`);
          toastNotify.success(
            <>
              Storage pool{" "}
              <ResourceLink
                type="pool"
                value={storagePool.name}
                to={`/ui/project/${encodeURIComponent(project)}/storage/pool/${encodeURIComponent(values.name)}`}
              />{" "}
              created.
            </>,
          );
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
        <div className="yaml-switch">
          <YamlSwitch
            formik={formik}
            section={section}
            setSection={updateSection}
            disableReason={
              formik.values.name
                ? undefined
                : "Please enter a storage pool name to enable this section"
            }
          />
        </div>
        <Button
          appearance="base"
          onClick={async () =>
            navigate(`/ui/project/${encodeURIComponent(project)}/storage/pools`)
          }
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={
            !formik.isValid ||
            formik.isSubmitting ||
            !formik.values.name ||
            isPowerflexIncomplete(formik) ||
            isPureStorageIncomplete(formik)
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
