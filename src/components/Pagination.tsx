import { Button, Icon, Input, Select } from "@canonical/react-components";
import React, { FC } from "react";
import { paginationOptions } from "util/pagination";

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
        aria-label="Previous page"
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
        id="paginationPageInput"
        label="Page number"
        labelClassName="u-off-screen"
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
        aria-label="Next page"
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
        label="Items per page"
        labelClassName="u-off-screen"
        id="itemsPerPage"
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
