import { useState } from "react";
import useEventListener from "@use-it/event-listener";
import { isWidthBelow } from "util/helpers";

const isSmallScreen = () => isWidthBelow(620);

export const useMenuCollapsed = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  const collapseOnMediumScreen = (e: Event) => {
    if (!("detail" in e) || e.detail !== "search-and-filter") {
      setMenuCollapsed(isWidthBelow(820));
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
