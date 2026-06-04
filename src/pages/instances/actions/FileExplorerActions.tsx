import type { FC } from "react";
import { List } from "@canonical/react-components";
import classnames from "classnames";
import type { LxdInstance } from "types/instance";
import FileExplorerDeleteBtn from "./FileExplorerDeleteBtn";

interface Props {
  instance: LxdInstance;
  fullPath: string;
  fileType: string;
}

const FileExplorerActions: FC<Props> = ({ instance, fullPath, fileType }) => {
  return (
    <List
      inline
      className={classnames("u-no-margin--bottom", "actions-list")}
      items={[
        <FileExplorerDeleteBtn
          key="delete"
          instance={instance}
          fullPath={fullPath}
          fileType={fileType}
        />,
      ]}
    />
  );
};

export default FileExplorerActions;
