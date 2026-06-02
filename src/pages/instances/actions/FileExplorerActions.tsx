import type { FC } from "react";
import { List } from "@canonical/react-components";
import classnames from "classnames";
import type { LxdInstance } from "types/instance";
import FileExplorerDeleteBtn from "./FileExplorerDeleteBtn";

interface Props {
  instance: LxdInstance;
  fileName: string;
  filePath: string;
  fileType: string;
  onDeleteSuccess: () => void;
}

const FileExplorerActions: FC<Props> = ({
  instance,
  fileName,
  filePath,
  fileType,
  onDeleteSuccess,
}) => {
  return (
    <List
      inline
      className={classnames("u-no-margin--bottom", "actions-list")}
      items={[
        <FileExplorerDeleteBtn
          key="delete"
          instance={instance}
          fileName={fileName}
          filePath={filePath}
          fileType={fileType}
          onSuccess={onDeleteSuccess}
        />,
      ]}
    />
  );
};

export default FileExplorerActions;
