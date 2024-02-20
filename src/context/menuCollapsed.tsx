import { useState } from "react";
import useEventListener from "@use-it/event-listener";
import { isWidthBelow } from "util/helpers";

const isSmallScreen = () => isWidthBelow(620);
const isMediumScreen = () => isWidthBelow(820);

export const useMenuCollapsed = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(isMediumScreen());

  const collapseOnMediumScreen = (e: Event | CustomEvent<string>) => {
    if (isSmallScreen()) {
      return;
    }
    if (!("detail" in e) || e.detail !== "search-and-filter") {
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
