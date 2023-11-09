type Args = {
  [x: string]: number | string;
};

/**
 * Creates a function to transform a react-router style URL into a full path.
 * @param path - A path in react-router format e.g. /machine/:id
 * @template A - The type of the url args object.
 * @returns A function to generate the full url or a url string for react-router.
 */
export const argPath =
  <A extends Args>(path: string) =>
  /**
   *
   * @param args An object of URL parameters. The object keys match the URL
   * params, e.g. for `/machine/:id` you would pass `{id: 1}`. This should be
   * `null` when you wish to return the unmodified react-router URL.
   * @param relativeTo If provided a relative path will be returned.
   * @returns The complete or unmodified URL.
   */
  (args: A | null, relativeTo?: string): string => {
    const url = args
      ? Object.entries(args).reduce(
          (exactPath, [param, value]) =>
            exactPath.replace(`:${param}`, value.toString()),
          path,
        )
      : path;
    // Remove the trailing "/"" if there is one.
    relativeTo = relativeTo?.replace(/\/$/, "");
    if (relativeTo && url.startsWith(relativeTo)) {
      const relative = url.replace(relativeTo, "");
      // Remove the "/" at the start of the relative URL, if there is one.
      return relative.startsWith("/") ? relative.replace(/^\//, "") : relative;
    }
    return url;
  };
