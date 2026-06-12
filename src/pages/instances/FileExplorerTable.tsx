import { type FC } from "react";
import { MainTable, ScrollableTable } from "@canonical/react-components";
import type {
  MainTableHeader,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import useSortTableData from "util/useSortTableData";
import type { LxdInstance } from "types/instance";
import getFileExplorerTableRow from "pages/instances/getFileExplorerTableRow";

interface Props {
  files: string[];
  currentPath: string;
  instance: LxdInstance;
}

const FileExplorerTable: FC<Props> = ({ files, currentPath, instance }) => {
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
    {
      "aria-label": "Actions",
      className: "actions",
    },
  ];

  const rows: MainTableRow[] = files.map((fileName) =>
    getFileExplorerTableRow(fileName, currentPath, instance),
  );

  const { rows: sortedRows, updateSort } = useSortTableData({
    rows,
    defaultSort: "name",
  });

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
        className="u-selectable-table-rows"
        sortable
      />
    </ScrollableTable>
  );
};

export default FileExplorerTable;
