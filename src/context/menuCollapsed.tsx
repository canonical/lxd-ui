import { useState } from "react";
import useEventListener from "util/useEventListener";
import { isWidthBelow } from "util/helpers";

const isSmallScreen = () => isWidthBelow(620);
const isMediumScreen = () => isWidthBelow(820);

const noCollapseEvents = new Set(["search-and-filter"]);

export const useMenuCollapsed = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(isMediumScreen());

  const collapseOnMediumScreen = (e: Event | CustomEvent<string>) => {
    if (isSmallScreen()) {
      return;
    }
    if (!("detail" in e) || !noCollapseEvents.has(e.detail)) {
      setMenuCollapsed(isMediumScreen());
    }
  };

  useEventListener("resize", collapseOnMediumScreen);

  const onSearchFilterPanelToggle = () => {
    if (!menuCollapsed && isSmallScreen()) {
      setMenuCollapsed(true);
    }
  };

  useEventListener("sfp-toggle", onSearchFilterPanelToggle);

  return { menuCollapsed, setMenuCollapsed };
};
