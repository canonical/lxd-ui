import { useState } from "react";
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

  const updateMenuCollapsed = (isCollapsed: boolean) => {
    setMenuCollapsed(isCollapsed);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("menu-collapse-toggle"));
    }, 500);
  };

  const collapseOnMediumScreen = (e: Event | CustomEvent<string>) => {
    if (isSmallScreen()) {
      return;
    }
    if (!("detail" in e) || !noCollapseEvents.has(e.detail)) {
      updateMenuCollapsed(isMediumScreen());
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
