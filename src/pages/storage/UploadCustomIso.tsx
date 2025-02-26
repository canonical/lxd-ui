import { ChangeEvent, FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import {
  ActionButton,
  Button,
  failure,
  Input,
  NotificationType,
  Notification,
} from "@canonical/react-components";
import { createIsoStorageVolume } from "api/storage-pools";
import { useCurrentProject } from "context/useCurrentProject";
import Loader from "components/Loader";
import ProgressBar from "components/ProgressBar";
import type { UploadState } from "types/storage";
import { humanFileSize } from "util/helpers";
import UploadCustomImageHint from "pages/storage/UploadCustomImageHint";
import { useEventQueue } from "context/eventQueue";
import StoragePoolSelector from "./StoragePoolSelector";
import { AxiosError } from "axios";
import type { LxdSyncResponse } from "types/apiResponse";
import { isValidISOAlias, sanitizeISOAlias } from "util/customISO";
import classnames from "classnames";

interface Props {
  onFinish: (name: string, pool: string) => void;
  onCancel: () => void;
}

const UploadCustomIso: FC<Props> = ({ onCancel, onFinish }) => {
  const eventQueue = useEventQueue();
  const queryClient = useQueryClient();
  const { project } = useCurrentProject();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [isLoading, setLoading] = useState(false);
  const [pool, setPool] = useState("");
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [uploadAbort, setUploadAbort] = useState<AbortController | null>(null);
  const [error, setError] = useState<NotificationType | null>(null);

  const projectName = project?.name ?? "";

  const handleCancel = () => {
    uploadAbort?.abort();
    onCancel();
  };

  const importFile = () => {
    if (!file) {
      return;
    }
    setError(null);
    setLoading(true);
    const uploadController = new AbortController();
    setUploadAbort(uploadController);
    createIsoStorageVolume(
      pool,
      file,
      name,
      projectName,
      setUploadState,
      uploadController,
    )
      .then((operation) =>
        eventQueue.set(
          operation.metadata.id,
          () => onFinish(name, pool),
          (msg) =>
            setError(failure("Custom ISO upload failed", new Error(msg))),
          () => {
            setLoading(false);
            setUploadState(null);
            void queryClient.invalidateQueries({
              queryKey: [
                queryKeys.storage,
                pool,
                queryKeys.volumes,
                projectName,
              ],
            });
          },
        ),
      )
      .catch((e: AxiosError<LxdSyncResponse<null>>) => {
        const error = new Error(e.response?.data.error);
        setError(failure("Custom ISO upload failed", error));
        setLoading(false);
        setUploadState(null);
      });
  };

  const changeFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setFile(file);
      setName(sanitizeISOAlias(file.name));
    }
  };

  return (
    <>
      {error ? (
        <Notification
          title={error.title}
          severity="negative"
          onDismiss={() => setError(null)}
        >
          {error.message}
        </Notification>
      ) : (
        <UploadCustomImageHint />
      )}
      <div
        className={classnames("custom-iso-form", {
          "u-hide": !!uploadState,
        })}
      >
        <Input
          name="iso"
          type="file"
          id="iso-image"
          label="Local file"
          onChange={changeFile}
          stacked
        />
        <Input
          name="name"
          type="text"
          id="name"
          label="Alias"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={file === null}
          error={
            name && !isValidISOAlias(name) ? (
              <div className="alias-error">
                Only alphanumeric characters, periods or hyphens are allowed in
                this field
              </div>
            ) : undefined
          }
          stacked
        />
        <StoragePoolSelector
          value={pool}
          setValue={setPool}
          selectProps={{
            id: "storagePool",
            label: "Storage pool",
            disabled: file === null,
            stacked: true,
          }}
        />
      </div>
      {uploadState && (
        <>
          <ProgressBar percentage={Math.floor(uploadState.percentage)} />
          <p>
            {humanFileSize(uploadState.loaded)} loaded of{" "}
            {humanFileSize(uploadState.total ?? 0)}
          </p>
          {uploadState.loaded === uploadState.total && (
            <Loader text="Validating ISO" />
          )}
        </>
      )}
      <footer className="p-modal__footer">
        <Button
          appearance="base"
          onClick={handleCancel}
          className="u-no-margin--bottom"
        >
          Cancel
        </Button>
        <ActionButton
          appearance="positive"
          loading={isLoading}
          disabled={!file || !isValidISOAlias(name)}
          className="u-no-margin--bottom"
          onClick={importFile}
        >
          Upload
        </ActionButton>
      </footer>
    </>
  );
};

export default UploadCustomIso;
