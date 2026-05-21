import { FC, useState } from "react";
import { fetchInstanceFileHeader } from "api/instances";
import type { LxdInstance } from "types/instance";

interface Props {
  instance: LxdInstance;
  currentPath: string;
  fileOrFolderName: string;
  onClick: () => void;
}

const InstanceFileExplorerItem: FC<Props> = ({
  instance,
  currentPath,
  fileOrFolderName,
  onClick,
}) => {
  const [type, setType] = useState("");
  const [modified, setModified] = useState("");

  fetchInstanceFileHeader(
    instance.name,
    instance.project,
    currentPath + "/" + fileOrFolderName,
  ).then((data) => {
    console.log(data);
    setType(data.headers.get("x-lxd-type"));
    setModified(data.headers.get("x-lxd-modified"));
  });

  return (
    <div key={fileOrFolderName} onClick={onClick}>
      {fileOrFolderName} ({type}) ({modified})
    </div>
  );
};

export default InstanceFileExplorerItem;
