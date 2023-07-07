import { Button, Icon, Input, Select } from "@canonical/react-components";
import React, { FC, HTMLAttributes, useEffect, useState } from "react";
import { paginationOptions } from "util/pagination";
import useEventListener from "@use-it/event-listener";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";

const figureSmallScreen = () => {
  const descriptionElement = document.getElementById("pagination-description");
  if (!descriptionElement) {
    return true;
  }
  return descriptionElement.getBoundingClientRect().width < 230;
};

type Props = {
  pageSize: number;
  setPageSize: (val: number) => void;
  currentPage: number;
  paginate: (val: number) => void;
  visibleCount: number;
  totalCount: number;
  totalPages: number;
  keyword: string;
  pageData?: MainTableRow[];
  itemsPerPage?: number;
  totalItems?: number;
  updateSort?: (sort?: string | null) => void;
} & HTMLAttributes<HTMLDivElement>;

const Pagination: FC<Props> = ({
  pageSize,
  setPageSize,
  currentPage,
  paginate,
  visibleCount,
  totalCount,
  totalPages,
  keyword,
  pageData: _pageData,
  itemsPerPage: _itemsPerPage,
  totalItems: _totalItems,
  updateSort: _updateSort,
  ...divProps
}) => {
  const [isSmallScreen, setSmallScreen] = useState(figureSmallScreen());

  const resize = () => {
    setSmallScreen(figureSmallScreen());
  };
  useEventListener("resize", resize);
  useEffect(resize, []);

  return (
    <div className="pagination" {...divProps}>
      <div className="description" id="pagination-description">
        {isSmallScreen
          ? `${visibleCount}\xa0out\xa0of\xa0${totalCount}`
          : `Showing ${visibleCount} out of ${totalCount} ${keyword}${
              totalCount !== 1 ? "s" : ""
            }`}
      </div>
      <Button
        aria-label="Previous page"
        className="back"
        appearance="base"
        hasIcon
        disabled={currentPage === 1}
        onClick={() => {
          if (currentPage > 1) {
            paginate(currentPage - 1);
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

          paginate(newPage);
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
            paginate(currentPage + 1);
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
