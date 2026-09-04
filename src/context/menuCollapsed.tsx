import { useRef, useState } from "react";
import { isDimensionBelow } from "util/helpers";
import {
  mediumScreenBreakpoint,
  smallScreenBreakpoint,
} from "./useIsScreenBelow";
import { useListener } from "@canonical/react-components";

const isSmallScreen = () => isDimensionBelow(smallScreenBreakpoint, "width");
const isMediumScreen = () => isDimensionBelow(mediumScreenBreakpoint, "width");

const noCollapseEvents = new Set(["search-and-filter"]);

export const useMenuCollapsed = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(isMediumScreen());
  const previousWidth = useRef(window.innerWidth);

  const updateMenuCollapsed = (isCollapsed: boolean) => {
    setMenuCollapsed(isCollapsed);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("menu-collapse-toggle"));
    }, 500);
  };

  const collapseOnMediumScreen = (e: Event | CustomEvent<string>) => {
    const newWidth = window.innerWidth;
    const oldWidth = previousWidth.current;
    previousWidth.current = newWidth;

    if ("detail" in e && noCollapseEvents.has(e.detail)) {
      return;
    }

    const isIncreasingLarge =
      newWidth >= mediumScreenBreakpoint && oldWidth < mediumScreenBreakpoint;
    if (isIncreasingLarge) {
      updateMenuCollapsed(false);
      return;
    }

    const isIncreasingSmall =
      newWidth >= smallScreenBreakpoint && oldWidth < smallScreenBreakpoint;
    if (isIncreasingSmall) {
      updateMenuCollapsed(true);
      return;
    }

    const isDecreasing =
      newWidth < mediumScreenBreakpoint && oldWidth >= mediumScreenBreakpoint;
    if (isDecreasing) {
      updateMenuCollapsed(true);
    }
  };

  useListener(window, collapseOnMediumScreen, "resize", true);

  const onSearchFilterPanelToggle = () => {
    if (!menuCollapsed && isSmallScreen()) {
      updateMenuCollapsed(true);
    }
  };

  useListener(window, onSearchFilterPanelToggle, "sfp-toggle");

  return { menuCollapsed, updateMenuCollapsed };
};
