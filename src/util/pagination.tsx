import { useState } from "react";
import { usePagination as _usePagination } from "@canonical/react-components";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

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

export const usePagination = (
  data: MainTableRow[]
): {
  pageData: MainTableRow[];
  currentPage: number;
  paginate: (pageNumber: number) => void;
  pageSize: number;
  setPageSize: (newSize: number) => void;
} => {
  const [_pageSize, _setPageSize] = useState(paginationOptions[0].value);

  const usePagination = _usePagination(data, {
    itemsPerPage: _pageSize,
    autoResetPage: true,
  });

  const setPageSize = (val: number) => {
    usePagination.paginate(1);
    _setPageSize(val);
  };

  return { ...usePagination, pageSize: _pageSize, setPageSize };
};
