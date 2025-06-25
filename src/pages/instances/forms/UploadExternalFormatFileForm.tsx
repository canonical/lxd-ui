import {
  ActionButton,
  Button,
  Form,
  Icon,
  Input,
  Select,
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
import { createInstance } from "api/instances";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSettings } from "context/useSettings";
import type { UploadExternalFormatFileFormValues } from "util/uploadExternalFormatFile";
import {
  uploadExternalFormatFilePayload,
  isImageTypeRaw,
  sendFileByWebSocket,
  supportedVMArchOptions,
} from "util/uploadExternalFormatFile";
import { getInstanceName } from "util/operations";
import classnames from "classnames";
import type { InstanceFileType } from "./InstanceFileTypeSelector";
import InstanceFileTypeSelector from "./InstanceFileTypeSelector";
import ClusterMemberSelector from "pages/cluster/ClusterMemberSelector";
import ResourceLink from "components/ResourceLink";
import ResourceLabel from "components/ResourceLabel";
import { useClusterMembers } from "context/useClusterMembers";
import { fileToSanitisedName } from "util/helpers";

interface Props {
  close: () => void;
  uploadState: UploadState | null;
  setUploadState: (state: UploadState | null) => void;
  fileType: InstanceFileType;
  setFileType: (value: InstanceFileType) => void;
  defaultInstanceName?: string;
}

