import { colors } from '@material-ui/core';
import { settings } from 'cluster';
import { FollowingDetails } from '../common/FollowingDetails';
import { SharedData } from '../common/SharedData';
import { SimulationConstants } from '../common/SimulationConstants';
import { WorldDetails } from '../common/WorldDetails';
import { WorldSummary } from '../common/WorldSummary';
import { ColorBlack, ColorDeathRay, ColorGray, ColorGreen } from './Colors';
import { Critter } from './Critter';
import { Genome } from './Genome';
import { PhotosynthesizeGenome } from './GenomeCode';
import { genomeStore } from './GenomeStore';
import { globals, Globals } from './Globals';
import { makePoint, Orientation } from './Orientation';
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
    globals.critters = this.critters;
  }

  init(sharedData: SharedData, settings: SimulationSettings) {
    globals.init(sharedData);
    globals.settings = settings;
    this.reset();
  }

  updateSettings(settings: SimulationSettings) {
    const barriersChanged = (settings.barriers !== globals.settings.barriers);
    globals.settings = settings;
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

      if (total !== globals.numCritters) {
        console.log(`calc total = ${total}, globals.numCritters = ${globals.numCritters}`);
        debugger;
      }
      result.totalCritters = globals.numCritters; //total;
      result.topGenomes = sortedGenomes.slice(0, maxCritters - 1).map(
        genome => ({ genome: genome.asString, count: genome.count, color: genome.color }));

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
    //     if (!globals.numCritters) {
    //       return result;
    //     }

    //     follow = 1;
    //     let len = 0;
    //     for (let i = 1; i < globals.numCritters; i++) {
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
          if (globals.pixelArray[pt] !== ColorBlack) {
            result.dots.push({ x: ix, y: iy, color: globals.pixelArray[pt] });
          }
        }
      }
    }

    return result;
  }

  updateBarriers() {
    if (!globals.settings.barriers) {
      for (let i = 0; i < globals.pixelArray.length; i++) {
        if (globals.pixelArray[i] === ColorGray) {
          globals.setPixel(i, ColorBlack);
        }
      }
    } else {
      const setBarrierPoint = (point: number) => {
        const critter = this.getCritterAtPos(point);
        if (critter) {
          this.kill(critter.critterIndex, false);
        }
        globals.setPixel(point, ColorGray);

        // globals.pixelArray[point] = ColorGray;
      }

      for (let i = 64; i < 192; i++) {
        if (i < 125 || i > 130) {
          setBarrierPoint(makePoint(i, i));
          setBarrierPoint(makePoint(256 - i, i));

        }
      }
    }
  }

  reset() {
    globals.turn = 0;
    for (let i = 0; i < globals.pointToCritterIndex.length; i++) {
      globals.pointToCritterIndex[i] = 0;
    }

    // clear board
    const pixelArray = globals.pixelArray;
    for (let i = 0; i < pixelArray.length; i++) {
      pixelArray[i] = ColorBlack;
    }
    this.updateBarriers();


    // reset critters arrays
    globals.numCritters = 0;

    // reset empty slot indices
    this.emptyCritterSlots = [];
    for (let i = 0; i < SimulationConstants.maxCritters; i++) {
      this.emptyCritterSlots[i] = SimulationConstants.maxCritters - i;
    }
    this.emptyCritterSlotIndex = SimulationConstants.maxCritters - 1;

    let countToInsert = SimulationConstants.maxCritters / 10;

    Object.keys(SimulationConstants.insertEvolvedCritters).forEach(genome => {
      const count = SimulationConstants.insertEvolvedCritters[genome];
      for (let i = 0; i < count; i++) {
        const pos = this.findEmptyPos();
        this.spawn(genome, pos, false);
        --countToInsert;
      }
    });

    // spawn some critters;
    for (let i = 0; i < countToInsert; i++) { // SimulationConstants.maxCritters / 10; i++) {
      const pos = this.findEmptyPos();
      // if (i < 1 && SimulationConstants.insertEvolvedCritter) {
      //   this.spawn(SimulationConstants.insertEvolvedCritter, pos, false);
      // } else {
      this.spawn(PhotosynthesizeGenome, pos, false).energy = Math.random() * globals.settings.spawnEnergyPerCell / 2;// pos.x, pos.y);
      // }
    }
  }

  takeTurn(numTurns: number = 1): number {
    if (this.takingTurn) {
      debugger;
    }
    this.takingTurn = true;

    for (let count = 0; count < numTurns; count++) {

      let iCritter = 1;
      const numCritters = globals.numCritters;
      for (let i = 0; i < numCritters;) {
        const critter = this.critters[iCritter];
        if (critter.genome) {

          const critter = this.critters[iCritter];
          critter.takeTurn(globals);

          if (critter.isDead && (SimulationConstants.allowDeathBirth || critter.wasEaten)) { //  && (critter.genome.genome === GenomeCode.Photosynthesize || !SimulationConstants.testMode)) {
            this.kill(iCritter);
          }
          else if (critter.canSpawn(globals) && SimulationConstants.allowDeathBirth) {
            const tailPoint = critter.lastTailPoint; // .cellPositions[critter.length - 1];

            critter.forceSpawn = false;
            let newPos = this.findEmptyPos(tailPoint);
            if (newPos) {
              const newCritter = this.spawn(critter.genome, newPos);
              if (newCritter) {
                newCritter.energy = critter.energy / 2;
                critter.energy /= 2;
                ++critter.spawnedCount;
                newCritter.sleepCount = globals.settings.sleepAfterSpawnCount;
                if (newCritter.length > 1) {
                  newCritter.orientation = critter.orientation;
                }
              }
            } else {
              // critter.energy = critter.energy / 2;
              // critter.energy /= 2; //= -10000;// *= .8;
              // critter.energy = -10000;// *= .8;
              critter.setEaten(globals);
            }
          }
          ++i;
        }
        ++iCritter;
      }

      ++globals.turn;

      if (!globals.numCritters) {
        this.spawn(PhotosynthesizeGenome, this.findEmptyPos());// pos.x, pos.y);
      }

      if (globals.settings.deathRays) {
        const phase = 400 * globals.settings.deathRays;
        const duration = 200;
        const turnPhase = (globals.turn % phase);
        if (turnPhase < duration) {
          let xStart = 0, xStep = 1;
          let yStart = 16, yStep = 32;
          for (let y = yStart; y < 256; y += yStep) {
             for (let x = xStart; x < 256; x += xStep) {
               const point = y * 256 + x;
               const critter = this.getCritterAtPos(point);
              if (critter) {
                critter.energy = -1000;
              }                           
              globals.pixelArray[point] = ColorDeathRay;
              // globals.setPixel(point, ColorDeathRay);
            }
          }
        } else if (turnPhase === duration) {
          for (let point = 0; point < 65536; point++) {
            if (globals.pixelArray[point] === ColorDeathRay) {
              globals.setPixel(point, ColorBlack);
            }
          }
        }
      }

      if (!(globals.turn % 100)) {

        this.addFood();
        // this.spawnPlantFromFood();
      }
    }
    this.takingTurn = false;

    // for (let i = 0; i < globals.pointToCritterIndex.length; i++) {
    //   const index = globals.pointToCritterIndex[i];
    //   if (index) {
    //     const critter = this.critters[index];
    //     if (critter.genome) {
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


    return globals.turn;
  }

  addFood() {
    let numFood = globals.settings.addFoodCount;
    while (numFood--) {
      // for (let i = 0; i < 100; i++) {
      let point = Math.floor(Math.random() * 65536);
      if (globals.pixelArray[point] === ColorBlack) {
        if (globals.pointToCritterIndex[point]) {
          debugger;
        }
        globals.pixelArray[point] = ColorGreen;
        // // --numFood;
        // break;
        // }
      }
    }
  }

  spawnPlantFromFood() {
    // return;
    let start = Math.floor(Math.random() * 65536);
    for (let i = 0; i < 65555; i++) {
      let point = (start + i) & 0xffff;
      if (globals.pixelArray[point] === ColorGreen && !globals.pointToCritterIndex[point]) {
        globals.pixelArray[point] = ColorBlack;
        this.spawn('P', point);
        break;
      }
    }
  }

  getCritterAtPos(point: number) {
    let critterIndex = globals.pointToCritterIndex[point];
    if (critterIndex) {
      const critter = this.critters[critterIndex];
      return (critter && critter.genome) ? critter : null;
    }
    return null;
  }

  findEmptyPos(point?: number): number {

    if (point !== undefined) {

      if (globals.pixelArray[point] === ColorBlack) {
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
        let pixel = globals.pixelArray[newPoint];
        if (pixel === ColorBlack || (pixel === ColorGreen && !globals.pointToCritterIndex[newPoint])) {
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
      let pixel = globals.pixelArray[point];
      if (pixel === black) {
        return point;
      }
    }
    // return result;
  }

  // setPixel(point: number, value: number, critterIndex = 0) {
  //   globals.pixelArray[point] = value;
  //   if (critterIndex === undefined) {
  //     debugger;
  //   }
  //   globals.pointToCritterIndex[point] = critterIndex;
  // }


  spawn(inGenome: string | Genome, point: number, allowMutation = true) {
    let result: Critter = null;
    const initialEnergy = 100;

    // const parentGenome = allowMutation ? genome : null;
    // if (allowMutation) {
    //   genome = reproduceGenome(genome);
    // }

    if (this.emptyCritterSlotIndex >= 0) {
      const genome = genomeStore.registerBirth(inGenome, allowMutation);

      const critterIndex = this.emptyCritterSlots[this.emptyCritterSlotIndex--];

      const critter = this.critters[critterIndex];

      critter.init(genome, point, globals);
      result = critter;

      globals.setPixel(point, critter.color, critterIndex);
    }
    if (result) {
      result.energy = result.spawnEnergy / 2;
    }

    return result;
  }

  kill(iCritter: number, canTurnToFood = true) {
    // canTurnToFood = false;
    const critter = this.critters[iCritter];
    genomeStore.registerDeath(critter.genome);

    let color = ColorBlack;
    if (canTurnToFood) {
      color = (critter.photosynthesizing || critter.wasEaten) ? ColorBlack : ColorGreen;
    }
    for (let i = 0; i < critter.length; i++) {
      globals.setPixel(critter.cellPositions[i], color);
    }
    critter.genome = null;
    this.emptyCritterSlots[++this.emptyCritterSlotIndex] = iCritter;
  }

}

