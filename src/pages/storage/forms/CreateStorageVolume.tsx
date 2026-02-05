import type { FC } from "react";
import { useState } from "react";
import {
  ActionButton,
  Button,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import NotificationRow from "components/NotificationRow";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { testDuplicateStorageVolumeName } from "util/storageVolume";
import BaseLayout from "components/BaseLayout";
import type { StorageVolumeFormValues } from "types/forms/storageVolume";
import { volumeFormToPayload } from "pages/storage/forms/StorageVolumeForm";
import StorageVolumeForm from "pages/storage/forms/StorageVolumeForm";
import { MAIN_CONFIGURATION } from "pages/storage/forms/StorageVolumeFormMenu";
import { slugify } from "util/slugify";
import { POOL } from "../StorageVolumesFilter";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { createStorageVolume } from "api/storage-volumes";
import VolumeLinkChip from "pages/storage/VolumeLinkChip";
import UploadVolumeFileBtn from "../actions/UploadVolumeFileBtn";
import { useEventQueue } from "context/eventQueue";
import type { LxdStorageVolume } from "types/storage";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { ROOT_PATH } from "util/rootPath";

const CreateStorageVolume: FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const [section, setSection] = useState(slugify(MAIN_CONFIGURATION));
  const controllerState = useState<AbortController | null>(null);
  const { project } = useParams<{ project: string }>();
  const [searchParams] = useSearchParams();
  const eventQueue = useEventQueue();
  const { hasStorageAndProfileOperations } = useSupportedFeatures();

  if (!project) {
    return <>Missing project</>;
  }

  const StorageVolumeSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateStorageVolumeName(project, "custom", controllerState),
      )
      .required("This field is required"),
  });

  const handleSuccess = (volume: LxdStorageVolume, clusterMember?: string) => {
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
    navigate(
      `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/volumes`,
    );
    const volumeWithLocation = {
      ...volume,
      location: clusterMember ?? "none",
    };
    toastNotify.success(
      <>
        Storage volume <VolumeLinkChip volume={volumeWithLocation} /> created.
      </>,
    );
  };

  const handleFailure = (error: unknown) => {
    formik.setSubmitting(false);
    notify.failure("Storage volume creation failed", error);
  };

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
        .then((operation) => {
          if (hasStorageAndProfileOperations) {
            eventQueue.set(
              operation.metadata.id,
              () => {
                handleSuccess(volume, values.clusterMember);
              },
              (msg) => {
                handleFailure(new Error(msg));
              },
            );
          } else {
            handleSuccess(volume, values.clusterMember);
          }
        })
        .catch(handleFailure);
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
            navigate(
              `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/storage/volumes`,
            )
          }
        >
          Cancel
        </Button>
        <UploadVolumeFileBtn name={formik.values.name} />
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
