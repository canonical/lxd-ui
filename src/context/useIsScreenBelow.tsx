import { useState } from "react";
import { isWidthBelow } from "util/helpers";
import { useListener } from "@canonical/react-components";

export const smallScreenBreakpoint = 620;
export const mediumScreenBreakpoint = 820;
export const largeScreenBreakpoint = 1200;

export const useIsScreenBelow = (
  breakpoint = smallScreenBreakpoint,
): boolean => {
  const [isScreenBelow, setScreenBelow] = useState(isWidthBelow(breakpoint));

  const updateIsBelow = () => {
    if (isWidthBelow(breakpoint) !== isScreenBelow) {
      setScreenBelow(!isScreenBelow);
    }
  };
  useListener(window, updateIsBelow, "resize", true);

  return isScreenBelow;
};
