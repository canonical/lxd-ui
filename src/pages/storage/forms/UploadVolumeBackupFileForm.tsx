import {
  ActionButton,
  Button,
  Form,
  Input,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import { useCurrentProject } from "context/useCurrentProject";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import type { ChangeEvent, FC } from "react";
import { useCallback, useState } from "react";
import { fileToSanitisedName } from "util/helpers";
import type { LxdStorageVolume, UploadState } from "types/storage";
import { useEventQueue } from "context/eventQueue";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import { useFormik } from "formik";
import type { AxiosError } from "axios";
import type { LxdSyncResponse } from "types/apiResponse";
import * as Yup from "yup";
import classnames from "classnames";
import ResourceLink from "components/ResourceLink";
import ResourceLabel from "components/ResourceLabel";
import { uploadVolume } from "api/storage-volumes";
import {
  linkForVolumeDetail,
  testDuplicateStorageVolumeName,
} from "util/storageVolume";
import ClusterMemberSelector from "pages/cluster/ClusterMemberSelector";
import { useStoragePools } from "context/useStoragePools";
import { isClusterLocalDriver } from "util/storagePool";
import { useClusterMembers } from "context/useClusterMembers";

export interface UploadVolumeBackupFileFormValues {
  volumeFile: File | null;
  name: string;
  pool: string;
  clusterMember: string;
}

interface Props {
  close: () => void;
  uploadState: UploadState | null;
  setUploadState: (state: UploadState | null) => void;
  defaultVolumeName?: string;
}

const UploadVolumeBackupFileForm: FC<Props> = ({
  close,
  uploadState,
  setUploadState,
  defaultVolumeName,
}) => {
  const { project, isLoading } = useCurrentProject();
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [uploadAbort, setUploadAbort] = useState<AbortController | null>(null);
  const volumeNameAbort = useState<AbortController | null>(null);
  const { data: pools = [] } = useStoragePools();
  const { data: clusterMembers = [] } = useClusterMembers();

  const handleSuccess = (
    volumeName: string,
    location: string,
    pool: string,
  ) => {
    const volumeDetailURL = linkForVolumeDetail({
      location: location,
      name: volumeName,
      pool: pool,
      project: project?.name,
      type: "custom",
    } as LxdStorageVolume);

    const message = (
      <>
        Created volume{" "}
        <ResourceLink type="volume" value={volumeName} to={volumeDetailURL} />.
      </>
    );

    const actions = [
      {
        label: "Configure",
        onClick: async () => navigate(`${volumeDetailURL}/configuration`),
      },
    ];

    toastNotify.success(message, actions);
  };

  const handleFailure = (msg: string) => {
    toastNotify.failure("Volume creation failed.", new Error(msg));
  };

  const handleFinish = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey[0] === queryKeys.volumes;
      },
    });
  };

  const handleUpload = (values: UploadVolumeBackupFileFormValues) => {
    const uploadController = new AbortController();
    setUploadAbort(uploadController);

    const targetClusterMember = isCMSDriver ? values.clusterMember : "";

    uploadVolume(
      values.volumeFile,
      values.name,
      project?.name,
      values.pool,
      setUploadState,
      uploadController,
      targetClusterMember,
    )
      .then((operation) => {
        toastNotify.info(
          <>
            Upload completed. Now creating volume{" "}
            <ResourceLabel bold type="volume" value={values.name} />.
          </>,
        );

        eventQueue.set(
          operation.metadata.id,
          () => {
            handleSuccess(values.name, values.clusterMember, values.pool);
          },
          handleFailure,
          handleFinish,
        );

        handleCloseModal();
        navigate(
          `/ui/project/${encodeURIComponent(project?.name)}/storage/volumes`,
        );
      })
      .catch((e: AxiosError<LxdSyncResponse<null>>) => {
        const error = new Error(e.response?.data.error);
        notify.failure("Volume upload failed", error);
        formik.setSubmitting(false);
        setUploadState(null);
      });
  };

  const formik = useFormik<UploadVolumeBackupFileFormValues>({
    initialValues: {
      name: defaultVolumeName || "",
      pool: "", // will be set by StoragePoolSelector
      volumeFile: null,
      clusterMember: clusterMembers?.[0]?.server_name ?? "",
    },
    validateOnMount: true,
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .test(
          ...testDuplicateStorageVolumeName(
            project?.name || "",
            "custom",
            volumeNameAbort,
          ),
        )
        .optional(),
    }),
    onSubmit: handleUpload,
  });

  const pool = pools.find((pool) => pool.name === formik.values.pool);
  const isCMSDriver = isClusterLocalDriver(pool?.driver || "");

  const handleCloseModal = useCallback(() => {
    uploadAbort?.abort();
    setUploadState(null);
    setUploadAbort(null);
    formik.resetForm();
    close();
    notify.clear();
  }, [uploadAbort, formik.resetForm, close, notify]);

  const changeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = formik.getFieldProps("volumeFile");
    onChange(e);

    if (e.currentTarget.files) {
      const file = e.currentTarget.files[0];
      await formik.setFieldValue("volumeFile", file);

      if (!defaultVolumeName) {
        const volumeName = fileToSanitisedName(file.name, "-import");
        await formik.setFieldValue("name", volumeName);

        // validate volume name
        await formik.validateField("name");
        void formik.setFieldTouched("name", true, true);
        if (!formik.errors.name) {
          formik.setFieldError("name", undefined);
        }
      }
    }
  };

  const noFileSelectedMessage = !formik.values.volumeFile
    ? "Please select a file before adding custom configuration."
    : "";

  return (
    <>
      <Form
        onSubmit={formik.handleSubmit}
        className={classnames({ "u-hide": uploadState })}
      >
        <Input
          id="volume-file"
          name="volumeFile"
          type="file"
          accept=".tar, application/gzip, application/x-bzip, application/x-xz, application/x-lzma, application/x-squashfs, application/x-qcow2, application/zstd"
          label="LXD backup archive (.tar.gz)"
          onChange={(e) => void changeFile(e)}
        />
        <Input
          {...formik.getFieldProps("name")}
          id="name"
          type="text"
          label="New volume name"
          placeholder="Enter name"
          error={formik.touched.name ? formik.errors.name : null}
          disabled={!!noFileSelectedMessage}
          title={noFileSelectedMessage}
        />
        <StoragePoolSelector
          value={formik.values.pool}
          setValue={(value) => {
            void formik.setFieldValue("pool", value);
          }}
          selectProps={{
            id: "volume-import-pool",
            label: "Storage pool",
            disabled: isLoading || !!noFileSelectedMessage,
            title: noFileSelectedMessage,
          }}
        />
        <ClusterMemberSelector
          {...formik.getFieldProps("clusterMember")}
          id="clusterMember"
          label="Target cluster member"
          disabled={!!noFileSelectedMessage || !isCMSDriver}
          disableReason={
            !isCMSDriver
              ? "The selected pool is not cluster specific"
              : noFileSelectedMessage
          }
        />
      </Form>
      <footer className="p-modal__footer" id="modal-footer">
        <Button
          appearance="base"
          className="u-no-margin--bottom"
          type="button"
          onClick={handleCloseModal}
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          loading={formik.isSubmitting || !!uploadState}
          disabled={
            !formik.isValid ||
            formik.isSubmitting ||
            isLoading ||
            !formik.values.volumeFile
          }
          onClick={() => void formik.submitForm()}
        >
          Upload and create
        </ActionButton>
      </footer>
    </>
  );
};

export default UploadVolumeBackupFileForm;
