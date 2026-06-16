import { isoTimeToString } from "util/helpers";
import { fetchInstanceFileHeader } from "api/instances";
import FileExplorerDirectory from "./FileExplorerDirectory";
import FileExplorerFile from "./FileExplorerFile";
import FileExplorerActions from "./actions/FileExplorerActions";
import type { LxdInstance } from "types/instance";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";

const getFileExplorerTableRow = (
  fileName: string,
  parentPath: string,
  instance: LxdInstance,
) => {
  const fullPath =
    parentPath === "/" ? `/${fileName}` : `${parentPath}/${fileName}`;

  const { data: metadata } = useQuery({
    queryKey: [
      queryKeys.instances,
      instance.name,
      instance.project,
      queryKeys.files,
      fullPath,
      queryKeys.metadata,
    ],
    queryFn: async () =>
      fetchInstanceFileHeader(instance.name, instance.project, fullPath),
  });

  const isDirectory = metadata?.type === "directory";
  const isFile = metadata?.type === "file";
  const fileType = metadata?.type ?? "-";
  const fileModified = metadata?.modified
    ? isoTimeToString(metadata.modified)
    : "-";

  return {
    key: fileName,
    columns: [
      {
        content: isDirectory ? (
          <FileExplorerDirectory
            dirName={fileName}
            parentPath={parentPath}
            instance={instance}
          />
        ) : (
          <FileExplorerFile
            fileName={fileName}
            parentPath={parentPath}
            instance={instance}
            icon={isFile ? "file-blank" : "pods"}
          />
        ),
        role: "rowheader",
        "aria-label": "Name",
      },
      {
        content: fileType,
        role: "cell",
        "aria-label": "Type",
      },
      {
        content: fileModified,
        role: "cell",
        "aria-label": "Modified",
      },
      {
        content: (
          <FileExplorerActions
            instance={instance}
            fullPath={fullPath}
            fileType={fileType}
          />
        ),
        role: "cell",
        className: "u-align--right",
        "aria-label": "Actions",
      },
    ],
    className: "u-row",
    sortData: {
      name: fileName.toLowerCase(),
      type: fileType,
      modified: metadata?.modified ? new Date(metadata.modified).getTime() : 0,
    },
  };
};

export default getFileExplorerTableRow;
