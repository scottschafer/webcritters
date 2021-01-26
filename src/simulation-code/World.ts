import { SharedData } from '../common/SharedData';
import { SimulationConstants } from '../common/SimulationConstants';
import { WorldSummary } from '../common/WorldSummary';
import { Colors } from './Colors';
import { Critter } from './Critter';
import { cellLengthFromGenome, PhotosynthesizeGenome, reproduceGenome } from './Genome';
import { genomeRepository } from './GenomeRepository';
import { Orientation } from './Orientation';
import { Settings } from './Settings';

const NO_CRITTER = 0xFFFFFFFF;

export class World {
  pixelArray: Uint32Array;
  settings: Settings;
  pixelToCritter: Uint32Array;

  turn = 0;
  numCritters = 0;

  // cells: Array<Cell> = new Array<Cell>(SimulationConstants.maxCells);
  critters: Array<Critter> = new Array<Critter>(SimulationConstants.maxCritters);

  // emptyCellSlots: Array<number> = new Array<number>(SimulationConstants.maxCells);
  emptyCritterSlots: Array<number> = new Array<number>(SimulationConstants.maxCritters);
  emptyCritterSlotIndex: number = SimulationConstants.maxCritters - 1;

  constructor() {
    // for (let i = 0; i < SimulationConstants.maxCells; i++) {
    //   this.cells[i] = new Cell();
    // }
    for (let i = 0; i < SimulationConstants.maxCritters; i++) {
      this.critters[i] = new Critter();
    }
  }

  init(sharedData: SharedData, settings: Settings) {
    this.pixelArray = new Uint32Array(sharedData.canvasBuffer);
    this.settings = settings;
    this.reset();
  }

  getSummary(maxCritters = 10): WorldSummary {
    const result = {
      totalCritters: 0,
      totalFood: 0,
      topGenomes: []
    };

    let genomeCount: { [genome: string]: number } = {};
    const numCritters = this.numCritters;
    let iCritter = 0;
    for (let i = 0; i < numCritters;) {
      const critter = this.critters[iCritter];
      if (critter.genomeIndex > 0) {
        const genome = genomeRepository.indexToGenome[critter.genomeIndex];
        if (!genomeCount[genome]) {
          genomeCount[genome] = 1;
        } else {
          ++genomeCount[genome];
        }
        ++i;
      }
      ++iCritter;
    }

    const arrayGenomeAndCounts = Object.keys(genomeCount).map(genome => ({ genome, count: genomeCount[genome], color: 0 }));
    arrayGenomeAndCounts.sort((a, b) => (b.count - a.count));

    result.topGenomes = arrayGenomeAndCounts.slice(0, maxCritters - 1);
    return result;
  }

  reset() {
    this.pixelToCritter = new Uint32Array(new ArrayBuffer(4 * SimulationConstants.worldDim * SimulationConstants.worldDim));
    for (let i = 0; i < this.pixelToCritter.length; i++) {
      this.pixelToCritter[i] = NO_CRITTER;
    }

    this.turn = 0;

    // clear board
    const black = Colors[0];
    for (let i = 0; i < this.pixelArray.length; i++) {
      this.pixelArray[i] = black;
    }

    // reset critters arrays
    this.numCritters = 0;

    // reset empty slot indices
    this.emptyCritterSlots = [];
    for (let i = 0; i < SimulationConstants.maxCritters; i++) {
      this.emptyCritterSlots[i] = SimulationConstants.maxCritters - i - 1;
    }
    this.emptyCritterSlotIndex = SimulationConstants.maxCritters - 1;

    for (let i = 0; i < SimulationConstants.maxCritters / 10; i++) { // SimulationConstants.maxCritters / 10; i++) {
      const pos = this.findEmptyPos();
      this.spawn(PhotosynthesizeGenome, pos.x, pos.y);
    }
  }

  takeTurn() {
    let iCritter = 0;
    const numCritters = this.numCritters;
    for (let i = 0; i < numCritters;) {
      const critter = this.critters[iCritter];
      if (critter.genomeIndex > 0) {

        const critter = this.critters[iCritter];
        critter.takeTurn(this, iCritter);

        if (critter.isDead) {
          this.kill(iCritter);
        }
        else if (critter.canSpawn(this)) {
          const x = critter.cellPosX[0];
          const y = critter.cellPosY[0];
          let newPos = this.findEmptyPos(x, y);
          if (newPos) {
            const currentGenome = genomeRepository.indexToGenome[critter.genomeIndex];
            const genome = reproduceGenome(currentGenome, this.settings);
            const cellLength = cellLengthFromGenome(genome);
            if (cellLength) {
              if (genome !== currentGenome) {
                genomeRepository.registerGenome(genome, critter.genomeIndex);
              }

              const newCritter = this.spawn(genome, newPos.x, newPos.y);
              if (newCritter) {
                newCritter.energy = critter.energy / 2;
                critter.energy /= 2;
              }
            }
          }
        }
        ++i;
      }
      ++iCritter;
    }

    ++this.turn;

    return this.turn;
  }

  getCritterAtPos(x: number, y: number) {
    let index = x + y * SimulationConstants.worldDim;
    let critterIndex = this.pixelToCritter[index];
    if (critterIndex !== NO_CRITTER) {
      return this.critters[critterIndex];
    }
    return null;
  }

  findEmptyPos(x?: number, y?: number): { x: number, y: number } {

    if (x !== undefined && y !== undefined) {

      let testArray = Orientation.deltasWithDiagonals;
      if (Math.random() < .5) {
        testArray = testArray.reverse();
      }
      let start = Math.floor(Orientation.deltasWithDiagonals.length * Math.random());
      for (let iTest = 0; iTest < testArray.length; iTest++) {
        const [xD, yD] = testArray[(iTest + start) % Orientation.deltasWithDiagonals.length];
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

    const black = Colors[0];
    while (true) {
      let x = Math.floor(Math.random() * SimulationConstants.worldDim);
      let y = Math.floor(Math.random() * SimulationConstants.worldDim);
      let pixel = this.pixelArray[y * SimulationConstants.worldDim + x];
      if (pixel === black) {
        return { x, y };
      }
    }
    // return result;
  }

  setPixel(x: number, y: number, value: number, critterIndex = NO_CRITTER) {
    let index = y * SimulationConstants.worldDim + x;
    this.pixelArray[index] = value;
    this.pixelToCritter[index] = critterIndex;
  }


  spawn(genome: string, x: number, y: number) {
    let result: Critter = null;
    const initialEnergy = 100;

    const ng = reproduceGenome(genome, this.settings);

    if (this.emptyCritterSlotIndex >= 0) {
      const critterIndex = this.emptyCritterSlots[this.emptyCritterSlotIndex--];

      const critter = this.critters[critterIndex];
      const genomeIndex = genomeRepository.registerGenome(genome);

      critter.init(this, genomeIndex, x, y);
      result = critter;

      this.setPixel(x, y, critter.colors[0], critterIndex);
      ++this.numCritters;
    }
    return result;
  }

  kill(iCritter: number) {
    const critter = this.critters[iCritter];
    for (let i = 0; i < critter.length; i++) {

      const x = critter.cellPosX[i];
      const y = critter.cellPosY[i];
      this.setPixel(x, y, Colors[0]);
    }
    critter.genomeIndex = -1;
    this.emptyCritterSlots[++this.emptyCritterSlotIndex] = iCritter;
    --this.numCritters;
  }

}