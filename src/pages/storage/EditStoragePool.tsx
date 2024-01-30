import React, { FC, useState } from "react";
import { Button, useNotify } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchStoragePool,
  updateClusteredPool,
  updatePool,
} from "api/storage-pools";
import SubmitButton from "components/SubmitButton";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { LxdStoragePool } from "types/storage";
import { queryKeys } from "util/queryKeys";
import StoragePoolForm, {
  StoragePoolFormValues,
  storagePoolFormToPayload,
} from "./forms/StoragePoolForm";
import { checkDuplicateName } from "util/helpers";
import { useClusterMembers } from "context/useClusterMembers";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { getStoragePoolEditValues } from "util/storagePoolEdit";
import { MAIN_CONFIGURATION } from "./forms/StoragePoolFormMenu";
import { slugify } from "util/slugify";

interface Props {
  pool: LxdStoragePool;
}

const EditStoragePool: FC<Props> = ({ pool }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { project, section } = useParams<{
    project: string;
    section?: string;
  }>();
  const controllerState = useState<AbortController | null>(null);
  const { data: clusterMembers = [] } = useClusterMembers();

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

  const formik = useFormik<StoragePoolFormValues>({
    initialValues: getStoragePoolEditValues(pool),
    validationSchema: StoragePoolSchema,
    onSubmit: (values) => {
      const savedPool = storagePoolFormToPayload(values);

      const mutation =
        clusterMembers.length > 0
          ? () => updateClusteredPool(savedPool, project, clusterMembers)
          : () => updatePool(savedPool, project);

      mutation()
        .then(async () => {
          notify.success("Storage pool updated.");
          const member = clusterMembers[0]?.server_name ?? undefined;
          const updatedPool = await fetchStoragePool(
            values.name,
            project,
            member,
          );
          void formik.setValues(getStoragePoolEditValues(updatedPool));
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

  const setSection = (newSection: string) => {
    const baseUrl = `/ui/project/${project}/storage/detail/${pool.name}/configuration`;
    newSection === MAIN_CONFIGURATION
      ? navigate(baseUrl)
      : navigate(`${baseUrl}/${slugify(newSection)}`);
  };

  return (
    <div className="edit-storage-pool">
      <StoragePoolForm
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
            Edit pool
          </Button>
        ) : (
          <>
            <Button
              appearance="base"
              onClick={() => formik.setValues(getStoragePoolEditValues(pool))}
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
      </FormFooterLayout>
    </div>
  );
};

export default EditStoragePool;
