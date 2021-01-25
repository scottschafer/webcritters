import { CellsData } from './CellsData';
import { CrittersData } from './CrittersData';

export type SharedData = {
  canvasBuffer: SharedArrayBuffer;
  cellsData: CellsData;
  crittersData: CrittersData;
};