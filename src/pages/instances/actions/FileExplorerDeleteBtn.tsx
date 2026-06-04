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
import { queryKeys } from "util/queryKeys";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  instance: LxdInstance;
  fullPath: string;
  fileType: string;
}

const FileExplorerDeleteBtn: FC<Props> = ({ instance, fullPath, fileType }) => {
  const [isLoading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const toastNotify = useToastNotification();
  const { canAccessInstanceFiles } = useInstanceEntitlements();
  const fileName =
    fileType === "file"
      ? fullPath.split("/").slice(-1)[0]
      : fullPath.split("/").slice(-2, -1)[0];

  const isDirectory = fileType === "directory";
  const directoryOrFile = isDirectory ? "Directory" : "File";
  const instanceLink = (
    <InstanceRichChip
      instanceName={instance.name}
      projectName={instance.project}
    />
  );

  const invalidateCache = () => {
    queryClient.invalidateQueries({
      queryKey: [
        queryKeys.instances,
        instance.name,
        instance.project,
        queryKeys.files,
        fullPath,
      ],
    });
  };

  const handleDelete = () => {
    setLoading(true);
    deleteInstanceFile(instance, fullPath)
      .then(() => {
        toastNotify.success(
          <>
            {directoryOrFile} {fileName} deleted from {instanceLink}
          </>,
        );
        invalidateCache();
      })
      .catch((e) => {
        toastNotify.failure(
          `Deletion failed for ${directoryOrFile.toLowerCase()} ${fileName}`,
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
