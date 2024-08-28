import { ChangeEvent, FC, useCallback, useState } from "react";
import {
  ActionButton,
  Button,
  Input,
  Modal,
} from "@canonical/react-components";
import { Form, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { instanceNameValidation, truncateInstanceName } from "util/instances";
import { useProject } from "context/project";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { uploadInstance } from "api/instances";
import { UploadState } from "types/storage";
import { useEventQueue } from "context/eventQueue";
import { useToastNotification } from "context/toastNotificationProvider";
import ProgressBar from "components/ProgressBar";
import { humanFileSize } from "util/helpers";
import usePortal from "react-useportal";
import StoragePoolSelector from "pages/storage/StoragePoolSelector";
import { AxiosError } from "axios";
import { LxdSyncResponse } from "types/apiResponse";

export interface UploadInstanceFormValues {
  instanceFile: File | null;
  name: string;
  pool: string;
}

const UploadInstanceBtn: FC = () => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const { project, isLoading: isProjectLoading } = useProject();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [uploadAbort, setUploadAbort] = useState<AbortController | null>(null);
  const instanceNameAbort = useState<AbortController | null>(null);

  const changeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = formik.getFieldProps("instanceFile");
    onChange(e);

    if (e.currentTarget.files) {
      const file = e.currentTarget.files[0];
      const suffix = "-imported";
      const instanceName = truncateInstanceName(
        // remove file extension
        file.name.split(".")[0],
        suffix,
      );
      await formik.setFieldValue("instanceFile", file);
      await formik.setFieldValue("name", instanceName);

      // validate instance name
      await formik.validateField("name");
      void formik.setFieldTouched("name", true, true);
      if (!formik.errors.name) {
        formik.setFieldError("name", undefined);
      }
    }
  };

  const handleSuccess = (instanceName: string) => {
    const message = (
      <>
        Created instance <strong>{instanceName}</strong>.
      </>
    );

    const actions = [
      {
        label: "Configure",
        onClick: () =>
          navigate(
            `/ui/project/${project?.name}/instance/${instanceName}/configuration`,
          ),
      },
    ];

    toastNotify.success(message, actions);
  };

  const handleFailure = (msg: string) => {
    toastNotify.failure("Instance creation failed.", new Error(msg));
  };

  const handleFinish = () => {
    void queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey[0] === queryKeys.instances;
      },
    });
  };

  const handleUpload = () => {
    if (!formik.values.instanceFile) {
      return;
    }

    setIsUploading(true);
    const uploadController = new AbortController();
    setUploadAbort(uploadController);

    const instanceName = formik.values.name;
    void uploadInstance(
      formik.values.instanceFile,
      instanceName,
      project?.name,
      formik.values.pool,
      setUploadState,
      uploadController,
    )
      .then((operation) => {
        toastNotify.info(
          <>
            Upload completed. Now creating instance{" "}
            <strong>{instanceName}</strong>.
          </>,
        );

        eventQueue.set(
          operation.metadata.id,
          () => handleSuccess(instanceName),
          handleFailure,
          handleFinish,
        );
      })
      .catch((e: AxiosError<LxdSyncResponse<null>>) => {
        const error = new Error(e.response?.data.error);
        toastNotify.failure("Instance upload failed", error);
      })
      .finally(() => {
        handleCloseModal();
        navigate(`/ui/project/${project?.name}/instances`);
      });
  };

  const formik = useFormik<UploadInstanceFormValues>({
    initialValues: {
      name: "",
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
    setIsUploading(false);
    setUploadState(null);
    setUploadAbort(null);
    formik.resetForm();
    closePortal();
  }, [uploadAbort, formik.resetForm, closePortal]);

  return (
    <>
      <Button onClick={openPortal} type="button" id="upload-instance-file">
        <span>Upload instance</span>
      </Button>
      {isOpen && (
        <Portal>
          <Modal
            close={handleCloseModal}
            className="upload-instance-modal"
            title="Upload instance"
            buttonRow={
              <>
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
                  loading={formik.isSubmitting || isUploading}
                  disabled={
                    !formik.isValid ||
                    isProjectLoading ||
                    !formik.values.instanceFile
                  }
                  onClick={() => void formik.submitForm()}
                >
                  Upload and create
                </ActionButton>
              </>
            }
          >
            <Form
              onSubmit={formik.handleSubmit}
              className={uploadState ? "u-hide" : ""}
            >
              <Input
                id="instance-file"
                name="instanceFile"
                type="file"
                label="Instance backup file"
                onChange={(e) => void changeFile(e)}
              />
              <Input
                {...formik.getFieldProps("name")}
                id="name"
                type="text"
                label="New instance name"
                placeholder="Enter name"
                error={formik.touched.name ? formik.errors.name : null}
                disabled={!formik.values.instanceFile}
              />
              <StoragePoolSelector
                project={project?.name || ""}
                value={formik.values.pool}
                setValue={(value) => void formik.setFieldValue("pool", value)}
                selectProps={{
                  id: "pool",
                  label: "Root storage pool",
                  disabled: isProjectLoading || !formik.values.instanceFile,
                }}
              />
            </Form>
            {uploadState && (
              <>
                <ProgressBar percentage={Math.floor(uploadState.percentage)} />
                <p>
                  {humanFileSize(uploadState.loaded)} loaded of{" "}
                  {humanFileSize(uploadState.total ?? 0)}
                </p>
              </>
            )}
          </Modal>
        </Portal>
      )}
    </>
  );
};

export default UploadInstanceBtn;
