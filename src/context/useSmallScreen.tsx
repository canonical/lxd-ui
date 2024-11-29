import useEventListener from "util/useEventListener";
import { useState } from "react";
import { isWidthBelow } from "util/helpers";

export const useSmallScreen = (): boolean => {
  const [isSmallScreen, setIsSmallScreen] = useState(isWidthBelow(620));
  const handleResize = () => {
    const newSmall = isWidthBelow(620);
    if (newSmall !== isSmallScreen) {
      setIsSmallScreen(newSmall);
    }
  };
  useEventListener("resize", handleResize);
  return isSmallScreen;
};
