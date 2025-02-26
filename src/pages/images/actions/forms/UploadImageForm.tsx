import { ChangeEvent, FC, useState } from "react";
import { useEventQueue } from "context/eventQueue";
import { useFormik } from "formik";
import { useToastNotification } from "context/toastNotificationProvider";
import { createImageAlias, uploadImage } from "api/images";
import {
  ActionButton,
  Button,
  Form,
  Input,
  Modal,
} from "@canonical/react-components";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { humanFileSize } from "util/helpers";
import ProgressBar from "components/ProgressBar";
import type { UploadState } from "types/storage";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { LxdSyncResponse } from "types/apiResponse";
import { AxiosError } from "axios";
import { useProjectEntitlements } from "util/entitlements/projects";
import { useProject } from "context/useProjects";

interface Props {
  close: () => void;
  projectName: string;
}

const UploadImageForm: FC<Props> = ({ close, projectName }) => {
  const eventQueue = useEventQueue();
  const toastNotify = useToastNotification();
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const queryClient = useQueryClient();
  const { canCreateImageAliases } = useProjectEntitlements();
  const { data: project } = useProject(projectName);

  const notifySuccess = () => {
    const uploaded = (
      <Link to={`/ui/project/${projectName}/images`}>uploaded</Link>
    );
    toastNotify.success(<>Image {uploaded}.</>);
  };

  const changeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      formik.setFieldValue("fileList", e.target.files);
    }
  };

  const getImageUploadBody = (fileList: FileList): File | FormData => {
    if (fileList.length === 1) {
      return fileList[0];
    } else {
      // Sorting by Size. The metadata file is very likely to be smaller than the image itself.
      const formData = new FormData();
      const sortedFiles = Array.from(fileList).sort((a, b) => a.size - b.size);

      formData.append("metadata", sortedFiles[0]);
      formData.append("rootfs.img", sortedFiles[1]);

      return formData;
    }
  };

  const clearCache = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === queryKeys.images,
    });
  };

  const formik = useFormik<{
    alias: string;
    isPublic: boolean;
    fileList: FileList | null;
  }>({
    initialValues: {
      alias: "",
      isPublic: false,
      fileList: null,
    },
    validationSchema: Yup.object().shape({
      alias: Yup.string(),
    }),
    onSubmit: (values) => {
      if (values.fileList) {
        if (values.fileList.length > 2) {
          close();
          toastNotify.failure(
            `Image upload failed.`,
            new Error("Too many files selected"),
          );
          return;
        }
        uploadImage(
          getImageUploadBody(values.fileList),
          values.isPublic,
          setUploadState,
          projectName,
        )
          .then((operation) => {
            toastNotify.info(<>Creation of image from file started.</>);

            eventQueue.set(
              operation.metadata.id,
              (event) => {
                const fingerprint = event.metadata.metadata?.fingerprint ?? "";
                if (values.alias) {
                  createImageAlias(fingerprint, values.alias, projectName)
                    .then(clearCache)
                    .catch((e) => {
                      toastNotify.failure(
                        `Image upload succeeded. Failed to create an alias.`,
                        e,
                      );
                    });
                }
                clearCache();
                notifySuccess();
              },
              (msg) => {
                toastNotify.failure(`Image upload failed.`, new Error(msg));
              },
            );
          })
          .catch((e: AxiosError<LxdSyncResponse<null>>) => {
            const error = new Error(e.response?.data.error);
            toastNotify.failure("Image upload failed", error);
          })
          .finally(() => {
            close();
          });
      } else {
        close();
        toastNotify.failure(`Image upload failed`, new Error("Missing files"));
      }
    },
  });

  return (
    <Modal
      close={close}
      title="Import image from file"
      className="upload-image-modal"
      buttonRow={
        <>
          {uploadState && (
            <>
              <ProgressBar percentage={Math.floor(uploadState.percentage)} />
              <p>
                {humanFileSize(uploadState.loaded)} loaded of{" "}
                {humanFileSize(uploadState.total ?? 0)}
              </p>
            </>
          )}
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            type="button"
            onClick={close}
          >
            Cancel
          </Button>
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            loading={formik.isSubmitting}
            disabled={!formik.isValid || !formik.values.fileList}
            onClick={() => void formik.submitForm()}
          >
            Upload image
          </ActionButton>
        </>
      }
    >
      <Form
        className={uploadState ? "u-hide" : ""}
        onSubmit={formik.handleSubmit}
      >
        <Input
          type="file"
          name="fileList"
          label="Image backup file"
          onChange={changeFile}
          multiple
        />
        <Input
          {...formik.getFieldProps("alias")}
          type="text"
          label="Alias"
          placeholder="Enter alias"
          error={formik.touched.alias ? formik.errors.alias : null}
          disabled={!canCreateImageAliases(project)}
          title={
            canCreateImageAliases(project)
              ? ""
              : "You do not have permission to create image aliases"
          }
        />
        <Input
          {...formik.getFieldProps("isPublic")}
          type="checkbox"
          label="Make the image publicly available"
          error={formik.touched.isPublic ? formik.errors.isPublic : null}
        />
        {/* hidden submit to enable enter key in inputs */}
        <Input
          type="submit"
          hidden
          value="Hidden input"
          disabled={!formik.isValid || !formik.values.fileList}
        />
      </Form>
    </Modal>
  );
};

export default UploadImageForm;
