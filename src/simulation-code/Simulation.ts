import { colors } from '@material-ui/core';
import { settings } from 'cluster';
import { FollowingDetails } from '../common/FollowingDetails';
import { GenealogyReport } from '../common/GenealogyReport';
import { SimulationConstants } from '../common/SimulationConstants';
import { WorldDetails } from '../common/WorldDetails';
import { WorldSummary } from '../common/WorldSummary';
import { simulationStore } from '../ui/SimulationUIStore';
import { ColorBarrier, ColorBlack, ColorDeathRay, ColorFood, ColorGray, ColorGreen } from './Colors';
import { Critter } from './Critter';
import { Genome } from './Genome';
import { GenomeCodeInfo, PhotosynthesizeGenome } from './GenomeCode';
import { genomeStore } from './GenomeStore';
import { makePoint, Orientation } from './Orientation';
import { persistence } from './Persistence';
import { SimulationSettings } from './SimulationSettings';
import { InsertCritters } from '../ui/components/InsertCritters';

export class Simulation {

  critters: Array<Critter> = new Array<Critter>(SimulationConstants.maxCritters + 1);

  emptyCritterSlots: Array<number> = new Array<number>(SimulationConstants.maxCritters);
  emptyCritterSlotIndex: number = SimulationConstants.maxCritters - 1;

  canvasBuffer: ArrayBuffer;
    pixelArray: Uint32Array;
  pointToCritterIndex: Uint32Array;
  cellPositions: Uint16Array;

  turn = 0;
  numCritters = 0;

  takingTurn = false;

  constructor() {
    for (let i = 1; i <= SimulationConstants.maxCritters; i++) {
      this.critters[i] = new Critter(i);
    }
    const totalPixels = SimulationConstants.totalPixels;
    this.canvasBuffer = new ArrayBuffer(4 * totalPixels)
    this.pixelArray = new Uint32Array(this.canvasBuffer);
    this.pointToCritterIndex = new Uint32Array(new ArrayBuffer(4 * totalPixels));
    this.cellPositions = new Uint16Array(new ArrayBuffer(2 * totalPixels * SimulationConstants.maxCritterLength));
  }


  setPixel(point: number, color: number, critterIndex = 0) {

    if (color !== ColorBarrier && color !== ColorBlack && color !== ColorDeathRay && color !== ColorFood && !critterIndex) {
      debugger;
    }

    this.pixelArray[point] = color;

    if (this.pointToCritterIndex[point]
      && critterIndex
      && this.pointToCritterIndex[point]
      && critterIndex !== this.pointToCritterIndex[point]) {
      debugger;
    }
    if (critterIndex === undefined) {
      debugger
    }
    this.pointToCritterIndex[point] = critterIndex;

    if (color !== ColorBlack && color !== ColorGreen && color !== ColorBarrier) {
      const critter = this.getCritterAtPos(point);
      if (critter && ! critter.genome) {
        debugger
      }
    }
  }

  get settings() {
    return simulationStore.settings;
  }

