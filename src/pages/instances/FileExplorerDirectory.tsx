import type { FC } from "react";
import { Link } from "react-router-dom";
import type { LxdInstance } from "types/instance";
import { getFileExplorerDirectoryURL, getFullPath } from "util/instances";
import DsIcon from "components/DsIcon";

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
      <DsIcon icon="folder" />
      <span className="file-explorer-item__name" title={dirName}>
        {dirName}
      </span>
    </Link>
  );
};

export default FileExplorerDirectory;
