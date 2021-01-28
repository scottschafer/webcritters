import { SharedData } from '../common/SharedData';
import { SimulationConstants } from '../common/SimulationConstants';
import { Critter } from './Critter';

export class Globals {
  static pixelArray: Uint32Array;
  static pointToCritterIndex: Uint32Array;
  static cellPositions: Uint16Array;

  static critters: Array<Critter>;

  static init(sharedData: SharedData) {
    const totalPixels = SimulationConstants.totalPixels;
    Globals.pixelArray = new Uint32Array(sharedData.canvasBuffer);
    Globals.pointToCritterIndex = new Uint32Array(new ArrayBuffer(4 * totalPixels));
    Globals.cellPositions = new Uint16Array(new ArrayBuffer(2 * totalPixels * SimulationConstants.maxCritterLength));
  }

  static setPixel(point: number, color: number, critterIndex = 0) {
    Globals.pixelArray[point] = color;
    Globals.pointToCritterIndex[point] = critterIndex;
  }
}