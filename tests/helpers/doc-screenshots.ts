// x,y is top left coordinate, xx,yy is bottom right coordinate
// gimp provides the coordinates of the area easily
export const getClipPosition = (
  x: number,
  y: number,
  xx: number,
  yy: number,
) => {
  return {
    x: x,
    y: y,
    width: xx - x,
    height: yy - y,
  };
};
