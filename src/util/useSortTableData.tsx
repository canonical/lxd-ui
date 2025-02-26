import type { SortDirection } from "@canonical/react-components";
import { useState } from "react";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

interface Props {
  rows: MainTableRow[];
  defaultSort?: string;
  defaultSortDirection?: SortDirection;
}

const useSortTableData = (props: Props) => {
  const { defaultSort, defaultSortDirection = "ascending", rows } = props;
  const [sort, setSort] = useState<string | null | undefined>(defaultSort);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);

  if (sort) {
    rows.sort((a, b) => {
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
    setSort(newSort || defaultSort);
  };

  return {
    rows,
    updateSort,
  };
};

export default useSortTableData;
