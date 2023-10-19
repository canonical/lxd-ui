import { Button, Icon, Input, Select } from "@canonical/react-components";
import React, {
  FC,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { paginationOptions } from "util/pagination";
import useEventListener from "@use-it/event-listener";
import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import classnames from "classnames";

const figureSmallScreen = () => {
  const descriptionElement = document.getElementById("pagination-description");
  if (!descriptionElement) {
    return true;
  }
  return descriptionElement.getBoundingClientRect().width < 230;
};

type Props = {
  className?: string;
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
  selectedNotification?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const Pagination: FC<Props> = ({
  className,
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
  selectedNotification,
  ...divProps
}) => {
  const [isSmallScreen, setSmallScreen] = useState(figureSmallScreen());

  const resize = () => {
    setSmallScreen(figureSmallScreen());
  };
  useEventListener("resize", resize);
  useEffect(resize, []);

  const getVisibleCount = () => {
    if (selectedNotification) {
      return selectedNotification;
    }

    if (isSmallScreen) {
      return `${visibleCount} out of ${totalCount}`;
    }

    if (visibleCount === totalCount && visibleCount > 1) {
      return `Showing all ${totalCount} ${keyword}s`;
    }

    return `Showing ${visibleCount} out of ${totalCount} ${keyword}${
      totalCount !== 1 ? "s" : ""
    }`;
  };

  return (
    <div className={classnames("pagination", className)} {...divProps}>
      <div className="description" id="pagination-description">
        {getVisibleCount()}
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
            Math.max(1, parseInt(e.target.value)),
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
        className="items-per-page"
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
