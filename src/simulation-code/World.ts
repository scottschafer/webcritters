import { debug } from 'webpack';
import { FollowingDetails } from '../common/FollowingDetails';
import { SharedData } from '../common/SharedData';
import { SimulationConstants } from '../common/SimulationConstants';
import { WorldDetails } from '../common/WorldDetails';
import { WorldSummary } from '../common/WorldSummary';
import { ColorBlack, ColorGreen, ColorGray } from './Colors';
import { Critter } from './Critter';
import { cellLengthFromGenome, GenomeCode, MoveAndEatGenome, PhotosynthesizeGenome, reproduceGenome } from './Genome';
import { genomeStore } from './GenomeStore';
import { Globals } from './Globals';
import { decodePoint, makePoint, Orientation } from './Orientation';
import { SimulationSettings } from './SimulationSettings';

export class World {

  critters: Array<Critter> = new Array<Critter>(SimulationConstants.maxCritters + 1);

  emptyCritterSlots: Array<number> = new Array<number>(SimulationConstants.maxCritters);
  emptyCritterSlotIndex: number = SimulationConstants.maxCritters - 1;

  takingTurn = false;

  constructor() {

    for (let i = 1; i <= SimulationConstants.maxCritters; i++) {
      this.critters[i] = new Critter(i);
    }
    Globals.critters = this.critters;
  }

  init(sharedData: SharedData, settings: SimulationSettings) {
    Globals.init(sharedData);
    Globals.settings = settings;
    this.reset();
  }

  updateSettings(settings: SimulationSettings) {
    const barriersChanged = (settings.barriers !== Globals.settings.barriers);
    Globals.settings = settings;
    if (barriersChanged) {
      this.updateBarriers();
    }
  }

  getSummary(maxCritters = 20): WorldSummary {
    const result = {
      totalCritters: 0,
      totalFood: 0,
      topGenomes: []
    };

    try {
      const sortedGenomes = Object.values(genomeStore.genomeInfo)
        .sort((a, b) => (b.count - a.count));
      const total = sortedGenomes
        .map(v => v.count)
        .reduce((accumulator, currentValue) => accumulator + currentValue);

      if (total !== Globals.numCritters) {
        debugger;
      }
      result.totalCritters = Globals.numCritters; //total;
      result.topGenomes = sortedGenomes.slice(0, maxCritters - 1);
    } catch (e) {
      debugger;
    }
    return result;
  }

  getDetail(follow: FollowingDetails, dimension = 32): WorldDetails {
    const result = {
      x: 0,
      y: 0,
      critters: {} as { [index: number]: Critter },
      dots: []
    };

    let x = follow.x;
    let y = follow.y;
    // if (follow && typeof follow === 'object') {
    //   x = follow.x;
    //   y = follow.y;
    // } else {
    //   if (!follow) {
    //     if (!Globals.numCritters) {
    //       return result;
    //     }

    //     follow = 1;
    //     let len = 0;
    //     for (let i = 1; i < Globals.numCritters; i++) {
    //       if (this.critters[i].genomeInfo) {
    //         if (this.critters[i].length > len) {
    //           follow = i;
    //           len = this.critters[i].length;
    //         }
    //       }
    //     }
    //   }
    //   const headPoint = this.critters[follow as number].cellPositions[0];
    //   const headPointXY = decodePoint(headPoint);
    //   x = Math.min(255 - dimension, Math.max(0, headPointXY.x - dimension / 2));
    //   y = Math.min(255 - dimension, Math.max(0, headPointXY.y - dimension / 2));
    // }

    result.x = x;
    result.y = y;
    for (let ix = x; ix < (x + dimension); ix++) {
      for (let iy = y; iy < (y + dimension); iy++) {
        const pt = makePoint(ix, iy);
        const critter = this.getCritterAtPos(pt);
        if (critter) {
          result.critters[critter.critterIndex] = critter;
        } else {
          if (Globals.pixelArray[pt] !== ColorBlack) {
            result.dots.push({ x: ix, y: iy, color: Globals.pixelArray[pt] });
          }
        }
      }
    }

    return result;
  }

  updateBarriers() {
    if (!Globals.settings.barriers) {
      for (let i = 0; i < Globals.pixelArray.length; i++) {
        if (Globals.pixelArray[i] === ColorGray) {
          Globals.setPixel(i, ColorBlack);
        }
      }
    } else {
      const setBarrierPoint = (point: number) => {
        const critter = this.getCritterAtPos(point);
        if (critter) {
          this.kill(critter.critterIndex, false);
        }
        Globals.setPixel(point, ColorGray);

        // Globals.pixelArray[point] = ColorGray;
      }

      for (let i = 64; i < 192; i++) {
        setBarrierPoint(makePoint(i, i));
        setBarrierPoint(makePoint(256 - i, i));
      }
    }
  }

