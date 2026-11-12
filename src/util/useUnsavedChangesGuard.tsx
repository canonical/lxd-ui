import { useListener } from "@canonical/react-components";
import { unstable_usePrompt as usePrompt } from "react-router";

const trimTrailingSlash = (path: string): string => path.replace(/\/+$/, "");

export const isWithinFormPath = (
  pathname: string,
  formUrl: string,
  includeSubPaths: boolean,
): boolean => {
  const path = trimTrailingSlash(pathname);
  const base = trimTrailingSlash(formUrl);
  return path === base || (includeSubPaths && path.startsWith(`${base}/`));
};

const useUnsavedChangesGuard = (
  hasChanges: boolean,
  formUrl: string,
  includeSubPaths = false,
): void => {
  usePrompt({
    when: ({ nextLocation }) =>
      hasChanges &&
      !isWithinFormPath(nextLocation.pathname, formUrl, includeSubPaths),
    message:
      "Changes you made have not been saved. Do you want to discard them?",
  });

  const handleCloseTab = (e: BeforeUnloadEvent) => {
    if (hasChanges) {
      e.preventDefault();
      e.returnValue = "Changes you made have not been saved.";
    }
  };
  useListener(window, handleCloseTab, "beforeunload");
};

export default useUnsavedChangesGuard;
