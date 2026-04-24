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
  isAlletraIncomplete,
  isPowerflexIncomplete,
  isPowerStoreIncomplete,
  isPureStorageIncomplete,
  testDuplicateStoragePoolName,
} from "util/storagePool";
import type { StoragePoolFormValues } from "types/forms/storagePool";
import StoragePoolForm, { toStoragePool } from "./forms/StoragePoolForm";
import { useClusterMembers } from "context/useClusterMembers";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { slugify } from "util/slugify";
import { MAIN_CONFIGURATION } from "./forms/StoragePoolFormMenu";
import { yamlToObject } from "util/yaml";
import type { LxdStoragePool } from "types/storage";
import YamlSwitch from "components/forms/YamlSwitch";
import StoragePoolRichChip from "./StoragePoolRichChip";
import { ROOT_PATH } from "util/rootPath";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useEventQueue } from "context/eventQueue";
import ResourceLabel from "components/ResourceLabel";

const CreateStoragePool: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { project } = useParams<{ project: string }>();
  const [section, setSection] = useState(slugify(MAIN_CONFIGURATION));
  const controllerState = useState<AbortController | null>(null);
  const { data: clusterMembers = [] } = useClusterMembers();
  const { hasRemoteDropSource, hasStorageAndNetworkOperations } =
    useSupportedFeatures();
  const eventQueue = useEventQueue();

  if (!project) {
    return <>Missing project</>;
  }

  const CreateStoragePoolSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateStoragePoolName(project, controllerState))
      .required("This field is required"),
  });

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.storage],
    });
  };

  const onSuccess = (storagePoolName: string) => {
    invalidateCache();
    formik.setSubmitting(false);
    toastNotify.success(
      <>
        Storage pool{" "}
        <StoragePoolRichChip poolName={storagePoolName} projectName={project} />{" "}
        created.
      </>,
    );
  };

  const onFailure = (e: unknown) => {
    invalidateCache();
    formik.setSubmitting(false);
    notify.failure("Creation of storage pool failed", e);
  };

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
        : toStoragePool(values, hasRemoteDropSource);

      const mutation =
        clusterMembers.length > 0
          ? async () =>
              createClusteredPool(
                storagePool,
                clusterMembers,
                hasStorageAndNetworkOperations,
                values.sourcePerClusterMember,
                values.zfsPoolNamePerClusterMember,
                values.sizePerClusterMember,
              )
          : async () => createPool(storagePool);

      mutation()
        .then((operation) => {
          navigate(
            `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pools`,
          );

          if (hasStorageAndNetworkOperations) {
            toastNotify.info(
              <>
                Creation of storage pool{" "}
                <ResourceLabel bold type="pool" value={storagePool.name} /> has
                started.
              </>,
            );
            eventQueue.set(
              operation.metadata.id,
              () => {
                onSuccess(storagePool.name);
              },
              (msg) => {
                onFailure(new Error(msg));
              },
            );
          } else {
            onSuccess(storagePool.name);
          }
        })
        .catch((e) => {
          onFailure(e);
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
            navigate(
              `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/pools`,
            )
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
            isPowerStoreIncomplete(formik) ||
            isPureStorageIncomplete(formik) ||
            isAlletraIncomplete(formik)
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
