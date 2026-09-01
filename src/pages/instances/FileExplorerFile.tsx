import type { FC } from "react";
import { getFileExplorerURL } from "util/instances";
import type { LxdInstance } from "types/instance";
import DsIcon from "components/DsIcon";
import type { IconName } from "@canonical/ds-assets";

const FileExplorerFile: FC<{
  fileName: string;
  parentPath: string;
  instance: LxdInstance;
  icon: IconName;
}> = ({ fileName, parentPath, instance, icon }) => {
  return (
    <a
      href={getFileExplorerURL(parentPath, fileName, instance)}
      download={fileName}
      className="file-explorer-item"
    >
      <DsIcon icon={icon} />
      <span className="file-explorer-item__name" title={fileName}>
        {fileName}
      </span>
    </a>
  );
};

export default FileExplorerFile;
