import { useEffect, useRef, useState, type FC } from "react";
import {
  Button,
  Modal,
  useToastNotification,
} from "@canonical/react-components";
import type { UploadState } from "types/upload";
import ProgressBar from "components/ProgressBar";
import { humanFileSize } from "util/helpers";
import type { LxdInstance } from "types/instance";
import { deleteInstanceFile, uploadInstanceFile } from "api/instances";

interface Props {
  close: () => void;
  files: File[];
  instance: LxdInstance;
  currentPath: string;
  refreshDirectoryList: () => void;
}

const FileExplorerUploadModal: FC<Props> = ({
  close,
  files,
  instance,
  currentPath,
  refreshDirectoryList,
}) => {
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const toastNotify = useToastNotification();
  const milliseconds = 1000;
  const [hasTimePassed, setHasTimePassed] = useState(false);
  const [hasUploadFinished, setHasUploadFinished] = useState(false);
  const [currentFileUploading, setCurrentFileUploading] = useState<string>();

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    close();
  };

  useEffect(() => {
    void uploadFiles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimePassed(true);
      if (hasUploadFinished) {
        close();
      }
    }, milliseconds);
    return () => {
      clearTimeout(timer);
    };
  }, [hasUploadFinished]);

  const uploadFiles = async () => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let successCount = 0;
    let failError = null;
    const uploadedPaths: string[] = [];

    for (const file of files) {
      const targetPath =
        currentPath === "/" ? `/${file.name}` : `${currentPath}/${file.name}`;
      setCurrentFileUploading(file.name);

      try {
        await uploadInstanceFile(
          instance,
          targetPath,
          file,
          setUploadState,
          abortController,
        );
        successCount++;
        uploadedPaths.push(targetPath);
      } catch (e) {
        failError = e;
        const pathsToDelete: string[] = [];

        if (abortController.signal.aborted) {
          pathsToDelete.push(...uploadedPaths, targetPath);
        } else {
          pathsToDelete.push(targetPath);
        }

        await Promise.allSettled(
          pathsToDelete.map(async (path) => deleteInstanceFile(instance, path)),
        );

        break;
      }
    }

    const multipleFiles = successCount > 1;
    const fileLabel = multipleFiles ? "files" : "File";
    const message = multipleFiles
      ? `${successCount} ${fileLabel} uploaded successfully.`
      : `${files[0].name} uploaded successfully.`;

    if (successCount === files.length) {
      toastNotify.success(message);
    } else {
      toastNotify.failure(`Upload failed`, failError);
    }

    setHasUploadFinished(true);
    refreshDirectoryList();
    if (hasTimePassed) {
      close();
    }
  };

  return (
    <Modal
      close={handleCancel}
      className="upload-instance-modal u-no-margin--bottom"
      title="Uploading files"
      closeOnOutsideClick={false}
      buttonRow={
        <Button className="u-no-margin--bottom" onClick={handleCancel}>
          Cancel upload
        </Button>
      }
    >
      {uploadState && (
        <>
          <ProgressBar percentage={Math.floor(uploadState.percentage)} />
          <p>
            {humanFileSize(uploadState.loaded)} loaded of{" "}
            {humanFileSize(uploadState.total ?? 0)} for {currentFileUploading}
          </p>
        </>
      )}
    </Modal>
  );
};

export default FileExplorerUploadModal;
