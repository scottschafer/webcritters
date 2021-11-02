import { SharedData } from '../common/SharedData';
import { SimulationConstants } from '../common/SimulationConstants';
import { Critter } from './Critter';
import { SimulationSettings } from './SimulationSettings';

export class Globals {
  /* static*/ pixelArray: Uint32Array;
  /* static*/ pointToCritterIndex: Uint32Array;
  /* static*/ cellPositions: Uint16Array;

  /* static*/ critters: Array<Critter>;
  /* static*/ turn = 0;
  /* static*/ numCritters = 0;
  /* static*/ settings: SimulationSettings;

  /* static*/ init(sharedData: SharedData) {
    const totalPixels = SimulationConstants.totalPixels;
    this.pixelArray = new Uint32Array(sharedData.canvasBuffer);
    this.pointToCritterIndex = new Uint32Array(new ArrayBuffer(4 * totalPixels));
    this.cellPositions = new Uint16Array(new ArrayBuffer(2 * totalPixels * SimulationConstants.maxCritterLength));
  }

  /* static*/ setPixel(point: number, color: number, critterIndex = 0) {
    this.pixelArray[point] = color;

    if (this.pointToCritterIndex[point]
      && critterIndex
      && this.pointToCritterIndex[point]
      && critterIndex !== this.pointToCritterIndex[point]) {
      debugger;
    }
    this.pointToCritterIndex[point] = critterIndex;
  }
}

export const globals = new Globals();