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
import { instanceNameValidation } from "util/instances";
import type { UploadState } from "types/storage";
import { useEventQueue } from "context/eventQueue";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { queryKeys } from "util/queryKeys";
import { uploadInstance } from "api/instances";
import { useFormik } from "formik";
import type { AxiosError } from "axios";
import type { LxdSyncResponse } from "types/apiResponse";
import * as Yup from "yup";
import classnames from "classnames";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import type { InstanceFileType } from "./InstanceFileTypeSelector";
import InstanceFileTypeSelector from "./InstanceFileTypeSelector";
import ResourceLabel from "components/ResourceLabel";
import { fileToSanitisedName } from "util/helpers";
import { InstanceRichChip } from "pages/instances/InstanceRichChip";

export interface UploadInstanceBackupFileFormValues {
  instanceFile: File | null;
  name: string;
  pool: string;
}

interface Props {
  close: () => void;
  uploadState: UploadState | null;
  setUploadState: (state: UploadState | null) => void;
  fileType: InstanceFileType;
  setFileType: (value: InstanceFileType) => void;
  defaultInstanceName?: string;
}

const UploadInstanceBackupFileForm: FC<Props> = ({
  close,
  uploadState,
  setUploadState,
  fileType,
  setFileType,
  defaultInstanceName,
}) => {
  const { project, isLoading } = useCurrentProject();
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [uploadAbort, setUploadAbort] = useState<AbortController | null>(null);
  const instanceNameAbort = useState<AbortController | null>(null);
  const { hasInstanceImportConversion } = useSupportedFeatures();

  const handleSuccess = (instanceName: string) => {
    const instanceUrl = `/ui/project/${encodeURIComponent(project?.name ?? "")}/instance/${encodeURIComponent(instanceName)}`;
    const message = (
      <>
        Created instance{" "}
        <InstanceRichChip
          instanceName={instanceName}
          projectName={project?.name ?? ""}
        />
        .
      </>
    );

    const actions = [
      {
        label: "Configure",
        onClick: async () => navigate(`${instanceUrl}/configuration`),
      },
    ];

    toastNotify.success(message, actions);
  };

  const handleFailure = (msg: string) => {
    toastNotify.failure("Instance creation failed.", new Error(msg));
  };

  const handleFinish = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey[0] === queryKeys.instances;
      },
    });
  };

  const handleUpload = (values: UploadInstanceBackupFileFormValues) => {
    const uploadController = new AbortController();
    setUploadAbort(uploadController);

    uploadInstance(
      values.instanceFile,
      values.name,
      project?.name,
      values.pool,
      setUploadState,
      uploadController,
    )
      .then((operation) => {
        toastNotify.info(
          <>
            Upload completed. Now creating instance{" "}
            <ResourceLabel bold type="instance" value={values.name} />.
          </>,
        );

        eventQueue.set(
          operation.metadata.id,
          () => {
            handleSuccess(values.name);
          },
          handleFailure,
          handleFinish,
        );

        handleCloseModal();
        navigate(
          `/ui/project/${encodeURIComponent(project?.name ?? "")}/instances`,
        );
      })
      .catch((e: AxiosError<LxdSyncResponse<null>>) => {
        const error = new Error(e.response?.data.error);
        notify.failure("Instance upload failed", error);
        formik.setSubmitting(false);
        setUploadState(null);
      });
  };

  const formik = useFormik<UploadInstanceBackupFileFormValues>({
    initialValues: {
      name: defaultInstanceName || "",
      pool: "",
      instanceFile: null,
    },
    validateOnMount: true,
    validationSchema: Yup.object().shape({
      name: instanceNameValidation(
        project?.name || "",
        instanceNameAbort,
      ).optional(),
    }),
    onSubmit: handleUpload,
  });

  const handleCloseModal = useCallback(() => {
    uploadAbort?.abort();
    setUploadState(null);
    setUploadAbort(null);
    formik.resetForm();
    close();
    notify.clear();
  }, [uploadAbort, formik.resetForm, close, notify]);

  const changeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = formik.getFieldProps("instanceFile");
    onChange(e);

    if (e.currentTarget.files) {
      const file = e.currentTarget.files[0];
      await formik.setFieldValue("instanceFile", file);

      if (!defaultInstanceName) {
        const instanceName = fileToSanitisedName(file.name, "-import");
        await formik.setFieldValue("name", instanceName);

        // validate instance name
        await formik.validateField("name");
        void formik.setFieldTouched("name", true, true);
        if (!formik.errors.name) {
          formik.setFieldError("name", undefined);
        }
      }
    }
  };

  const noFileSelectedMessage = !formik.values.instanceFile
    ? "Please select a file before adding custom configuration."
    : "";

  return (
    <>
      <Form
        onSubmit={formik.handleSubmit}
        className={classnames({ "u-hide": uploadState })}
      >
        {hasInstanceImportConversion && (
          <InstanceFileTypeSelector value={fileType} onChange={setFileType} />
        )}
        <Input
          id="instance-file"
          name="instanceFile"
          type="file"
          accept=".tar, application/gzip, application/x-bzip, application/x-xz, application/x-lzma, application/x-squashfs, application/x-qcow2, application/zstd"
          label="Local file"
          labelClassName={hasInstanceImportConversion ? "u-hide" : ""}
          onChange={(e) => void changeFile(e)}
        />
        <Input
          {...formik.getFieldProps("name")}
          id="upload-instance-name"
          type="text"
          label="New instance name"
          placeholder="Enter name"
          error={formik.touched.name ? formik.errors.name : null}
          disabled={!!noFileSelectedMessage}
          title={noFileSelectedMessage}
        />
        <StoragePoolSelector
          value={formik.values.pool}
          setValue={(value) => void formik.setFieldValue("pool", value)}
          selectProps={{
            id: "pool",
            label: "Root storage pool",
            disabled: isLoading || !!noFileSelectedMessage,
            title: noFileSelectedMessage,
          }}
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
            !formik.values.instanceFile
          }
          onClick={() => void formik.submitForm()}
        >
          Upload and create
        </ActionButton>
      </footer>
    </>
  );
};

export default UploadInstanceBackupFileForm;
