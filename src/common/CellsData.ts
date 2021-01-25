/**
 * A collection of shared arrays that describe cells
 */
export type CellsData = {
  x_u16: SharedArrayBuffer;
  y_u16: SharedArrayBuffer;
  colors_u32: SharedArrayBuffer;
  nextCell_u16: SharedArrayBuffer;
};
