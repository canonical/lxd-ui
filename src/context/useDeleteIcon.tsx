import useEventListener from "@use-it/event-listener";
import { useState } from "react";
import { isWidthBelow } from "util/helpers";

export const useDeleteIcon = (): boolean => {
  const [isSmallScreen, setIsSmallScreen] = useState(isWidthBelow(620));
  const handleResize = () => {
    const newSmall = isWidthBelow(620);
    newSmall !== isSmallScreen && setIsSmallScreen(newSmall);
  };
  useEventListener("resize", handleResize);
  return isSmallScreen;
};
