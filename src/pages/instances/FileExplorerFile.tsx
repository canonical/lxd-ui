import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { getFileExplorerFileURL } from "util/instances";
import type { LxdInstance } from "types/instance";

const FileExplorerFile: FC<{
  fileName: string;
  parentPath: string;
  instance: LxdInstance;
  icon: string;
}> = ({ fileName, parentPath, instance, icon }) => {
  return (
    <a
      href={getFileExplorerFileURL(parentPath, fileName, instance)}
      download={fileName}
      className="file-explorer-item"
    >
      <Icon name={icon} />
      <span>{fileName}</span>
    </a>
  );
};

export default FileExplorerFile;
