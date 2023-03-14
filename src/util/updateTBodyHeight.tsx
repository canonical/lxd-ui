export const updateTBodyHeight = (wrapperId: string) => {
  const table = document.getElementById(wrapperId);
  if (!table || table.children.length !== 2) {
    return;
  }
  const tBody = table.children[1];
  const above = tBody.getBoundingClientRect().top + 1;
  const below = 85;
  const offset = Math.ceil(above + below);
  const style = `height: calc(100vh - ${offset}px); min-height: calc(100vh - ${offset}px)`;
  tBody.setAttribute("style", style);
};
