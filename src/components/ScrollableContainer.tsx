import type { DependencyList, FC, ReactNode } from "react";
import { useEffect, useRef } from "react";
import useEventListener from "util/useEventListener";
import {
  getAbsoluteHeightBelowById,
  getParentsBottomSpacing,
} from "util/helpers";
import classnames from "classnames";

interface Props {
  children: ReactNode;
  dependencies: DependencyList;
  belowIds?: string[];
  className?: string;
}

const ScrollableContainer: FC<Props> = ({
  dependencies,
  children,
  belowIds = ["status-bar"],
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const updateChildContainerHeight = () => {
    const childContainer = ref.current?.children[0];
    if (!childContainer) {
      return;
    }

    const above = childContainer.getBoundingClientRect().top + 1;
    const below = belowIds.reduce(
      (acc, belowId) => acc + getAbsoluteHeightBelowById(belowId),
      0,
    );
    const parentsBottomSpacing = getParentsBottomSpacing(childContainer);
    const offset = Math.ceil(above + below + parentsBottomSpacing);
    const style = `height: calc(100dvh - ${offset}px); min-height: calc(100dvh - ${offset}px)`;
    childContainer.setAttribute("style", style);
  };

  useEventListener("resize", updateChildContainerHeight);
  useEffect(updateChildContainerHeight, [...dependencies, ref]);

  return (
    <div ref={ref} className={classnames("scrollable-container", className)}>
      <div id="content-details" className="content-details">
        {children}
      </div>
    </div>
  );
};

export default ScrollableContainer;
