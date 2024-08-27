import { FC, useState } from "react";
import { Modal } from "@canonical/react-components";
import { UploadState } from "types/storage";
import ProgressBar from "components/ProgressBar";
import { humanFileSize } from "util/helpers";
import UploadInstanceBackupFileForm from "./UploadInstanceBackupFileForm";
import UploadExternalFormatFileForm from "./UploadExternalFormatFileForm";
import useEventListener from "@use-it/event-listener";
import NotificationRow from "components/NotificationRow";
import { InstanceFileType } from "./InstanceFileTypeSelector";

const hasSufficientHeight = () => window.innerHeight >= 900;
interface Props {
  close: () => void;
}

const UploadInstanceFileModal: FC<Props> = ({ close }) => {
  const [fileType, setFileType] = useState<InstanceFileType>("instance-backup");
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [fixedFormHeight, setFixedFormHeight] = useState(hasSufficientHeight());

  // If the browser window has sufficient height, then display the form with fixed height
  // This will prevent the form from resizing itself due to form content changing
  // for smaller viewport height, the form will be scrollable and its height will be dynamic
  useEventListener("resize", () => {
    setFixedFormHeight(hasSufficientHeight());
  });

  return (
    <Modal
      close={close}
      className="upload-instance-modal"
      title="Upload instance file"
    >
      <NotificationRow className="u-no-padding u-no-margin" />
      {uploadState && (
        <>
          <ProgressBar percentage={Math.floor(uploadState.percentage)} />
          <p>
            {humanFileSize(uploadState.loaded)} loaded of{" "}
            {humanFileSize(uploadState.total ?? 0)}
          </p>
        </>
      )}

      {fileType === "instance-backup" && (
        <UploadInstanceBackupFileForm
          close={close}
          uploadState={uploadState}
          setUploadState={setUploadState}
          fixedFormHeight={fixedFormHeight}
          fileType={fileType}
          setFileType={setFileType}
        />
      )}

      {fileType === "external-format" && (
        <UploadExternalFormatFileForm
          close={close}
          uploadState={uploadState}
          setUploadState={setUploadState}
          fixedFormHeight={fixedFormHeight}
          fileType={fileType}
          setFileType={setFileType}
        />
      )}
    </Modal>
  );
};

export default UploadInstanceFileModal;
