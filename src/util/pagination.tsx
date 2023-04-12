import { useState } from "react";
import { usePagination as _usePagination } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { SortDirection } from "@canonical/react-components/dist/types";

export const paginationOptions = [
  {
    label: "50/page",
    value: 50,
  },
  {
    label: "100/page",
    value: 100,
  },
  {
    label: "200/page",
    value: 200,
  },
];

export interface Pagination {
  pageData: MainTableRow[];
  currentPage: number;
  paginate: (pageNumber: number) => void;
  pageSize: number;
  setPageSize: (newSize: number) => void;
  totalPages: number;
  updateSort: (sort?: string | null) => void;
}

export const usePagination = (
  data: MainTableRow[],
  defaultSort?: string,
  defaultSortDirection: SortDirection = "ascending"
): Pagination => {
  const [_pageSize, _setPageSize] = useState(paginationOptions[0].value);
  const [sort, setSort] = useState<string | null | undefined>(defaultSort);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);

  if (sort) {
    data.sort((a, b) => {
      const aVal = a.sortData ? (a.sortData[sort] as string) : "";
      const bVal = b.sortData ? (b.sortData[sort] as string) : "";
      if (aVal > bVal) {
        return sortDirection === "ascending" ? 1 : -1;
      }
      if (aVal < bVal) {
        return sortDirection === "ascending" ? -1 : 1;
      }
      return 0;
    });
  }

  const updateSort = (newSort?: string | null) => {
    if (newSort === sort) {
      setSortDirection("descending");
    } else {
      setSortDirection("ascending");
    }
    setSort(newSort);
  };

  const usePagination = _usePagination(data, {
    itemsPerPage: _pageSize,
    autoResetPage: true,
  });

  const setPageSize = (val: number) => {
    usePagination.paginate(1);
    _setPageSize(val);
  };

  return {
    ...usePagination,
    pageSize: _pageSize,
    setPageSize,
    totalPages: Math.ceil(data.length / _pageSize),
    updateSort,
  };
};
