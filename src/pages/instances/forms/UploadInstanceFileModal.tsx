import { FC, useState } from "react";
import { Modal } from "@canonical/react-components";
import type { UploadState } from "types/storage";
import ProgressBar from "components/ProgressBar";
import { humanFileSize } from "util/helpers";
import UploadInstanceBackupFileForm from "./UploadInstanceBackupFileForm";
import UploadExternalFormatFileForm from "./UploadExternalFormatFileForm";
import NotificationRow from "components/NotificationRow";
import { InstanceFileType } from "./InstanceFileTypeSelector";
interface Props {
  close: () => void;
  name?: string;
}

const UploadInstanceFileModal: FC<Props> = ({ close, name }) => {
  const [fileType, setFileType] = useState<InstanceFileType>("instance-backup");
  const [uploadState, setUploadState] = useState<UploadState | null>(null);

  return (
    <Modal
      close={close}
      className="upload-instance-modal"
      title="Upload instance file"
      closeOnOutsideClick={false}
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
          fileType={fileType}
          setFileType={setFileType}
          defaultInstanceName={name}
        />
      )}

      {fileType === "external-format" && (
        <UploadExternalFormatFileForm
          close={close}
          uploadState={uploadState}
          setUploadState={setUploadState}
          fileType={fileType}
          setFileType={setFileType}
          defaultInstanceName={name}
        />
      )}
    </Modal>
  );
};

export default UploadInstanceFileModal;
