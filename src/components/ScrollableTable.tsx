import { DependencyList, FC, ReactNode, useEffect } from "react";
import useEventListener from "@use-it/event-listener";
import {
  getAbsoluteHeightBelowById,
  getParentsBottomSpacing,
} from "util/helpers";
import classnames from "classnames";

interface Props {
  children: ReactNode;
  dependencies: DependencyList;
  tableId: string;
  belowIds?: string[];
  className?: string;
}

const ScrollableTable: FC<Props> = ({
  dependencies,
  children,
  tableId,
  belowIds = [],
  className,
}) => {
  const updateTBodyHeight = () => {
    const table = document.getElementById(tableId);
    if (!table || table.children.length !== 2) {
      return;
    }

    const tBody = table.children[1];
    const above = tBody.getBoundingClientRect().top + 1;
    const below = belowIds.reduce(
      (acc, belowId) => acc + getAbsoluteHeightBelowById(belowId),
      0,
    );
    const parentsBottomSpacing = getParentsBottomSpacing(table);
    const offset = Math.ceil(above + below + parentsBottomSpacing);
    const style = `height: calc(100vh - ${offset}px); min-height: calc(100vh - ${offset}px)`;
    tBody.setAttribute("style", style);
  };

  useEventListener("resize", updateTBodyHeight);
  useEffect(updateTBodyHeight, [...dependencies]);

  return (
    <div className={classnames("scrollable-table", className)}>{children}</div>
  );
};

export default ScrollableTable;
