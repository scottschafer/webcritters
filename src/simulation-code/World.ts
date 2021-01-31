import { settings } from 'cluster';
import { SharedData } from '../common/SharedData';
import { SimulationConstants } from '../common/SimulationConstants';
import { WorldSummary } from '../common/WorldSummary';
import { ColorBlack, ColorGreen, ColorGray } from './Colors';
import { Critter } from './Critter';
import { cellLengthFromGenome, GenomeCode, MoveAndEatGenome, PhotosynthesizeGenome, reproduceGenome } from './Genome';
import { genomeRepository } from './GenomeRepository';
import { Globals } from './Globals';
import { makePoint, Orientation } from './Orientation';
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

  updateSettings(settings: Settings) {
    this.settings = settings;
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

    const arrayGenomeAndCounts = Object.keys(genomeCount).map(genome => ({
      genome,
      count: genomeCount[genome],
      color: genomeRepository.indexToColor[genomeRepository.genomeToIndex[genome]]
    }));
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
    const pixelArray = Globals.pixelArray;
    for (let i = 0; i < pixelArray.length; i++) {
      pixelArray[i] = ColorBlack;
    }

    // for (let i = 64; i < 192; i++) {
    //   pixelArray[makePoint(i, i)] = ColorGray;
    //   pixelArray[makePoint(256 - i, i)] = ColorGray;
    // }

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
      if (i === -1) {
        this.spawn(GenomeCode.TestSeeFood + GenomeCode.IfCondition
          + GenomeCode.MoveAndEat + GenomeCode.IfNotCondition + GenomeCode.TurnLeft
          , pos);
      } else {
        this.spawn(PhotosynthesizeGenome, pos).energy = Math.random() * this.settings.spawnEnergyPerCell / 2;// pos.x, pos.y);
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
          const tailPoint = critter.lastTailPoint; // .cellPositions[critter.length - 1];

          let newPos = this.findEmptyPos(tailPoint);
          if (newPos) {
            const currentGenome = genomeRepository.indexToGenome[critter.genomeIndex];
            const genome = reproduceGenome(currentGenome, this.settings);
            const cellLength = cellLengthFromGenome(genome, this.settings);
            if (cellLength) {
              if (genome !== currentGenome) {
                genomeRepository.registerGenome(genome, critter.genomeIndex);
              }

              const newCritter = this.spawn(genome, newPos);
              if (newCritter) {
                newCritter.energy = critter.energy / 2;
                critter.energy /= 2;
                newCritter.sleepCount = 5;
                newCritter.orientation = critter.orientation;
              }
            }
          } else {
            critter.energy = -10000;// *= .8;
          }
        }
        ++i;
      }
      ++iCritter;
    }

    ++this.turn;

    if (!this.numCritters) {
      this.spawn(PhotosynthesizeGenome, this.findEmptyPos());// pos.x, pos.y);
    }



    if (!(this.turn % 100)) {

      this.addFood();
      // this.spawnPlantFromFood();
    }
    return this.turn;
  }

  addFood() {
    let numFood = 32;
    for (let i = 0; i < 100; i++) {
      let point = Math.floor(Math.random() * 65536);
      if (Globals.pixelArray[point] === ColorBlack) {
        Globals.pixelArray[point] = ColorGreen;
        if (! --numFood) {
          return;
        }
      }
    }
  }

  spawnPlantFromFood() {
    // return;
    let start = Math.floor(Math.random() * 65536);
    for (let i = 0; i < 65555; i++) {
      let point = (start + i) & 0xffff;
      if (Globals.pixelArray[point] === ColorGreen && !Globals.pointToCritterIndex[point]) {
        Globals.pixelArray[point] = ColorBlack;
        this.spawn('P', point);
        break;
      }
    }
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

      if (Globals.pixelArray[point] === ColorBlack) {
        return point;
      }
      let testArray = Orientation.deltasWithDiagonals;
      if (Math.random() < .5) {
        testArray = testArray.reverse();
      }
      let start = Math.floor(Orientation.deltasWithDiagonals.length * Math.random());
      for (let iTest = 0; iTest < testArray.length; iTest++) {
        const delta = testArray[iTest];
        const newPoint = (point + delta) & 0xffff;
        let pixel = Globals.pixelArray[newPoint];
        if (pixel === ColorBlack) {
          return newPoint;

        }
      }
      return undefined;
    }

    const black = ColorBlack;
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
    if (result) {
      result.energy = result.spawnEnergy / 2;
    }

    return result;
  }

  kill(iCritter: number) {
    const critter = this.critters[iCritter];
    const genome = genomeRepository.indexToGenome[critter.genomeIndex];

    let color = (critter.photosynthesizing || critter.energy <= -100) ? ColorBlack : ColorGreen;
    for (let i = 0; i < critter.length; i++) {
      this.setPixel(critter.cellPositions[i], color);
    }
    critter.genomeIndex = -1;
    this.emptyCritterSlots[++this.emptyCritterSlotIndex] = iCritter;
    --this.numCritters;
  }

}

