import { SharedData } from '../common/SharedData';
import { SimulationConstants } from '../common/SimulationConstants';
import { Colors } from './Colors';
import { Critter } from './Critter';
import { genomeRepository } from './GenomeRepository';
import { Orientation } from './Orientation';

const NULL_VAL = 0xFFFF;

export class World {
  turn = 0;
  numCritters = 0;

  emptyCritterSlots: Array<number> = [];
  emptyCellSlots: Array<number> = [];

  pixelArray: Int32Array;
  cells: {
    x: Uint16Array;
    y: Uint16Array;
    colors: Uint32Array;
    nextCell: Uint16Array;
  };

  critters: {
    firstCellIndex: Uint16Array;
    genomeIndex: Uint16Array;
    energy: Uint8Array;
    orientation: Uint8Array;
  };

  init(sharedData: SharedData) {
    this.pixelArray = new Int32Array(sharedData.canvasBuffer);
    this.cells = {
      x: new Uint16Array(sharedData.cellsData.x_u16),
      y: new Uint16Array(sharedData.cellsData.y_u16),
      colors: new Uint32Array(sharedData.cellsData.colors_u32),
      nextCell: new Uint16Array(sharedData.cellsData.nextCell_u16),
    }
    this.critters = {
      firstCellIndex: new Uint16Array(sharedData.crittersData.firstCellIndex_u16),
      genomeIndex: new Uint16Array(sharedData.crittersData.genomeIndex_u16),
      energy: new Uint8Array(sharedData.crittersData.energy_u8),
      orientation: new Uint8Array(sharedData.crittersData.orientation_u8),
    }
    this.reset();
  }


  takeTurn() {
    let iCritter = 0;
    for (let i = 0; i < this.numCritters;) {
      while (this.critters.firstCellIndex[iCritter] === NULL_VAL) {
        ++iCritter;
      }

      Critter.takeTurn(this, iCritter);

      if (Critter.canSpawn(this, iCritter)) {
        const iCell = this.critters.firstCellIndex[iCritter];
        let x = this.cells.x[iCell];
        let y = this.cells.y[iCell];
        let newPos = this.findEmptyPos(x, y);
        if (newPos) {
          this.spawn('', newPos.x, newPos.y);
        }
      }
      ++iCritter;
      ++i;
    }

    ++this.turn;

    return this.turn;
  }

  reset() {
    this.turn = 0;

    // clear board
    for (let i = 0; i < this.pixelArray.length; i++) {
      this.pixelArray[i] = Colors[0];
    }

    // reset critters arrays
    this.numCritters = 0;
    for (let i = 0; i < SimulationConstants.maxCells; i++) {
      this.cells.x[i] = this.cells.y[i] = this.cells.colors[i] = this.cells.nextCell[i] = NULL_VAL;
    }

    // reset empty slot indices
    this.emptyCritterSlots = [];
    for (let i = 0; i < SimulationConstants.maxCritters; i++) {
      this.emptyCritterSlots.push(SimulationConstants.maxCritters - i - 1);
    }

    this.emptyCellSlots = [];
    for (let i = 0; i < SimulationConstants.maxCells; i++) {
      this.emptyCellSlots.push(SimulationConstants.maxCells - i - 1);
    }

    for (let i = 0; i < 1; i++) { // SimulationConstants.maxCritters / 10; i++) {
      const pos = this.findEmptyPos();
      this.spawn('P', pos.x, pos.y);
    }
  }

  findEmptyPos(x?: number, y?: number): { x: number, y: number } {

    if (x !== undefined && y !== undefined) {

      let testArray = Orientation.shuffledDeltas[Math.floor(Math.random() * Orientation.shuffledDeltas.length)];
      for (let iTest = 0; iTest < testArray.length; iTest++) {
        const [xD, yD] = testArray[iTest];
        let xTest = x + xD;
        let yTest = y + yD;
        if (xTest >= 0 && xTest < SimulationConstants.worldDim && yTest >= 0 && yTest < SimulationConstants.worldDim) {
          let pixel = this.pixelArray[yTest * SimulationConstants.worldDim + xTest];
          if (pixel === Colors[0]) {
            return { x: xTest, y: yTest };
          }
        }
      }
      return undefined;
    }


    while (true) {
      let x = Math.floor(Math.random() * SimulationConstants.worldDim);
      let y = Math.floor(Math.random() * SimulationConstants.worldDim);
      let pixel = this.pixelArray[y * SimulationConstants.worldDim + x];
      if (pixel === Colors[0]) {
        return { x, y };
      }
    }
    // return result;
  }

  spawn(genome: string, x: number, y: number) {
    const numCells = 1; // TODO
    const initialEnergy = 100;

    if (this.emptyCritterSlots.length && this.emptyCellSlots.length > numCells) {
      let iCritter = this.emptyCritterSlots.pop();
      let genomeIndex = genomeRepository.registerGenome(genome);

      this.critters.energy[iCritter] = initialEnergy;
      this.critters.genomeIndex[iCritter] = genomeIndex;
      this.critters.orientation[iCritter] = Math.floor(Math.random() * 4);

      let lastCellIndex = 0;

      for (let i = 0; i < numCells; i++) {
        let iCell = this.emptyCellSlots.pop();
        if (i === 0) {
          this.critters.firstCellIndex[iCritter] = iCell;
        } else {
          this.cells.nextCell[lastCellIndex] = iCell;
        }
        lastCellIndex = iCell;

        this.cells.colors[iCell] = Colors[1];
        this.cells.nextCell[iCell] = NULL_VAL;
        this.cells.x[iCell] = x;
        this.cells.y[iCell] = y;
        this.pixelArray[y * SimulationConstants.worldDim + x] = this.cells.colors[iCell];
      }
      ++this.numCritters;
    }
  }

}