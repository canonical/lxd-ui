import type { FC } from "react";
import { Icon } from "@canonical/react-components";
import { getFileExplorerURL } from "util/instances";
import type { LxdInstance } from "types/instance";

const FileExplorerFile: FC<{
  fileName: string;
  parentPath: string;
  instance: LxdInstance;
  icon: string;
}> = ({ fileName, parentPath, instance, icon }) => {
  return (
    <a
      href={getFileExplorerURL(parentPath, fileName, instance)}
      download={fileName}
      className="file-explorer-item"
    >
      <Icon name={icon} />
      <span className="file-explorer-item__name" title={fileName}>
        {fileName}
      </span>
    </a>
  );
};

export default FileExplorerFile;
