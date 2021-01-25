/**
 * A collection of shared arrays that describe cells
 */
export type CrittersData = {
  firstCellIndex_u16: SharedArrayBuffer;
  genomeIndex_u16: SharedArrayBuffer;
  energy_u8: SharedArrayBuffer;
  orientation_u8: SharedArrayBuffer;
};
