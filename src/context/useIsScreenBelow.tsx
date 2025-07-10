import useEventListener from "util/useEventListener";
import { useState } from "react";
import { isWidthBelow } from "util/helpers";

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
  useEventListener("resize", updateIsBelow);

  return isScreenBelow;
};
