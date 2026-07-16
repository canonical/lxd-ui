import { Icon } from "@canonical/react-components";
import type { FC } from "react";
import { Link } from "react-router-dom";
import type { LxdInstance } from "types/instance";
import { getFileExplorerDirectoryURL, getFullPath } from "util/instances";

const FileExplorerDirectory: FC<{
  dirName: string;
  parentPath: string;
  instance: LxdInstance;
}> = ({ dirName, parentPath, instance }) => {
  const fullPath = getFullPath(parentPath, dirName);

  return (
    <Link
      to={getFileExplorerDirectoryURL(fullPath, instance)}
      className="file-explorer-item"
    >
      <Icon name="folder" />
      <span className="file-explorer-item__name" title={dirName}>
        {dirName}
      </span>
    </Link>
  );
};

export default FileExplorerDirectory;
