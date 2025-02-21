import { lazy } from "react";
import { delay } from "./helpers";

const RETRIES = 5;
const DELAY_TIME = 300;

// This function is a wrapper around React.lazy that will retry the import
// keeping the function type signature the same as React.lazy
// using "any" type here allows for components with any type interface to be imported
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lazyWithRetry = <T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
) => {
  const retryImport = async () => {
    try {
      const module = await importFunction();
      return module;
    } catch (error) {
      let lastError = error as Error;
      for (let attempt = 0; attempt < RETRIES; attempt++) {
        await delay(DELAY_TIME * attempt);

        // dynamic import i.e. import() unfortunately caches network response for fetching modules
        // this is true even if a module fails to load
        // if we simply just retry the import, the cached error response will be returned
        // to work around this, we can invalidate the cache by adding a dynamic query parameter to the module URL
        // the original module url can be potentially found in the error message
        // HOWEVER, this is not a guaranteed solution since the error message may not contain the module URL depending on the browser used
        // therefore, this is a best effort attempt, worst case scenario, the error will be thrown again causing the error boundary to render
        const origin = window.location.origin;
        const errorSegments = (error as Error).message.split(" ");
        let moduleUrl = "";
        for (const segment of errorSegments) {
          if (segment.startsWith(origin)) {
            moduleUrl = segment;
            break;
          }
        }

        const url = new URL(moduleUrl.trim());
        // add a timestamp query parameter to invalidate the cache
        url.searchParams.set("cacheBuster", `${+Date.now()}`);

        try {
          // vite does not support static checks with dynamic imports that takes in a non-relative path
          // ref: https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
          const module = (await import(/* @vite-ignore */ url.href)) as {
            default: T;
          };
          return module;
        } catch (e) {
          lastError = e as Error;
        }
      }

      throw lastError;
    }
  };

  return lazy(retryImport);
};

export default lazyWithRetry;
