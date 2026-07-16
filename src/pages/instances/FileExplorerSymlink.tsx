import { type FC, useState } from "react";
import {
  Button,
  Icon,
  Spinner,
  useToastNotification,
} from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import type { LxdInstance } from "types/instance";
import { fetchSymlinkContent, fetchInstanceFileHeader } from "api/instances";
import {
  getFileExplorerDirectoryURL,
  getFileExplorerURL,
  getFullPath,
  resolveSymlinkTarget,
} from "util/instances";

const MAX_SYMLINK_DEPTH = 10;

interface Props {
  fileName: string;
  parentPath: string;
  instance: LxdInstance;
}

const isValidSymlinkTarget = (target: string): boolean => {
  return target.length > 0 && target.length <= 4096 && !target.includes("\0");
};

const FileExplorerSymlink: FC<Props> = ({ fileName, parentPath, instance }) => {
  const navigate = useNavigate();
  const toastNotify = useToastNotification();
  const [isLoading, setIsLoading] = useState(false);

  const fullPath = getFullPath(parentPath, fileName);

  const handleSymlink = async (
    path: string,
    depth = 0,
    originalPath?: string,
  ) => {
    const navigatePath = originalPath ?? path;
    if (depth >= MAX_SYMLINK_DEPTH) {
      toastNotify.failure(
        "Symlink resolution failed",
        new Error("Too many levels of symbolic link nesting"),
      );
      return;
    }

    setIsLoading(true);
    try {
      const target = await fetchSymlinkContent(
        instance.name,
        instance.project,
        path,
      );

      const trimmedTarget = target.trim();

      if (!isValidSymlinkTarget(trimmedTarget)) {
        toastNotify.failure(
          "Symlink resolution failed",
          new Error("Invalid symlink target"),
        );
        return;
      }

      const resolvedTarget = resolveSymlinkTarget(trimmedTarget, path);
      const metadata = await fetchInstanceFileHeader(
        instance.name,
        instance.project,
        resolvedTarget,
      );

      if (metadata.type === "directory") {
        navigate(getFileExplorerDirectoryURL(navigatePath, instance));
      } else if (metadata.type === "symlink") {
        await handleSymlink(resolvedTarget, depth + 1, navigatePath);
      } else {
        const url = getFileExplorerURL(resolvedTarget, undefined, instance);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      toastNotify.failure(
        "Symlink resolution failed",
        error instanceof Error ? error : new Error("Failed to resolve symlink"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="file-explorer-item u-no-margin--bottom"
      appearance="link"
      onClick={() => {
        void handleSymlink(fullPath);
      }}
      disabled={isLoading}
    >
      {isLoading ? <Spinner /> : <Icon name="connected" />}
      <span className="file-explorer-item__name" title={fileName}>
        {fileName}
      </span>
    </Button>
  );
};

export default FileExplorerSymlink;
