import { useEffect, useState, type FC } from "react";
import {
  MainTable,
  ScrollableTable,
  Spinner,
} from "@canonical/react-components";
import type {
  MainTableHeader,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import useSortTableData from "util/useSortTableData";
import type { LxdFileMetadata } from "types/fileExplorer";
import { isoTimeToString } from "util/helpers";
import { fetchInstanceFileHeader } from "api/instances";
import FileExplorerDirectory from "./FileExplorerDirectory";
import FileExplorerFile from "./FileExplorerFile";
import type { LxdInstance } from "types/instance";

interface Props {
  files: string[];
  currentPath: string;
  instance: LxdInstance;
}

const FileExplorerTable: FC<Props> = ({ files, currentPath, instance }) => {
  const [fileMetadata, setFileMetadata] = useState<
    Map<string, LxdFileMetadata>
  >(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoading(true);
      const metadataMap = new Map<string, LxdFileMetadata>();

      await Promise.all(
        files.map(async (fileName) => {
          try {
            const filePath =
              currentPath === "/"
                ? `/${fileName}`
                : `${currentPath}/${fileName}`;

            const fileMetadata = await fetchInstanceFileHeader(
              instance.name,
              instance.project,
              filePath,
            );

            metadataMap.set(fileName, fileMetadata);
          } catch (e) {
            console.error(`Failed to fetch metadata for ${fileName}:`, e);
            metadataMap.set(fileName, {
              type: "unknown",
              modified: "-",
            });
          }
        }),
      );

      setFileMetadata(metadataMap);
      setIsLoading(false);
    };

    void fetchMetadata();
  }, [files, currentPath, instance.name, instance.project]);

  const headers: MainTableHeader[] = [
    {
      content: "Name",
      sortKey: "name",
    },
    {
      content: "Type",
      sortKey: "type",
    },
    {
      content: "Modified",
      sortKey: "modified",
    },
  ];

  const rows: MainTableRow[] = files.map((fileName) => {
    const metadata = fileMetadata.get(fileName);
    const isDirectory = metadata?.type === "directory";
    const isFile = metadata?.type === "file";
    const fileType = metadata?.type ?? "unknown";
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
              parentPath={currentPath}
              instance={instance}
            />
          ) : (
            <FileExplorerFile
              fileName={fileName}
              parentPath={currentPath}
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
      ],
      sortData: {
        name: fileName.toLowerCase(),
        type: fileType,
        modified: fileModified,
      },
    };
  });

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
    defaultSort: "name",
  });

  if (isLoading) {
    return <Spinner text="Loading file metadata..." />;
  }

  return (
    <ScrollableTable
      dependencies={[headers, sortedRows]}
      tableId="file-explorer-table"
      belowIds={["status-bar"]}
    >
      <MainTable
        headers={headers}
        rows={sortedRows}
        onUpdateSort={updateSort}
        emptyStateMsg="No files or directories"
        sortable
      />
    </ScrollableTable>
  );
};

export default FileExplorerTable;