  reset() {
    Globals.turn = 0;
    for (let i = 0; i < Globals.pointToCritterIndex.length; i++) {
      Globals.pointToCritterIndex[i] = 0;
    }

    // clear board
    const pixelArray = Globals.pixelArray;
    for (let i = 0; i < pixelArray.length; i++) {
      pixelArray[i] = ColorBlack;
    }
    this.updateBarriers();


    // reset critters arrays
    Globals.numCritters = 0;

    // reset empty slot indices
    this.emptyCritterSlots = [];
    for (let i = 0; i < SimulationConstants.maxCritters; i++) {
      this.emptyCritterSlots[i] = SimulationConstants.maxCritters - i;
    }
    this.emptyCritterSlotIndex = SimulationConstants.maxCritters - 1;

    // spawn some critters;
    for (let i = 0; i < SimulationConstants.maxCritters / 10; i++) { // SimulationConstants.maxCritters / 10; i++) {
      const pos = this.findEmptyPos();
      if (i < 50 && SimulationConstants.insertEvolvedCritter) {
        this.spawn(SimulationConstants.insertEvolvedCritter, pos);
      } else {
        this.spawn(PhotosynthesizeGenome, pos).energy = Math.random() * Globals.settings.spawnEnergyPerCell / 2;// pos.x, pos.y);
      }
    }
  }

  takeTurn() {
    if (this.takingTurn) {
      debugger;
    }
    this.takingTurn = true;
    let iCritter = 1;
    const numCritters = Globals.numCritters;
    for (let i = 0; i < numCritters;) {
      const critter = this.critters[iCritter];
      if (critter.genomeInfo) {

        const critter = this.critters[iCritter];
        critter.takeTurn();

        if (critter.isDead && (SimulationConstants.allowDeathBirth || critter.wasEaten)) { //  && (critter.genomeInfo.genome === GenomeCode.Photosynthesize || !SimulationConstants.testMode)) {
          this.kill(iCritter);
        }
        else if (critter.canSpawn() && SimulationConstants.allowDeathBirth) {
          const tailPoint = critter.lastTailPoint; // .cellPositions[critter.length - 1];

          critter.forceSpawn = false;
          let newPos = this.findEmptyPos(tailPoint);
          if (newPos) {
            const newCritter = this.spawn(critter.genomeInfo.genome, newPos);
            if (newCritter) {
              newCritter.energy = critter.energy / 2;
              critter.energy /= 2;
              ++critter.spawnedCount;
              newCritter.sleepCount = Globals.settings.sleepAfterSpawnCount;
              // newCritter.orientation = critter.orientation;
            }
          } else {
            critter.energy = critter.spawnEnergy / 2;
            // critter.energy /= 2; //= -10000;// *= .8;
            // critter.energy = -10000;// *= .8;
            // critter.setEaten();
          }
        }
        ++i;
      }
      ++iCritter;
    }

    ++Globals.turn;

    if (!Globals.numCritters) {
      this.spawn(PhotosynthesizeGenome, this.findEmptyPos());// pos.x, pos.y);
    }



    if (!(Globals.turn % 100)) {

      this.addFood();
      // this.spawnPlantFromFood();
    }
    this.takingTurn = false;

    // for (let i = 0; i < Globals.pointToCritterIndex.length; i++) {
    //   const index = Globals.pointToCritterIndex[i];
    //   if (index) {
    //     const critter = this.critters[index];
    //     if (critter.genomeInfo) {
    //       let found = false;
    //       for (let j = 0; j < critter.length; j++) {
    //         if (critter.cellPositions[j] === i) {
    //           found = true;
    //           break;
    //         }
    //       }
    //       if (!found) {
    //         debugger;
    //       }
    //     }
    //   }
    // }


    return Globals.turn;
  }

  addFood() {
    let numFood = Globals.settings.addFoodCount;
    while (numFood) {
      for (let i = 0; i < 100; i++) {
        let point = Math.floor(Math.random() * 65536);
        if (Globals.pixelArray[point] === ColorBlack) {
          if (Globals.pointToCritterIndex[point]) {
            debugger;
          }
          Globals.pixelArray[point] = ColorGreen;
          --numFood;
          break;
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
      const critter = this.critters[critterIndex];
      return (critter && critter.genomeInfo) ? critter : null;
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
        if (pixel === ColorBlack || (pixel === ColorGreen && !Globals.pointToCritterIndex[newPoint])) {
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

  // setPixel(point: number, value: number, critterIndex = 0) {
  //   Globals.pixelArray[point] = value;
  //   if (critterIndex === undefined) {
  //     debugger;
  //   }
  //   Globals.pointToCritterIndex[point] = critterIndex;
  // }


  spawn(genome: string, point: number, allowMutation = true) {
    let result: Critter = null;
    const initialEnergy = 100;

    const parentGenome = allowMutation ? genome : null;
    if (allowMutation) {
      genome = reproduceGenome(genome);
    }

    if (cellLengthFromGenome(genome) && this.emptyCritterSlotIndex >= 0) {
      genomeStore.registerBirth(genome, parentGenome);

      const critterIndex = this.emptyCritterSlots[this.emptyCritterSlotIndex--];

      const critter = this.critters[critterIndex];

      critter.init(genome, point);
      result = critter;

      Globals.setPixel(point, critter.color, critterIndex);
      // ++Globals.numCritters;
    }
    if (result) {
      result.energy = result.spawnEnergy / 2;
    }

    return result;
  }

  kill(iCritter: number, canTurnToFood = true) {
    const critter = this.critters[iCritter];
    genomeStore.registerDeath(critter.genomeInfo.genome);

    if (canTurnToFood) {
      let color = (critter.photosynthesizing || critter.wasEaten) ? ColorBlack : ColorGreen;
      for (let i = 0; i < critter.length; i++) {
        Globals.setPixel(critter.cellPositions[i], color);
      }
    }
    critter.genomeInfo = null;
    this.emptyCritterSlots[++this.emptyCritterSlotIndex] = iCritter;
  }

}

