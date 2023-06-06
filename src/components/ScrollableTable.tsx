import React, { DependencyList, FC, ReactNode, useEffect, useRef } from "react";
import useEventListener from "@use-it/event-listener";
import { getParentsBottomSpacing } from "util/helpers";

interface Props {
  children: ReactNode;
  dependencies: DependencyList;
  belowId?: string;
}

const ScrollableTable: FC<Props> = ({ dependencies, children, belowId }) => {
  const ref = useRef<HTMLDivElement>(null);

  const getAbsoluteHeightBelow = () => {
    const element = belowId ? document.getElementById(belowId) : undefined;
    if (!element) {
      return 0;
    }
    const style = window.getComputedStyle(element);
    const margin = parseInt(style.marginTop) + parseInt(style.marginBottom);
    return element.offsetHeight + margin;
  };

  const updateTBodyHeight = () => {
    const table = ref.current?.children[0];
    if (!table || table.children.length !== 2) {
      return;
    }
    const tBody = table.children[1];
    const above = tBody.getBoundingClientRect().top + 1;
    const below = getAbsoluteHeightBelow();
    const parentsBottomSpacing = getParentsBottomSpacing(table as HTMLElement);
    const offset = Math.ceil(above + below + parentsBottomSpacing);
    const style = `height: calc(100vh - ${offset}px); min-height: calc(100vh - ${offset}px)`;
    tBody.setAttribute("style", style);
  };

  useEventListener("resize", updateTBodyHeight);
  useEffect(updateTBodyHeight, [...dependencies, ref]);

  return (
    <div ref={ref} className="scrollable-table">
      {children}
    </div>
  );
};

export default ScrollableTable;
