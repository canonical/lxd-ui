import { useCallback, useEffect, useRef, useState } from "react";
import { usePagination } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useSearchParams } from "react-router-dom";
import classnames from "classnames";

export const SNAPSHOT_PARAM = "snapshot";

// first page limit of TablePagination
const PAGE_SIZE = 50;

// Opens the page of the snapshot named in the URL and highlights its row
const useSnapshotTablePagination = (rows: MainTableRow[]) => {
  const [searchParams] = useSearchParams();
  const highlightedName = searchParams.get(SNAPSHOT_PARAM);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const { pageData, currentPage, paginate } = usePagination(rows, {
    itemsPerPage: pageSize,
    autoResetPage: true,
  });
  const openedName = useRef<string | null>(null);
  const highlightedIndex = rows.findIndex(
    (row) => row.name === highlightedName,
  );

  useEffect(() => {
    if (highlightedIndex >= 0 && openedName.current !== highlightedName) {
      paginate(Math.floor(highlightedIndex / pageSize) + 1);
      openedName.current = highlightedName;
    }
  }, [highlightedIndex, highlightedName]);

  const scrollIntoView = useCallback((row: HTMLTableRowElement | null) => {
    row?.scrollIntoView({ block: "nearest" });
  }, []);

  return {
    externallyControlled: true as const,
    data: pageData.map((row) =>
      row.name === highlightedName
        ? {
            ...row,
            className: classnames(row.className, "is-highlighted"),
            "aria-current": true,
            ref: scrollIntoView,
          }
        : row,
    ),
    totalItems: rows.length,
    currentPage,
    pageSize,
    onPageChange: paginate,
    onPageSizeChange: (size: number) => {
      paginate(1);
      setPageSize(size);
    },
  };
};

export default useSnapshotTablePagination;