  updateSettings(settings: SimulationSettings) {
    const barriersChanged = (settings.barriers !== this.settings.barriers);
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

      if (total !== this.numCritters) {
        console.log(`calc total = ${total}, this.numCritters = ${this.numCritters}`);
        debugger;
      }
      result.totalCritters = this.numCritters; //total;
      result.topGenomes = sortedGenomes.slice(0, maxCritters - 1).map(
        genome => ({ genome: genome.asString, count: genome.count, color: genome.color }));

    } catch (e) {
      debugger;
    }
    return result;
  }

  load(data: string) {
  }

  save() {
    return '{}'
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

    result.x = x;
    result.y = y;
    for (let ix = x; ix < (x + dimension); ix++) {
      for (let iy = y; iy < (y + dimension); iy++) {
        const pt = makePoint(ix, iy);
        const critter = this.getCritterAtPos(pt);
        if (critter) {
          result.critters[critter.critterIndex] = critter;
        } else {
          if (this.pixelArray[pt] !== ColorBlack) {
            result.dots.push({ x: ix, y: iy, color: this.pixelArray[pt] });
          }
        }
      }
    }

    return result;
  }

  updateBarriers() {
    if (!this.settings.barriers) {
      for (let i = 0; i < this.pixelArray.length; i++) {
        if (this.pixelArray[i] === ColorGray) {
          this.setPixel(i, ColorBlack);
        }
      }
    } else {
      const setBarrierPoint = (point: number) => {
        const critter = this.getCritterAtPos(point);
        if (critter) {
          this.kill(critter.critterIndex, false);
        }
        this.setPixel(point, ColorGray);

        // this.pixelArray[point] = ColorGray;
      }


    for (let x = 0; x < SimulationConstants.barrierSize; x += 2) {
      for (let y = 0; y < SimulationConstants.barrierSize; y++) {
        const offsetX = 8;
        const offsetY = 8;
        this.setPixel(makePoint(x + offsetX, y + offsetY), ColorGray);
      }
    }

    for (let x = 0; x < SimulationConstants.barrierSize; x++) {
      for (let y = 0; y < SimulationConstants.barrierSize; y += 2) {
        const offsetX = SimulationConstants.worldDim - SimulationConstants.barrierSize - 8;
        const offsetY = SimulationConstants.worldDim - SimulationConstants.barrierSize - 8;
        this.setPixel(makePoint(x + offsetX, y + offsetY), ColorGray);
      }
    }

      // for (let i = 64; i < 192; i++) {
      //   if (i < 125 || i > 130) {
      //     setBarrierPoint(makePoint(i, i));
      //     setBarrierPoint(makePoint(256 - i, i));

      //   }
      // }
    }

  }

  reset(summary?: WorldSummary) {
    this.turn = 0;
    for (let i = 0; i < this.pointToCritterIndex.length; i++) {
      this.pointToCritterIndex[i] = 0;
    }

    // clear board
    const pixelArray = this.pixelArray;
    for (let i = 0; i < pixelArray.length; i++) {
      pixelArray[i] = ColorBlack;
    }
    this.updateBarriers();


    // reset critters arrays
    this.numCritters = 0;

    // reset empty slot indices
    this.emptyCritterSlots = [];
    for (let i = 0; i < SimulationConstants.maxCritters; i++) {
      this.emptyCritterSlots[i] = SimulationConstants.maxCritters - i;
   }

   this.critters.forEach(critter => {
     critter.genome = null;
     critter.energy = -1
   })

   this.emptyCritterSlotIndex = SimulationConstants.maxCritters - 1;

    // let countToInsert = SimulationConstants.maxCritters / 10;

    if (! summary) {
      summary = {
        totalCritters: 0,
        totalFood: 0,
        topGenomes: [{
          genome: 'P',
          color: ColorGreen,
          count: SimulationConstants.initialPhotosynthesizeCritterCount
        }]
      }
    }

    // Object.keys(SimulationConstants.insertEvolvedCritters).forEach(genome => {
    //   const count = SimulationConstants.insertEvolvedCritters[genome];
    //   for (let i = 0; i < count; i++) {
    //     const pos = this.findEmptyPos();
    //     this.spawn(genome, pos, false);
    //     --countToInsert;
    //   }
    // });

    summary.topGenomes.forEach(insert => {
      for (let i = 0; i < insert.count; i++) { // SimulationConstants.maxCritters / 10; i++) {
        const pos = this.findEmptyPos();
        const newCritter = this.spawn(insert.genome, pos, false);
        if (newCritter) {
          newCritter.energy = Math.random() * this.settings.spawnEnergyPerCell / 2;// pos.x, pos.y);
        }
        // if (i < 1 && SimulationConstants.insertEvolvedCritter) {
        //   this.spawn(SimulationConstants.insertEvolvedCritter, pos, false);
        // } else {
        
        // }
      }      
      // debugger
      // this.numCritters += insert.count
    })
    // spawn some critters;

  }

  takeTurn(numTurns: number = 1, playerControlledIndex = -1): number {
    if (this.takingTurn) {
      debugger;
    }
    this.takingTurn = true;

    for (let count = 0; count < numTurns; count++) {

      let iCritter = 1;
      const numCritters = this.numCritters;
      for (let i = 0; i < numCritters;) {
        const critter = this.critters[iCritter];
        if (critter.genome) {

          const critter = this.critters[iCritter];
          if (i !== playerControlledIndex) {
            critter.takeTurn(this);
          }

          if (critter.isDead && (SimulationConstants.allowDeathBirth || critter.wasEaten)) { //  && (critter.genome.genome === GenomeCode.Photosynthesize || !SimulationConstants.testMode)) {
            this.kill(iCritter);
          }
          else if (critter.canSpawn(this) && SimulationConstants.allowDeathBirth) {
            const tailPoint = critter.lastTailPoint; // .cellPositions[critter.length - 1];

            critter.forceSpawn = false;
            let newPos = this.findEmptyPos(tailPoint);
            if (newPos) {
              const newCritter = this.spawn(critter.genome, newPos);
              if (newCritter) {
                newCritter.energy = critter.energy / 2;
                critter.energy /= 2;
                ++critter.spawnedCount;
                newCritter.sleepCount = this.settings.sleepAfterSpawnCount;
                newCritter.energy += this.settings.turnCost * this.settings.sleepAfterSpawnCount;
                if (newCritter.length > 1) {
                  newCritter.orientation = critter.orientation;
                }
              }
            } else {
              // critter.energy = critter.energy / 2;
              // critter.energy /= 2; //= -10000;// *= .8;
              // critter.energy = -10000;// *= .8;
              critter.setEaten(this);
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

      if (this.settings.deathRays) {
        const phase = 400 * this.settings.deathRays;
        const duration = 200;
        const turnPhase = (this.turn % phase);
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
              this.pixelArray[point] = ColorDeathRay;
              // this.setPixel(point, ColorDeathRay);
            }
          }
        } else if (turnPhase === duration) {
          for (let point = 0; point < 65536; point++) {
            if (this.pixelArray[point] === ColorDeathRay) {
              this.setPixel(point, ColorBlack);
            }
          }
        }
      }

      if (!(this.turn % 100)) {

        this.addFood();
        // this.spawnPlantFromFood();
      }
    }
    this.takingTurn = false;

    // for (let i = 0; i < this.pointToCritterIndex.length; i++) {
    //   const index = this.pointToCritterIndex[i];
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

    return this.turn;
  }

  addFood() {
    let numFood = this.settings.addFoodCount;
    while (numFood--) {
      // for (let i = 0; i < 100; i++) {
      let point = Math.floor(Math.random() * 65536);
      if (this.pixelArray[point] === ColorBlack) {
        if (this.pointToCritterIndex[point]) {
          debugger;
        }
        this.pixelArray[point] = ColorGreen;
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
      if (this.pixelArray[point] === ColorGreen && !this.pointToCritterIndex[point]) {
        this.setPixel(point, ColorBlack);
        this.spawn('P', point);
        break;
      }
    }
  }

  getCritterAtPos(point: number) {
    let critterIndex = this.pointToCritterIndex[point];
    if (critterIndex) {
      const critter = this.critters[critterIndex];
      if (critter && ! critter.genome) {
        debugger;
      }
      return (critter && critter.genome) ? critter : null;
    }
    return null;
  }

  findEmptyPos(point?: number): number {

    if (point !== undefined) {

      if (this.pixelArray[point] === ColorBlack) {
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
        let pixel = this.pixelArray[newPoint];
        if (pixel === ColorBlack || (pixel === ColorGreen && !this.pointToCritterIndex[newPoint])) {
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
      let pixel = this.pixelArray[point];
      if (pixel === black) {
        return point;
      }
    }
    // return result;
  }

  // setPixel(point: number, value: number, critterIndex = 0) {
  //   this.pixelArray[point] = value;
  //   if (critterIndex === undefined) {
  //     debugger;
  //   }
  //   this.pointToCritterIndex[point] = critterIndex;
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

      critter.init(genome, point, this);
      critter.orientation = Math.floor(Math.random() * 4)
      result = critter;

      // this.setPixel(point, critter.color, critterIndex);
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
      if (critter.carryingBarrierCount) {
        --critter.carryingBarrierCount;
        this.setPixel(critter.cellPositions[i], ColorBarrier);
      } else {
        if (this.pixelArray[critter.cellPositions[i]] !== ColorBarrier) {
          this.setPixel(critter.cellPositions[i], color);
        }
      }
    }
    critter.genome = null;
    this.emptyCritterSlots[++this.emptyCritterSlotIndex] = iCritter;
  }

  getGenealogyReport() {
    const mapGenomeToReport: { [genome: string]: GenealogyReport } = {};

    const genomeToAncestors: { [genome: string]: Set<string> } = {};
    const genomeToDescendants: { [genome: string]: Set<string> } = {};

    const sortedGenomes = Object.values(genomeStore.genomeInfo).sort((a, b) => (b.count - a.count));

    const ignoreGenome = (genome: string) => {
      if (genome.length === 1 && genome !== 'P' && genome !== 'E') {
        return true;
      }
      return false;
    }

    const registerGenome = (genome: string, ancestor: string) => {
      if (ignoreGenome(genome)) {
        return;
      }
      if (!genomeToDescendants[ancestor]) {
        genomeToDescendants[ancestor] = new Set<string>()
      }
      genomeToDescendants[ancestor].add(genome)

      if (ancestor) {
        if (!genomeToAncestors[genome]) {
          genomeToAncestors[genome] = new Set<string>()
        }
        genomeToAncestors[genome].add(ancestor);
      }
    }

    for (let i = 0; i < Math.min(sortedGenomes.length, 10); i++) {
      const genomeInfo = sortedGenomes[i];
      let genome = genomeInfo.asString;
      if (ignoreGenome(genome)) {
        continue;
      }

      if (genomeInfo.ancestors) {
        const ancestorArray = genomeInfo.ancestors.split(',');

        // if the ancestor chain is like P, PE, P, mP, then clean up so it's like P, mP to prevent recursion
        const ancestorIndexMap: { [genome: string]: number } = {}
        for (let i = 0; i < ancestorArray.length; i++) {
          const ancestor = ancestorArray[i]
          if (ancestor === genome) {
            ancestorArray.splice(i - 1, ancestorArray.length - i + 1)
            break;
          }

          if (ancestorIndexMap[ancestor] === undefined) {
            ancestorIndexMap[ancestor] = i;
          } else {
            ancestorArray.splice(ancestorIndexMap[ancestor], i - ancestorIndexMap[ancestor])
            i = ancestorIndexMap[ancestor]
          }
        }

        for (let i = ancestorArray.length - 1; i >= 0; i--) {
          const ancestor = ancestorArray[i];
          registerGenome(genome, ancestor);
          genome = ancestor;
        }
      }
    }

    const addGenomeAndDescendants = (genome: string, ancestor?: string, depth = 0) => {
      if (depth > 50) {
        debugger
        return
      }
      const genomeInfo = genomeStore.genomeInfo[genome];
      //   if (!genomeInfo) {
      //     // presumably this genome is extinct
      //   } else {
      //     report.color = genomeInfo.color;
      //     report.currentCount = genomeInfo.count;
      //     report.firstAppeared = genomeInfo.firstTurn;

      const result = mapGenomeToReport[genome] = {
        ancestor: ancestor,
        genome,
        color: genomeInfo?.color ?? ColorBlack,
        currentCount: genomeInfo?.count ?? 0,
        firstAppeared: genomeInfo?.firstTurn ?? -1,
        lastAppeared: -1,
        descendants: []
      }

      const descendants = genomeToDescendants[genome]
      if (descendants) {
        descendants.forEach(descendant => {
          result.descendants.push(addGenomeAndDescendants(descendant, genome, depth + 1))
        })
      }
      return result;
    }
    addGenomeAndDescendants('P')

    return mapGenomeToReport['P']

  }

  getGenealogyReport2() {
    const map: { [genome: string]: GenealogyReport } = {};

    let result: GenealogyReport = {} as GenealogyReport;
    // return result;

    // const addGenomeAndAncestors = (genome: string, addChild?: GenealogyReport) => {
    //   if (genome.length === 1 && genome !== 'P' && genome !== 'E') {
    //     // skip non-viable single celled genomes, as they add clutter
    //     return;
    //   }
    //   let report: GenealogyReport = map[genome] ?? {
    //     genome: genome,
    //     color: ColorBlack,
    //     currentCount: 0,
    //     firstAppeared: -1,
    //     lastAppeared: -1,
    //     descendants: []
    //   };

    //   if (addChild) {
    //     report.descendants.push(addChild)
    //   }
    //   const genomeInfo = genomeStore.genomeInfo[genome];
    //   if (!genomeInfo) {
    //     // presumably this genome is extinct
    //   } else {
    //     report.color = genomeInfo.color;
    //     report.currentCount = genomeInfo.count;
    //     report.firstAppeared = genomeInfo.firstTurn;

    //     const { ancestors } = genomeInfo;
    //     if (ancestors) {
    //       const ancestorArray = ancestors.split(',')

    //       for (let i = ancestorArray.length - 1; i >= 0; i--) {
    //         const parentGenome = ancestorArray[i];
    //         let parentReport = report;
    //         parentReport = addGenomeAndAncestors(parentGenome, parentReport)
    //       }
    //     } else {
    //       result = report
    //     }
    //   }

    //   map[genome] = report;
    //   return report
    // };

    const sortedGenomes = Object.values(genomeStore.genomeInfo)
      .sort((a, b) => (b.count - a.count));


    for (let i = 0; i < Math.min(sortedGenomes.length, 5); i++) {

      const addToMap = (genomeStr: string, ancestor: string) => {

        if (genomeStr === ancestor) {
          debugger
        }

        let testCircularCount = 0;
        let testNode = map[genomeStr];
        while (testNode) {
          testNode = map[testNode.ancestor];
          ++testCircularCount;
          if (testCircularCount > (genomeStr.length * 2)) {
            debugger;
            return;
          }
        }

        const genomeInfo = genomeStore.genomeInfo[genomeStr];

        // if we're adding a genome, and we had previously added this genome as an extinct ancestor,
        // then replace the extinct ancestor with this genome
        let descendants = map[genomeStr]?.descendants ?? [];
        if (map[genomeStr] && map[genomeStr].firstAppeared === -1 && genomeInfo) {
          map[genomeStr] = null;
        }

        if (!map[genomeStr]) {
          map[genomeStr] = {
            ancestor,
            genome,
            color: genomeInfo?.color ?? ColorBlack,
            currentCount: genomeInfo?.count ?? 0,
            firstAppeared: genomeInfo?.firstTurn ?? -1,
            lastAppeared: -1,
            descendants
          };
          if (ancestor === genomeStr) {
            debugger
          }
        }

        if (ancestor) {
          let ancestorNode = map[ancestor];
          if (!ancestorNode) {
            const ancestorInfo = genomeStore.genomeInfo[ancestor];
            ancestorNode = {
              ancestor: null,
              genome,
              color: ancestorInfo?.color ?? ColorBlack,
              currentCount: ancestorInfo?.color ?? ColorBlack,
              firstAppeared: ancestorInfo?.firstTurn ?? -1,
              lastAppeared: -1,
              descendants: [map[genomeStr]]
            }
            map[ancestor] = ancestorNode;
          } else {
            const hasDup = !!ancestorNode.descendants.find(node => (node.genome === genomeStr))
            if (!hasDup) {
              ancestorNode.descendants.push(map[genomeStr])
            }
          }
        }
      }

      const genomeInfo = sortedGenomes[i];
      let genome = genomeInfo.asString;

      if (genomeInfo.ancestors) {
        const ancestorArray = genomeInfo.ancestors.split(',');

        // prevent the ancestor chain from being circular
        const ancestorIndexMap: { [genome: string]: number } = {}
        for (let i = 0; i < ancestorArray.length; i++) {
          const ancestor = ancestorArray[i]
          if (ancestor === genome) {
            ancestorArray.splice(i - 1, ancestorArray.length - i + 1)
            break;
          }
          if (ancestorIndexMap[ancestor] === undefined) {
            ancestorIndexMap[ancestor] = i;
          } else {
            debugger
            ancestorArray.splice(ancestorIndexMap[ancestor], i - ancestorIndexMap[ancestor])
            i = ancestorIndexMap[ancestor]
          }
        }

        for (let i = ancestorArray.length - 1; i >= 0; i--) {
          const ancestor = ancestorArray[i];
          addToMap(genome, ancestor);
          genome = ancestor;
        }
      } else {
        addToMap(genome, null)
      }

      // const addToMap2 = (genomeStr: string) => {
      //   const genome = genomeStore.genomeInfo[genomeStr]
      //   let report = map[genomeStr]
      //   if (report) {
      //     if (report.firstAppeared === -1) {
      //       // was an extinct ancestor ?

      //     }
      //   } else {

      //   }
      //   if (!report) {
      //     report = {
      //       genome: genomeInfo.asString,
      //       color: ColorBlack,
      //       currentCount: 0,
      //       firstAppeared: -1,
      //       lastAppeared: -1,
      //       descendants: []
      //     }
      //   } else {
      //     if ()
      //   }
      // }
      // addGenomeAndAncestors(sortedGenomes[i].asString)
    }
    return map['P']
    // console.log(result)
    // return result as GenealogyReport;
  }

}

