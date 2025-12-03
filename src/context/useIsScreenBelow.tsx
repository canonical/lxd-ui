import { useState } from "react";
import { isDimensionBelow } from "util/helpers";
import { useListener } from "@canonical/react-components";

export const smallScreenBreakpoint = 620;
export const mediumScreenBreakpoint = 820;
export const largeScreenBreakpoint = 1200;

export const useIsScreenBelow = (
  breakpoint = smallScreenBreakpoint,
  mode: "width" | "height" = "width",
): boolean => {
  const [isScreenBelow, setScreenBelow] = useState(
    isDimensionBelow(breakpoint, mode),
  );

  const updateIsBelow = () => {
    if (isDimensionBelow(breakpoint, mode) !== isScreenBelow) {
      setScreenBelow(!isScreenBelow);
    }
  };
  useListener(window, updateIsBelow, "resize", true);

  return isScreenBelow;
};
