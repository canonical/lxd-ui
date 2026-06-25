import { useState, type FC, type FormEvent } from "react";
import {
  Button,
  Input,
  Modal,
  useToastNotification,
} from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { createInstanceDirectory } from "api/instances";

interface Props {
  close: () => void;
  instance: LxdInstance;
  currentPath: string;
  onSuccess: (fullPath: string) => void;
}

const FileExplorerCreateModal: FC<Props> = ({
  close,
  instance,
  currentPath,
  onSuccess,
}) => {
  const [directoryName, setDirectoryName] = useState("");
  const [targetPath, setTargetPath] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const toastNotify = useToastNotification();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const basePath = targetPath.trim() || currentPath;
    const fullPath =
      basePath === "/" ? `/${directoryName}` : `${basePath}/${directoryName}`;

    setIsCreating(true);
    try {
      await createInstanceDirectory(instance, fullPath);
      toastNotify.success(`Directory ${directoryName} created successfully.`);
      onSuccess(fullPath);
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
      className="create-directory-modal u-no-margin--bottom"
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
          id="directory-path"
          label="Full path"
          type="text"
          value={targetPath}
          onChange={(e) => {
            setTargetPath(e.target.value);
          }}
          placeholder={"Directory path"}
          help="Leave blank to create within the current directory."
        />
      </form>
    </Modal>
  );
};

export default FileExplorerCreateModal;
