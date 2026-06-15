import { type ChangeEvent, useRef, useState, type FC } from "react";
import {
  Button,
  ConfirmationModal,
  Icon,
  usePortal,
} from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { useIsScreenBelow } from "context/useIsScreenBelow";
import FileExplorerUploadModal from "./forms/FileExplorerUploadModal";
import { pluralize } from "util/helpers";

interface Props {
  instance: LxdInstance;
  currentPath: string;
  refreshDirectoryList: () => void;
  directoryContent: string[];
}

const UploadFileExplorerBtn: FC<Props> = ({
  instance,
  currentPath,
  refreshDirectoryList,
  directoryContent,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [duplicateFiles, setDuplicateFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const isSmallScreen = useIsScreenBelow();
  const { canAccessInstanceFiles } = useInstanceEntitlements();
  const hasPermission = canAccessInstanceFiles(instance);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (!selected || selected.length === 0) return;

    const selectedFiles = Array.from(selected);
    setFiles(selectedFiles);

    const duplicates = selectedFiles
      .map((file) => file.name)
      .filter((name) => directoryContent.includes(name));

    if (duplicates.length > 0) {
      setDuplicateFiles(duplicates);
    } else {
      openPortal(event);
    }

    // Reset the input so the same file(s) can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmDuplicate = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => {
    setDuplicateFiles([]);
    openPortal(event);
  };

  const handleCancelDuplicate = () => {
    setDuplicateFiles([]);
    setFiles([]);
  };

  const handleClose = () => {
    setFiles([]);
    closePortal();
  };

  const filePluralized = pluralize("file", files.length);

  return (
    <>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="u-hide"
      />
      <Button
        onClick={handleClick}
        hasIcon={!isSmallScreen}
        disabled={!hasPermission || isOpen}
        className="u-no-margin--bottom"
        title={
          hasPermission
            ? "Upload files to current directory"
            : "You do not have permission to manage files on this instance"
        }
      >
        {!isSmallScreen && <Icon name="upload" />}
        <span>Upload</span>
      </Button>
      {isOpen && (
        <Portal>
          <FileExplorerUploadModal
            close={handleClose}
            files={files}
            instance={instance}
            currentPath={currentPath}
            refreshDirectoryList={refreshDirectoryList}
          />
        </Portal>
      )}
      {duplicateFiles.length > 0 && (
        <ConfirmationModal
          title={`Overwrite existing ${filePluralized}?`}
          confirmButtonLabel={`Overwrite ${filePluralized}`}
          onConfirm={handleConfirmDuplicate}
          close={handleCancelDuplicate}
        >
          <p>Replace existing {filePluralized} with the same name:</p>
          <ul>
            {duplicateFiles.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </ConfirmationModal>
      )}
    </>
  );
};

export default UploadFileExplorerBtn;
