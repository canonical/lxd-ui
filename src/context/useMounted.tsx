import type { RefObject } from "react";
import { useEffect, useRef } from "react";

export const useMounted = (): RefObject<boolean> => {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
};
