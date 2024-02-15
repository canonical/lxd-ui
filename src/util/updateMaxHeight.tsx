import { getAbsoluteHeightBelow } from "./helpers";

type HeightProperty = "height" | "max-height" | "min-height";

export const updateMaxHeight = (
  targetClass: string,
  bottomClass?: string,
  additionalOffset = 0,
  targetProperty: HeightProperty = "height",
  belowIds: string[] = ["status-bar"],
): void => {
  const elements = document.getElementsByClassName(targetClass);
  const belowElements = bottomClass
    ? document.getElementsByClassName(bottomClass)
    : null;
  if (elements.length !== 1 || (belowElements && belowElements.length !== 1)) {
    return;
  }
  const above = elements[0].getBoundingClientRect().top + 1;
  let below = belowElements
    ? belowElements[0].getBoundingClientRect().height + 1
    : 0;

  below += belowIds.reduce(
    (acc, belowId) => acc + getAbsoluteHeightBelow(belowId),
    0,
  );
  const offset = Math.ceil(above + below + additionalOffset);
  const style = `${targetProperty}: calc(100vh - ${offset}px)`;
  elements[0].setAttribute("style", style);
};
