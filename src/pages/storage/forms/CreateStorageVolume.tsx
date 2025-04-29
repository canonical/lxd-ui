import type { FC } from "react";
import { useState } from "react";
import { ActionButton, Button, useNotify } from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import NotificationRow from "components/NotificationRow";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { testCopyStorageVolumeName } from "util/storageVolume";
import BaseLayout from "components/BaseLayout";
import type { StorageVolumeFormValues } from "pages/storage/forms/StorageVolumeForm";
import { volumeFormToPayload } from "pages/storage/forms/StorageVolumeForm";
import StorageVolumeForm from "pages/storage/forms/StorageVolumeForm";
import { MAIN_CONFIGURATION } from "pages/storage/forms/StorageVolumeFormMenu";
import { slugify } from "util/slugify";
import { POOL } from "../StorageVolumesFilter";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";
import { createStorageVolume } from "api/storage-volumes";
import VolumeLinkChip from "pages/storage/VolumeLinkChip";

const CreateStorageVolume: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [section, setSection] = useState(slugify(MAIN_CONFIGURATION));
  const controllerState = useState<AbortController | null>(null);
  const { project } = useParams<{ project: string }>();
  const [searchParams] = useSearchParams();

  if (!project) {
    return <>Missing project</>;
  }

  const StorageVolumeSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testCopyStorageVolumeName(project, "custom", controllerState))
      .required("This field is required"),
  });

  const formik = useFormik<StorageVolumeFormValues>({
    initialValues: {
      content_type: "filesystem",
      volumeType: "custom",
      name: "",
      project: project,
      pool: searchParams.get(POOL) || "",
      size: "GiB",
      readOnly: false,
      isCreating: true,
      entityType: "storageVolume",
    },
    validationSchema: StorageVolumeSchema,
    onSubmit: (values) => {
      const volume = volumeFormToPayload(values, project);

      createStorageVolume(values.pool, project, volume, values.clusterMember)
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeys.customVolumes, project],
          });
          queryClient.invalidateQueries({
            queryKey: [queryKeys.projects, project],
          });
          queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === queryKeys.volumes,
          });
          navigate(`/ui/project/${project}/storage/volumes`);
          const volumeWithLocation = {
            ...volume,
            location: values.clusterMember ?? "none",
          };
          toastNotify.success(
            <>
              Storage volume <VolumeLinkChip volume={volumeWithLocation} />{" "}
              created.
            </>,
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Storage volume creation failed", e);
        });
    },
  });

  return (
    <BaseLayout title="Create volume" contentClassName="storage-volume-form">
      <NotificationRow />
      <StorageVolumeForm
        formik={formik}
        section={section}
        setSection={(val) => {
          setSection(slugify(val));
        }}
      />
      <FormFooterLayout>
        <Button
          appearance="base"
          onClick={async () =>
            navigate(`/ui/project/${project}/storage/volumes`)
          }
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={formik.isSubmitting}
          disabled={!formik.isValid || formik.isSubmitting}
          onClick={() => void formik.submitForm()}
        >
          Create
        </ActionButton>
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateStorageVolume;
