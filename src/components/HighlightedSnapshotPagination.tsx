import { useCallback, useState, type FC, type ReactNode } from "react";
import { TablePagination, usePagination } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useLocation, useSearchParams } from "react-router-dom";
import classnames from "classnames";

export const SNAPSHOT_PARAM = "snapshot";

// first page limit of TablePagination
const PAGE_SIZE = 50;

interface Props {
  rows: MainTableRow[];
  description: ReactNode;
  children: ReactNode;
}

interface PaginationProps extends Props {
  highlightedName: string | null;
}

const Pagination: FC<PaginationProps> = ({
  rows,
  description,
  children,
  highlightedName,
}) => {
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const highlightedIndex = rows.findIndex(
    (row) => row.name === highlightedName,
  );
  const { pageData, currentPage, paginate } = usePagination(rows, {
    itemsPerPage: pageSize,
    initialPage: Math.floor(Math.max(highlightedIndex, 0) / pageSize) + 1,
    autoResetPage: true,
  });

  const scrollIntoView = useCallback((row: HTMLTableRowElement | null) => {
    row?.scrollIntoView({ block: "nearest" });
  }, []);

  return (
    <TablePagination
      externallyControlled
      data={pageData.map((row) =>
        row.name === highlightedName
          ? {
              ...row,
              className: classnames(row.className, "is-highlighted"),
              "aria-current": true,
              ref: scrollIntoView,
            }
          : row,
      )}
      totalItems={rows.length}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={paginate}
      onPageSizeChange={(size) => {
        paginate(1);
        setPageSize(size);
      }}
      id="pagination"
      itemName="snapshot"
      className="u-no-margin--top"
      aria-label="Table pagination control"
      description={description}
    >
      {children}
    </TablePagination>
  );
};

const HighlightedSnapshotPagination: FC<Props> = (props) => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const highlightedName = searchParams.get(SNAPSHOT_PARAM);

  // a new key opens the page of each newly linked snapshot
  return (
    <Pagination
      key={`${pathname}?${highlightedName}`}
      highlightedName={highlightedName}
      {...props}
    />
  );
};

export default HighlightedSnapshotPagination;
