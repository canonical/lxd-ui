import type { FC } from "react";
import { useEffect, useState } from "react";
import { Icon, MainTable, Spinner } from "@canonical/react-components";
import type {
  MainTableHeader,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import useSortTableData from "util/useSortTableData";
import type { FileMetadata } from "types/fileExplorer";
import { isoTimeToString } from "util/helpers";
import { fetchInstanceFileHeader } from "api/instances";
import { Link } from "react-router-dom";

interface Props {
  files: string[];
  currentPath: string;
  instanceName: string;
  projectName: string;
  onNavigate: (path: string) => void;
}

const FileExplorerTable: FC<Props> = ({
  files,
  currentPath,
  instanceName,
  projectName,
  onNavigate,
}) => {
  const [fileMetadata, setFileMetadata] = useState<Map<string, FileMetadata>>(
    new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoading(true);
      const metadataMap = new Map<string, FileMetadata>();

      await Promise.all(
        files.map(async (fileName) => {
          try {
            const filePath =
              currentPath === "/"
                ? `/${fileName}`
                : `${currentPath}/${fileName}`;

            const response = await fetchInstanceFileHeader(
              instanceName,
              projectName,
              filePath,
            );

            metadataMap.set(fileName, {
              name: fileName,
              type: response.headers.get("x-lxd-type") ?? "unknown",
              modified: response.headers.get("x-lxd-modified") ?? "-",
            });
          } catch (e) {
            console.error(`Failed to fetch metadata for ${fileName}:`, e);
            metadataMap.set(fileName, {
              name: fileName,
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
  }, [files, currentPath, instanceName, projectName]);
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

    const getIcon = () => {
      if (isDirectory) return "folder";
      if (isFile) return "file-blank";
      return "pods";
    };

    return {
      key: fileName,
      columns: [
        {
          content: (
            <Link to="#" className="fe-item">
              <Icon name={getIcon()} />
              <span>{fileName}</span>
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Name",
          className: isDirectory ? "fe-directory" : "",
          onClick: isDirectory
            ? () => {
                onNavigate(
                  currentPath === "/"
                    ? `/${fileName}`
                    : `${currentPath}/${fileName}`,
                );
              }
            : undefined,
          style: isDirectory ? { cursor: "pointer" } : undefined,
        },
        {
          content: metadata?.type ?? "loading...",
          role: "cell",
          "aria-label": "Type",
        },
        {
          content: metadata?.modified
            ? isoTimeToString(metadata.modified)
            : "loading...",
          role: "cell",
          "aria-label": "Modified",
        },
      ],
      sortData: {
        name: fileName.toLowerCase(),
        type: metadata?.type ?? "unknown",
        modified: metadata?.modified ?? "-",
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
    <MainTable
      headers={headers}
      rows={sortedRows}
      onUpdateSort={updateSort}
      emptyStateMsg="No files or directories"
      sortable
    />
  );
};

export default FileExplorerTable;
