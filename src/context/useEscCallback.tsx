import { useListener } from "@canonical/react-components";

export const useEscCallback = (callback: () => void) => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      callback();
    }
  };

  useListener(window, handleKeyPress, "keydown", true);
};
