import { useState, type FC } from "react";
import {
  ConfirmationButton,
  Icon,
  useToastNotification,
} from "@canonical/react-components";
import type { LxdInstance } from "types/instance";
import { deleteInstanceFile } from "api/instances";
import { useInstanceEntitlements } from "util/entitlements/instances";
import { InstanceRichChip } from "../InstanceRichChip";

interface Props {
  instance: LxdInstance;
  fileName: string;
  filePath: string;
  fileType: string;
  onSuccess: () => void;
}

const FileExplorerDeleteBtn: FC<Props> = ({
  instance,
  fileName,
  filePath,
  fileType,
  onSuccess,
}) => {
  const [isLoading, setLoading] = useState(false);
  const toastNotify = useToastNotification();
  const { canAccessInstanceFiles } = useInstanceEntitlements();

  const isDirectory = fileType === "directory";
  const directoryOrFile = isDirectory ? "Directory" : "File";
  const instanceLink = (
    <InstanceRichChip
      instanceName={instance.name}
      projectName={instance.project}
    />
  );

  const handleDelete = () => {
    setLoading(true);
    deleteInstanceFile(instance, filePath)
      .then(() => {
        toastNotify.success(
          `${directoryOrFile} ${fileName} deleted from ${instanceLink}`,
        );
        onSuccess();
      })
      .catch((e) => {
        toastNotify.failure(
          `Deletion failed for ${directoryOrFile} ${fileName}`,
          e,
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const hasPermission = canAccessInstanceFiles(instance);

  const getHoverText = () => {
    if (!hasPermission) {
      return "You do not have permission to manage files on this instance";
    }
    return `Delete ${directoryOrFile.toLowerCase()} ${fileName}`;
  };

  return (
    <ConfirmationButton
      appearance="base"
      className="has-icon is-dense"
      loading={isLoading}
      onHoverText={getHoverText()}
      confirmationModalProps={{
        title: "Confirm delete",
        children: isDirectory ? (
          <p>
            This will permanently delete directory <b>{fileName}</b> and all of
            its contents.
            <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ) : (
          <p>
            This will permanently delete <b>{fileName}</b>.
            <br />
            This action cannot be undone, and can result in data loss.
          </p>
        ),
        confirmButtonLabel: "Delete",
        onConfirm: handleDelete,
      }}
      disabled={isLoading || !hasPermission}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name="delete" />
    </ConfirmationButton>
  );
};

export default FileExplorerDeleteBtn;
