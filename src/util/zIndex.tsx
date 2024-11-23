export const TOOLTIP_OVER_MODAL_ZINDEX = 150;

// nearest parents z-index that is not 0 or auto
export const getNearestParentsZIndex = (
  element: HTMLElement | null,
): string => {
  if (!document.defaultView || !element) {
    return "0";
  }
  const zIndex = document.defaultView
    .getComputedStyle(element, null)
    .getPropertyValue("z-index");
  if (!element.parentElement) {
    return zIndex;
  }
  if (zIndex === "auto" || zIndex === "0" || zIndex === "") {
    return getNearestParentsZIndex(element.parentElement);
  }
  return zIndex;
};