const UploadExternalFormatFileForm: FC<Props> = ({
  close,
  uploadState,
  setUploadState,
  fileType,
  setFileType,
  defaultInstanceName,
}) => {
  const { project, isLoading } = useCurrentProject();
  const instanceNameAbort = useState<AbortController | null>(null);
  const [socket, setSocket] = useState<WebSocket>();
  const [operationId, setOperationId] = useState("");
  const toastNotify = useToastNotification();
  const notify = useNotify();
  const navigate = useNavigate();
  const eventQueue = useEventQueue();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const { data: clusterMembers = [] } = useClusterMembers();

  const handleUploadProgress = (
    instanceName: string,
    current: number,
    total: number,
  ) => {
    setUploadState({
      percentage: Math.floor((current / total) * 100),
      loaded: current,
      total: total,
    });

    if (current === total) {
      close();
      toastNotify.info(
        <>
          Upload completed. Now creating instance{" "}
          <ResourceLabel bold type="instance" value={instanceName} />.
        </>,
      );
      navigate(`/ui/project/${encodeURIComponent(project?.name)}/instances`);
    }
  };

  const handleUploadError = (error: Error) => {
    notify.failure("File upload failed.", error);
    setUploadState(null);
  };

  const handleCancelUpload = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close(1000, "cancel upload");
    }
    eventQueue.remove(operationId);
  };

  const handleSuccess = (instanceName: string) => {
    const instanceUrl = `/ui/project/${encodeURIComponent(project?.name)}/instance/${encodeURIComponent(instanceName)}`;
    const message = (
      <>
        Created instance{" "}
        <ResourceLink type="instance" value={instanceName} to={instanceUrl} />.
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

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey[0] === queryKeys.instances;
      },
    });
  };

  const handleSubmit = (values: UploadExternalFormatFileFormValues) => {
    // start create instance operation
    createInstance(
      uploadExternalFormatFilePayload(values),
      project?.name || "",
      values.member,
    )
      .then((operation) => {
        const operationId = operation.metadata.id;
        const operationSecret = operation.metadata.metadata?.fs;
        const instanceName = getInstanceName(operation.metadata);

        // establish websocket connection based on the instance creation operation
        const wsUrl = `wss://${location.host}/1.0/operations/${encodeURIComponent(operationId)}/websocket?secret=${operationSecret}`;

        const ws = sendFileByWebSocket(
          wsUrl,
          formik.values.file,
          handleUploadProgress.bind(null, instanceName),
          handleUploadError,
        );

        setSocket(ws);
        setOperationId(operationId);

        // set up event queue for the operation
        eventQueue.set(
          operationId,
          () => {
            handleSuccess(instanceName);
          },
          handleFailure,
          invalidateCache,
        );
      })
      .catch((e) => {
        notify.failure("Instance creation failed.", e);
        formik.setSubmitting(false);
        setUploadState(null);
      });
  };

  const archOptions = supportedVMArchOptions(
    settings?.environment?.architectures || [],
  );

  const formik = useFormik<UploadExternalFormatFileFormValues>({
    initialValues: {
      name: defaultInstanceName || "",
      pool: "",
      member: clusterMembers?.[0]?.server_name,
      file: null,
      formatConversion: true,
      virtioConversion: false,
      architecture: archOptions[0]?.value,
    },
    enableReinitialize: true,
    validateOnMount: true,
    validationSchema: Yup.object().shape({
      name: instanceNameValidation(
        project?.name || "",
        instanceNameAbort,
      ).optional(),
    }),
    onSubmit: handleSubmit,
  });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = formik.getFieldProps("file");
    onChange(e);

    if (e.currentTarget.files) {
      const file = e.currentTarget.files[0];
      await formik.setFieldValue("file", file);

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

      // If the image is already in raw format, remove the format conversion option
      // this will optimise the conversion process since raw vm images do not need to be converted
      const isRawImage = await isImageTypeRaw(file);
      await formik.setFieldValue("formatConversion", !isRawImage);
    }
  };

  const handleCloseModal = useCallback(() => {
    formik.resetForm();
    close();
    notify.clear();
    handleCancelUpload();
  }, [formik.resetForm, close, notify, socket]);

  const noFileSelectedMessage = !formik.values.file
    ? "Please select a file before adding custom configuration."
    : "";

  return (
    <>
      <Form
        onSubmit={formik.handleSubmit}
        className={classnames({ "u-hide": uploadState })}
      >
        <InstanceFileTypeSelector value={fileType} onChange={setFileType} />
        <Input
          id="image-file"
          name="file"
          type="file"
          label="External format (.qcow2, .vmdk, etc...)"
          accept=".img, .qcow, .qcow2, .vdi, .vhdx, .vmdk"
          labelClassName="u-hide"
          onChange={(e) => void handleFileChange(e)}
        />
        <Input
          {...formik.getFieldProps("name")}
          id="name"
          type="text"
          label="New instance name"
          placeholder="Enter name"
          error={formik.touched.name ? formik.errors.name : null}
          disabled={!!noFileSelectedMessage}
          title={noFileSelectedMessage}
        />
        <ClusterMemberSelector
          {...formik.getFieldProps("member")}
          id="member"
          label="Target cluster member"
        />
        <StoragePoolSelector
          value={formik.values.pool}
          setValue={(value) => void formik.setFieldValue("pool", value)}
          selectProps={{
            id: "pool",
            label: "Root storage pool",
            disabled: !project || !!noFileSelectedMessage,
            title: noFileSelectedMessage,
          }}
        />
        <Select
          {...formik.getFieldProps("architecture")}
          id="architecture"
          label="Image architecture"
          options={archOptions}
          disabled={!!noFileSelectedMessage}
          title={noFileSelectedMessage}
        />
        <label htmlFor="">Conversion options</label>
        <Input
          {...formik.getFieldProps("formatConversion")}
          type="checkbox"
          label={
            <span title={noFileSelectedMessage}>
              Convert to raw format{" "}
              <Icon
                name="information"
                title={
                  noFileSelectedMessage
                    ? noFileSelectedMessage
                    : "Can be skipped if the image is already in raw format to speed up the import."
                }
              />
            </span>
          }
          disabled={!!noFileSelectedMessage}
          checked={formik.values.formatConversion}
        />
        <Input
          {...formik.getFieldProps("virtioConversion")}
          type="checkbox"
          label={
            <span title={noFileSelectedMessage}>
              Add Virtio drivers{" "}
              <Icon
                name="information"
                title={
                  noFileSelectedMessage
                    ? noFileSelectedMessage
                    : "Mandatory, if the image does not have Virtio drivers installed."
                }
              />
            </span>
          }
          disabled={!!noFileSelectedMessage}
          checked={formik.values.virtioConversion}
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
            !formik.values.file
          }
          onClick={() => void formik.submitForm()}
        >
          Upload and create
        </ActionButton>
      </footer>
    </>
  );
};

export default UploadExternalFormatFileForm;
