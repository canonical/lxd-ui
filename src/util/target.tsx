export const addTarget = (params: URLSearchParams, target?: string | null) => {
  if (target && target.length > 0 && target !== "none") {
    params.set("target", target);
  }
};
