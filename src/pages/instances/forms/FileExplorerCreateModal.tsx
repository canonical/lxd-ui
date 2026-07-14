import { useState, type FC } from "react";
import {
  Button,
  Input,
  Modal,
  useNotify,
  useToastNotification,
} from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import NotificationRow from "components/NotificationRow";
import { createInstanceDirectory } from "api/instances";
import {
  validateDirectoryPathSyntax,
  getFileExplorerDirectoryURL,
} from "util/instances";
import { useNavigate } from "react-router-dom";

interface Props {
  close: () => void;
  instance: LxdInstance;
  currentPath: string;
  onSuccess: () => void;
}

const FileExplorerCreateModal: FC<Props> = ({
  close,
  instance,
  currentPath,
  onSuccess,
}) => {
  const [directoryName, setDirectoryName] = useState("");
  const [parentPath, setParentPath] = useState(currentPath);
  const [isCreating, setIsCreating] = useState(false);
  const [inputError, setInputError] = useState<string | undefined>(undefined);

  const notify = useNotify();
  const toastNotify = useToastNotification();
  const navigate = useNavigate();

  const handleClose = () => {
    notify.clear();
    close();
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    setInputError(undefined);

    const trimmedParentPath = parentPath.trim();
    const trimmedDirectoryName = directoryName.trim();

    const fullPath = trimmedParentPath.endsWith("/")
      ? `${trimmedParentPath}${trimmedDirectoryName}`
      : `${trimmedParentPath}/${trimmedDirectoryName}`;

    const syntaxError =
      validateDirectoryPathSyntax(trimmedParentPath) ||
      validateDirectoryPathSyntax(fullPath);

    if (syntaxError) {
      setInputError(syntaxError);
      setIsCreating(false);
      return;
    }

    setIsCreating(true);
    try {
      await createInstanceDirectory(instance, fullPath);
      toastNotify.success(
        `Directory ${trimmedDirectoryName} created successfully.`,
      );
      navigate(getFileExplorerDirectoryURL(trimmedParentPath, instance));
      onSuccess();
    } catch (e) {
      notify.failure("Directory creation failed", e);
      setIsCreating(false);
    }
  };

  return (
    <Modal
      close={handleClose}
      title="Create directory"
      className="create-directory-modal"
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            appearance="positive"
            className="u-no-margin--bottom"
            disabled={!directoryName.trim() || isCreating}
            onClick={(e) => void handleSubmit(e)}
            loading={isCreating}
          >
            Create
          </Button>
        </>
      }
    >
      <NotificationRow />
      <form onSubmit={(e) => void handleSubmit(e)}>
        <Input type="submit" hidden value="Hidden input" />
        <Input
          id="directory-name"
          label="Directory name"
          type="text"
          required
          takeFocus
          takeFocusDelay={100}
          value={directoryName}
          onChange={(e) => {
            setDirectoryName(e.target.value);
          }}
          placeholder="Enter new directory name"
        />
        <Input
          id="parent-path"
          label="Parent path"
          type="text"
          value={parentPath}
          onChange={(e) => {
            setParentPath(e.target.value);
          }}
          error={inputError}
        />
      </form>
    </Modal>
  );
};

export default FileExplorerCreateModal;
