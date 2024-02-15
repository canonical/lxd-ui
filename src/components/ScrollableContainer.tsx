import { DependencyList, FC, ReactNode, useEffect, useRef } from "react";
import useEventListener from "@use-it/event-listener";
import { getAbsoluteHeightBelow, getParentsBottomSpacing } from "util/helpers";

interface Props {
  children: ReactNode;
  dependencies: DependencyList;
  belowId?: string;
}

const ScrollableContainer: FC<Props> = ({
  dependencies,
  children,
  belowId = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const updateChildContainerHeight = () => {
    const childContainer = ref.current?.children[0];
    if (!childContainer) {
      return;
    }
    const above = childContainer.getBoundingClientRect().top + 1;
    const below = getAbsoluteHeightBelow(belowId);
    const parentsBottomSpacing =
      getParentsBottomSpacing(childContainer) +
      getAbsoluteHeightBelow("status-bar");
    const offset = Math.ceil(above + below + parentsBottomSpacing);
    const style = `height: calc(100vh - ${offset}px); min-height: calc(100vh - ${offset}px)`;
    childContainer.setAttribute("style", style);
  };

  useEventListener("resize", updateChildContainerHeight);
  useEffect(updateChildContainerHeight, [...dependencies, ref]);

  return (
    <div ref={ref} className="scrollable-container">
      <div className="content-details">{children}</div>
    </div>
  );
};

export default ScrollableContainer;
