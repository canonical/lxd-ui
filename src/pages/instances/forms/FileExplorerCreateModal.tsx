import { useState, type FC, type FormEvent } from "react";
import {
  Button,
  Input,
  Modal,
  useToastNotification,
} from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
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

  const toastNotify = useToastNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const syntaxError = validateDirectoryPathSyntax(parentPath);
    if (syntaxError) {
      setInputError(syntaxError);
      setIsCreating(false);
      return;
    }

    const fullPath =
      parentPath === "/"
        ? `/${directoryName}`
        : `${parentPath}/${directoryName}`;

    setIsCreating(true);
    try {
      await createInstanceDirectory(instance, fullPath);
      toastNotify.success(`Directory ${directoryName} created successfully.`);
      navigate(getFileExplorerDirectoryURL(parentPath, instance));
      onSuccess();
    } catch (e) {
      close();
      toastNotify.failure("Directory creation failed", e);
      setIsCreating(false);
    }
  };

  return (
    <Modal
      close={close}
      title="Create directory"
      className="create-directory-modal"
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" onClick={close}>
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
