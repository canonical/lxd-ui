import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  Button,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { updateClusteredPool, updatePool } from "api/storage-pools";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import type { LxdStoragePool } from "types/storage";
import { queryKeys } from "util/queryKeys";
import type { StoragePoolFormValues } from "./forms/StoragePoolForm";
import StoragePoolForm, { toStoragePool } from "./forms/StoragePoolForm";
import { checkDuplicateName } from "util/helpers";
import { useClusterMembers } from "context/useClusterMembers";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { toStoragePoolFormValues } from "util/storagePoolForm";
import {
  MAIN_CONFIGURATION,
  YAML_CONFIGURATION,
} from "./forms/StoragePoolFormMenu";
import { slugify } from "util/slugify";
import { yamlToObject } from "util/yaml";
import { useSettings } from "context/useSettings";
import { cephDriver, getSupportedStorageDrivers } from "util/storageOptions";
import YamlSwitch from "components/forms/YamlSwitch";
import FormSubmitBtn from "components/forms/FormSubmitBtn";
import ResourceLink from "components/ResourceLink";
import { useStoragePoolEntitlements } from "util/entitlements/storage-pools";
import { usePoolFromClusterMembers } from "context/useStoragePools";

interface Props {
  pool: LxdStoragePool;
}

const EditStoragePool: FC<Props> = ({ pool }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const { data: settings } = useSettings();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { project, section } = useParams<{
    project: string;
    section?: string;
  }>();
  const controllerState = useState<AbortController | null>(null);
  const { data: clusterMembers = [] } = useClusterMembers();
  const [version, setVersion] = useState(0);
  const { canEditPool } = useStoragePoolEntitlements();

  if (!project) {
    return <>Missing project</>;
  }

  const { data: poolOnMembers = [], error } = usePoolFromClusterMembers(
    pool.name,
  );

  useEffect(() => {
    if (error) {
      notify.failure("Loading storage pool from cluster members failed", error);
    }
  }, [error]);

  const StoragePoolSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A pool with this name already exists",
        async (value) =>
          value === pool.name ||
          checkDuplicateName(value, project, controllerState, `storage-pools`),
      )
      .required("This field is required"),
  });

  const editRestriction = canEditPool(pool)
    ? undefined
    : "You do not have permission to edit this pool";

  const formik = useFormik<StoragePoolFormValues>({
    initialValues: toStoragePoolFormValues(
      pool,
      poolOnMembers,
      editRestriction,
    ),
    validationSchema: StoragePoolSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const savedPool = values.yaml
        ? (yamlToObject(values.yaml) as LxdStoragePool)
        : toStoragePool(values);

      const mutation =
        clusterMembers.length > 0
          ? async () =>
              updateClusteredPool(
                savedPool,
                clusterMembers,
                values.sizePerClusterMember,
              )
          : async () => updatePool(savedPool);

      mutation()
        .then(() => {
          toastNotify.success(
            <>
              Storage pool{" "}
              <ResourceLink
                type="pool"
                value={savedPool.name}
                to={`/ui/project/${project}/storage/pool/${savedPool.name}`}
              />{" "}
              updated.
            </>,
          );
        })
        .catch((e) => {
          notify.failure("Storage pool update failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
          queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
            predicate: (query) =>
              query.queryKey[0] === queryKeys.volumes ||
              query.queryKey[0] === queryKeys.storage,
          });
          if (pool.driver === cephDriver && values.ceph_rbd_du === "false") {
            // Clear the storage volume sizes from the cache. The sizes are not available
            // after disabling `ceph_rbd_du` and the volume state queries will fail. So we
            // remove the queries to avoid serving the size from a stale cache.
            queryClient.removeQueries({
              predicate: (query) =>
                query.queryKey[0] === queryKeys.storage &&
                query.queryKey[1] === pool.name,
            });
          }
        });
    },
  });

  const baseUrl = `/ui/project/${project}/storage/pool/${pool.name}/configuration`;

  const updateSection = (newSection: string) => {
    if (newSection === MAIN_CONFIGURATION) {
      navigate(baseUrl);
    } else {
      navigate(`${baseUrl}/${slugify(newSection)}`);
    }
  };

  const supportedStorageDrivers = getSupportedStorageDrivers(settings);
  const defaultFormSection = supportedStorageDrivers.has(formik.values.driver)
    ? slugify(MAIN_CONFIGURATION)
    : slugify(YAML_CONFIGURATION);

  return (
    <div className="edit-storage-pool">
      <StoragePoolForm
        formik={formik}
        section={section ?? defaultFormSection}
        setSection={updateSection}
        version={version}
      />
      <FormFooterLayout>
        <YamlSwitch
          formik={formik}
          section={section}
          setSection={updateSection}
        />
        {formik.values.readOnly ? null : (
          <>
            <Button
              appearance="base"
              onClick={() => {
                setVersion((old) => old + 1);
                void formik.setValues(
                  toStoragePoolFormValues(pool, poolOnMembers),
                );
              }}
            >
              Cancel
            </Button>
            <FormSubmitBtn
              formik={formik}
              baseUrl={baseUrl}
              isYaml={section === slugify(YAML_CONFIGURATION)}
              disabled={!formik.values.name}
            />
          </>
        )}
      </FormFooterLayout>
    </div>
  );
};

export default EditStoragePool;
