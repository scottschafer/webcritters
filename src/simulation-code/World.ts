import { SharedData } from '../common/SharedData';
import { SimulationConstants } from '../common/SimulationConstants';
import { WorldSummary } from '../common/WorldSummary';
import { Colors } from './Colors';
import { Critter } from './Critter';
import { cellLengthFromGenome, MoveAndEatGenome, PhotosynthesizeGenome, reproduceGenome } from './Genome';
import { genomeRepository } from './GenomeRepository';
import { Globals } from './Globals';
import { Orientation } from './Orientation';
import { Settings } from './Settings';

export class World {
  turn = 0;
  numCritters = 0;
  settings: Settings;

  critters: Array<Critter> = new Array<Critter>(SimulationConstants.maxCritters + 1);

  emptyCritterSlots: Array<number> = new Array<number>(SimulationConstants.maxCritters);
  emptyCritterSlotIndex: number = SimulationConstants.maxCritters - 1;

  constructor() {

    for (let i = 1; i <= SimulationConstants.maxCritters; i++) {
      this.critters[i] = new Critter(i);
    }
    Globals.critters = this.critters;
  }

  init(sharedData: SharedData, settings: Settings) {
    Globals.init(sharedData);
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
    let iCritter = 1;
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
    this.turn = 0;
    for (let i = 0; i < Globals.pointToCritterIndex.length; i++) {
      Globals.pointToCritterIndex[i] = 0;
    }

    // clear board
    const black = Colors[0];
    const pixelArray = Globals.pixelArray;
    for (let i = 0; i < pixelArray.length; i++) {
      pixelArray[i] = black;
    }

    // reset critters arrays
    this.numCritters = 0;

    // reset empty slot indices
    this.emptyCritterSlots = [];
    for (let i = 0; i < SimulationConstants.maxCritters; i++) {
      this.emptyCritterSlots[i] = SimulationConstants.maxCritters - i;
    }
    this.emptyCritterSlotIndex = SimulationConstants.maxCritters - 1;

    // spawn some critters;
    for (let i = 0; i < SimulationConstants.maxCritters / 10; i++) { // SimulationConstants.maxCritters / 10; i++) {
      const pos = this.findEmptyPos();
      if (i === 0) {
        this.spawn(MoveAndEatGenome, pos);
      } else {
        this.spawn(PhotosynthesizeGenome, pos);// pos.x, pos.y);
      }
    }
  }

  takeTurn() {
    let iCritter = 1;
    const numCritters = this.numCritters;
    for (let i = 0; i < numCritters;) {
      const critter = this.critters[iCritter];
      if (critter.genomeIndex > 0) {

        const critter = this.critters[iCritter];
        critter.takeTurn(this.settings);

        if (critter.isDead) {
          this.kill(iCritter);
        }
        else if (critter.canSpawn()) {
          const tailPoint = critter.cellPositions[critter.length - 1];

          let newPos = this.findEmptyPos(tailPoint);
          if (newPos) {
            const currentGenome = genomeRepository.indexToGenome[critter.genomeIndex];
            const genome = reproduceGenome(currentGenome, this.settings);
            const cellLength = cellLengthFromGenome(genome);
            if (cellLength) {
              if (genome !== currentGenome) {
                genomeRepository.registerGenome(genome, critter.genomeIndex);
              }

              const newCritter = this.spawn(genome, newPos);
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

  getCritterAtPos(point: number) {
    let critterIndex = Globals.pointToCritterIndex[point];
    if (critterIndex) {
      return this.critters[critterIndex];
    }
    return null;
  }

  findEmptyPos(point?: number): number {

    if (point !== undefined) {

      let testArray = Orientation.deltasWithDiagonals;
      if (Math.random() < .5) {
        testArray = testArray.reverse();
      }
      let start = Math.floor(Orientation.deltasWithDiagonals.length * Math.random());
      for (let iTest = 0; iTest < testArray.length; iTest++) {
        const delta = testArray[iTest];
        const newPoint = (point + delta) & 0xffff;
        let pixel = Globals.pixelArray[newPoint];
        if (pixel === Colors[0]) {
          return newPoint;

        }
      }
      return undefined;
    }

    const black = Colors[0];
    while (true) {
      let x = Math.floor(Math.random() * 256);
      let y = Math.floor(Math.random() * 256);
      point = y * 256 + x;
      let pixel = Globals.pixelArray[point];
      if (pixel === black) {
        return point;
      }
    }
    // return result;
  }

  setPixel(point: number, value: number, critterIndex = 0) {
    Globals.pixelArray[point] = value;
    Globals.pointToCritterIndex[point] = critterIndex;
  }


  spawn(genome: string, point: number) {
    let result: Critter = null;
    const initialEnergy = 100;

    const ng = reproduceGenome(genome, this.settings);

    if (this.emptyCritterSlotIndex >= 0) {
      const critterIndex = this.emptyCritterSlots[this.emptyCritterSlotIndex--];

      const critter = this.critters[critterIndex];
      const genomeIndex = genomeRepository.registerGenome(genome);

      critter.init(this.settings, genomeIndex, point);
      result = critter;

      this.setPixel(point, critter.color, critterIndex);
      ++this.numCritters;
    }
    return result;
  }

  kill(iCritter: number) {
    const critter = this.critters[iCritter];
    for (let i = 0; i < critter.length; i++) {
      this.setPixel(critter.cellPositions[i], Colors[0]);
    }
    critter.genomeIndex = -1;
    this.emptyCritterSlots[++this.emptyCritterSlotIndex] = iCritter;
    --this.numCritters;
  }

}

