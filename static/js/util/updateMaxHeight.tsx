export const updateMaxHeight = (targetClass: string, bottomClass: string) => {
  const elements = document.getElementsByClassName(targetClass);
  const belowElements = document.getElementsByClassName(bottomClass);
  if (elements.length !== 1 || belowElements.length !== 1) {
    return;
  }
  const above = elements[0].getBoundingClientRect().top + 1;
  const below = belowElements[0].getBoundingClientRect().height + 1;
  const offset = Math.ceil(above + below);
  const style = `height: calc(100vh - ${offset}px)`;
  elements[0].setAttribute("style", style);
};
