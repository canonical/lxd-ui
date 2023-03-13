import { Button, Icon, Input, Select } from "@canonical/react-components";
import React, { FC } from "react";
import { paginationOptions } from "util/paginationOptions";

interface Props {
  pageSize: number;
  setPageSize: (val: number) => void;
  currentPage: number;
  setCurrentPage: (val: number) => void;
  visibleCount: number;
  totalCount: number;
  totalPages: number;
  keyword: string;
}

const Pagination: FC<Props> = ({
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  visibleCount,
  totalCount,
  totalPages,
  keyword,
}) => {
  return (
    <div className="pagination">
      <div className="description">
        Showing {visibleCount} out of {totalCount} {keyword}
        {totalCount !== 1 && "s"}
      </div>
      <Button
        className="back"
        appearance="base"
        hasIcon
        disabled={currentPage === 1}
        onClick={() => {
          if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        }}
      >
        <Icon name="chevron-down" />
      </Button>
      <Input
        className="u-no-margin--bottom"
        onChange={(e) => {
          const newPage = Math.min(
            totalPages,
            Math.max(1, parseInt(e.target.value))
          );

          setCurrentPage(newPage);
        }}
        value={currentPage}
        type="number"
      />{" "}
      of&nbsp;{totalPages}
      <Button
        className="next"
        appearance="base"
        hasIcon
        disabled={currentPage === totalPages}
        onClick={() => {
          if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
          }
        }}
      >
        <Icon name="chevron-down" />
      </Button>
      <Select
        options={paginationOptions}
        onChange={(e) => {
          setPageSize(parseInt(e.target.value));
        }}
        value={pageSize}
      />
    </div>
  );
};

export default Pagination;
