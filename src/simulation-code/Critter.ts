import { SimulationConstants } from '../common/SimulationConstants';
import { ColorBlack, ColorDeathRay, ColorGreen } from './Colors';
import { Genome } from './Genome';
import { GenomeCode, GenomeCodeToInfoMap } from './GenomeCode';
import { Simulation } from './Simulation';
import { decodePoint, Orientation } from './Orientation';
import { SimulationSettings } from './SimulationSettings';
// import { World } from './World';
// import { SimulationSettings } from './SimulationSettings';

const numConditions = 5;

export class Critter {
  genome: Genome;
  cellPositions = new Array<number>(SimulationConstants.maxCritterLength);
  counters = new Array<number>(SimulationConstants.maxGenomeLength);
  conditions = new Array<boolean>(numConditions);
  energy: number = -1;
  orientation: number;
  length: number;
  lengthPhotoCells: number;
  testTurnGreenCount: number;
  age: number;
  maxLifespan: number;
  spawnEnergy: number;
  photosynthesizing: number = 0;
  unfolded: boolean = false;
  color: number;
  colorPhotosynthesizing: number;
  conditionHead = 0;
  numPhotosynthesizeCells = 0;
  forceSpawn = false;
  startPc: number = 0;
  pc: number;
  hypermode: boolean;
  condition: boolean;
  timer1: number;
  timer2: number;
  sleepCount: number;
  blocked: boolean;
  lastTailPoint: number;
  bitten: boolean;
  spawnedCount: number;
  turnDirection: number;
  reverseIf: boolean;
  failed: boolean;

  constructor(public readonly critterIndex: number) {
    for (let i = 0; i < SimulationConstants.maxCritterLength; i++) {
      this.cellPositions[i] = 0;
    }
    for (let i = 0; i < numConditions; i++) {
      this.conditions[i] = false;
    }
  }

  init(genome: Genome, point: number, globals: Simulation) {
    // const { settings } = World;
    Object.assign(this, {
      genome,
      pc: 0,
      hypermode: false,
      condition: false,
      lengthPhotoCells: 0,
      timer1: -1,
      timer2: -1,
      sleepCount: 0,
      blocked: false,
      photosynthesizing: 0,
      bitten: false,
      forceSpawn: false,
      spawnedCount: 0,
      turnDirection: 1,
      conditionHead: 0,
      startPc: 0,
      reverseIf: false,
      colorPhotosynthesizing: ColorGreen,
      testTurnGreenCount: 0,
      failed: false
    });

    const { settings } = globals;
    const length = this.length = Math.min(globals.settings.limitCellLength, genome.asString.length);
    this.testTurnGreenCount = this.genome.codes.length;
    this.unfolded = length === 1;
    this.color = this.genome.color;

    this.maxLifespan = Math.floor(length * settings.lifespanPerCell * (Math.random() / 2 + .5));
    this.spawnEnergy = settings.spawnEnergyPerCell * length;
    this.energy = this.spawnEnergy / 2;
    this.age = 0;

    this.orientation = Math.floor(4 * Math.random());

    for (let i = 0; i < length; i++) {
      this.cellPositions[i] = point;
    }
    for (let i = 0; i < this.counters.length; i++) {
      this.counters[i] = 0;
    }
    this.lastTailPoint = point;

    globals.setPixel(point, this.color, this.critterIndex);
    this.validate(globals);
  }

  validate(globals: Simulation) {
    if (SimulationConstants.validate) {
      let pts = {};
      const pointToCritterIndex = globals.pointToCritterIndex;
      let wasUnfolded = true;
      for (let i = 0; i < this.length; i++) {
        const pos = this.cellPositions[i];
        if (pts[pos]) {
          wasUnfolded = false;
        }
        pts[pos] = true;

        const curIndex = pointToCritterIndex[pos];
        if (curIndex !== this.critterIndex) {
          debugger;
        }
      }

      if (this.unfolded !== wasUnfolded) {
        debugger;
      }
    }

  }

  nextCode() {
    const codes = this.genome.codes;
    const result = codes[this.pc];
    if (this.pc === this.startPc) {
      this.hypermode = false;
    }
    if (++this.pc === codes.length) {
      this.pc = this.startPc;
      // } else {
      //   if (genomeAsStringArray[this.pc] === GenomeCode.Restart) {
      //     this.pc = this.startPc;
      //   }
    }
    return result;
  }

  advancePc() {
    if (++this.pc === this.genome.codes.length) {
      this.pc = this.startPc;
    }
  }

  goToMarker(code: GenomeCode) {
    const codes = this.genome.codes;
    for (let i = 0; i < codes.length; i++) {
      if (codes[(i + this.pc) % codes.length] === code) {
        this.pc = (this.pc + i + 1) % codes.length;
        return;
      }
    }
  }

  executeTest() {
    if ((!this.condition) || (this.reverseIf && this.condition)) {
      const codes = this.genome.codes;
      for (let i = 1; i < codes.length; i++) {
        let testPC = (this.pc + i) % codes.length;
        if (codes[testPC] === GenomeCode.Else) {
          this.pc = (testPC + 1) % codes.length;
          return;
        }
      }

      let maxCount = codes.length;
      while (maxCount--) {
        if (++this.pc >= codes.length) {
          this.pc = this.startPc;
        }
        if (codes[this.pc] === GenomeCode.And) {
          // this.pc += 2;
          if (++this.pc >= codes.length) {
            this.pc = this.startPc;
          }
        } else {
          break;
        }
      }

    }
  }

  takeTurn(globals: Simulation) {

    // if we're dead, nothing to do
    if (this.isDead) {
      return;
    }
    // if (this.wasEaten) {
    //   return;
    // }

    const allowCannibalism = globals.settings.allowCannibalism;

    // if we're photosynthesizing and we're unfolded, then the cells will turn to green over time,
    // starting at the tail and moving to the head. Moving will reverse this trend.
    // if (this.photosynthesizing /* && this.unfolded */ && this.lengthPhotoCells < this.length) {
    //   --this.testTurnGreenCount;
    //   if (this.testTurnGreenCount <= 0) {
    //     this.testTurnGreenCount = this.genome.codes.length * 2;
    //     for (let i = this.length - 2; i >= 0; i--) {
    //       const pixel = globals.pixelArray[this.cellPositions[i]];
    //       if (pixel !== ColorGreen) {
    //         globals.setPixel(this.cellPositions[i], ColorGreen, this.critterIndex);
    //         ++this.lengthPhotoCells;
    //         break;
    //       }
    //     }
    //   }
    // }


    if (!SimulationConstants.allowDeathBirth && !this.wasEaten) {
      this.energy = Math.max(this.energy, 20);
    }

    const { codes, codesInfo } = this.genome;
    if (this.timer1 > 0) {
      --this.timer1;
    }
    if (this.timer2 > 0) {
      --this.timer2;
    }

    const genomeLength = codes.length;
    const { settings } = globals;
    const turnCost = settings.turnCost + genomeLength * settings.baseInstructionCost;

    if (this.photosynthesizing) {

      if (this.unfolded /* && this.length > 1 */) {
        this.energy += settings.photoSynthesisEnergy * this.lengthPhotoCells; // * this.length; // (this.length - 1) * (settings.photoSynthesisEnergy - settings.turnCost);
      }
      // --this.photosynthesizing;
      // this.energy += settings.photoSynthesisEnergy / 2;
      // + (this.length - 1) * (settings.photoSynthesisEnergy - settings.turnCost);
      // this.energy += settings.photoSynthesisEnergy + (this.length - 1) * (settings.photoSynthesisEnergy - settings.turnCost);
    }


    if (this.sleepCount) {
      ++this.age;
      --this.sleepCount;
      this.energy -= globals.settings.turnCost * globals.settings.sleepTurnEnergyCost;

      return;
    }

    // console.log(this.critterIndex + ': ' + this.energy)
    let numCycles = 10;

    this.energy -= turnCost;
    ++this.age;
    if (this.hypermode) {
      this.energy -= turnCost;
      ++this.age;
      numCycles *= 2;
    }

    let maxExecution = genomeLength;

    while (!this.sleepCount && maxExecution-- > 0 && numCycles > 0) {
      this.validate(globals);

      // if (this.pc === 0) {
      //   this.hypermode = false;
      //   // this.setPhotosynthesizing(false);
      //   // this.condition = false;
      // }

      const code = codes[this.pc];
      const codeInfo = codesInfo[this.pc];
      this.advancePc();

      if (code === GenomeCode.MarkerA ||
        code === GenomeCode.MarkerB ||
        code === GenomeCode.MarkerC ||
        code === GenomeCode.Else ||
        code === GenomeCode.And) {
        continue;
      }

      // this.energy -= settings.baseInstructionCost;

      // const code = genomeAsStringArray[this.pc] as GenomeCode;
      // this.energy -= .25;
      const codeCycles = (codeInfo.numCycles >= 10) ? 10 : 0; //codeInfo.numCycles ? 10 : 1; // codeInfo.numCycles;
      numCycles -= codeCycles;

      switch (code) {
        case GenomeCode.GoToA:
          this.goToMarker(GenomeCode.MarkerA);
          break;

        case GenomeCode.GoToB:
          this.goToMarker(GenomeCode.MarkerB);
          break;

        case GenomeCode.GoToC:
          this.goToMarker(GenomeCode.MarkerC);
          break;

        case GenomeCode.Photosynthesize:
          if (this.unfolded) {

            if (this.lengthPhotoCells) {
              if (this.lengthPhotoCells < this.length) {
                for (let i = this.length - 2; i >= 0; i--) {
                  const pixel = globals.pixelArray[this.cellPositions[i]];
                  if (pixel !== ColorGreen) {
                    globals.setPixel(this.cellPositions[i], ColorGreen, this.critterIndex);
                    ++this.lengthPhotoCells;
                    break;
                  }
                }
              }
            } else {
              this.setPhotosynthesizing(globals, true);
              this.energy += settings.photoSynthesisEnergy; // * this.numPhotosynthesizeCells;
            }

            // this.energy += settings.photoSynthesisEnergy * this.length;
            // this.energy += settings.photoSynthesisEnergy;// + (this.length - 1) * (settings.photoSynthesisEnergy - settings.turnCost);
          }
          break;

        case GenomeCode.StopPhotosynthesize:
          this.setPhotosynthesizing(globals, false);
          break;

        // case GenomeCode.MoveAndEat:
        //   this.move(settings, true);
        //   this.setPhotosynthesizing(false);
        //   break;

        case GenomeCode.Eat:
          this.eat(globals, true);
          break;


        case GenomeCode.EatOther:
          this.eat(globals, false);
          break;


        case GenomeCode.Move:
          this.move(globals);
          // this.setPhotosynthesizing(false);
          break;

        case GenomeCode.Flip:
          this.flip(globals);
          break;

        case GenomeCode.Sleep:
          this.sleepCount = settings.sleepCount;
          numCycles = 0;
          break;

        case GenomeCode.Hypermode:
          this.hypermode = true;
          break;

        case GenomeCode.Spawn:
          this.forceSpawn = true;
          break;

        case GenomeCode.TurnLeft:
          this.orientation = (this.orientation + 3) % 4;
          break;

        case GenomeCode.TurnRight:
          this.orientation = (this.orientation + 1) % 4;
          break;

        case GenomeCode.OrientUp:
          this.orientation = 1;
          break;

        case GenomeCode.OrientDown:
          this.orientation = 3;
          break;

        case GenomeCode.OrientRight:
          this.orientation = 3;
          break;

        case GenomeCode.OrientLeft:
          this.orientation = 2;
          break;

        case GenomeCode.SetTimer1:
          this.timer1 += settings.timer1Length;
          break;

        case GenomeCode.SetTimer2:
          this.timer2 += settings.timer2Length;
          break;

        case GenomeCode.TestSeeRelative: {
          let distance = (settings.sightDistance); // * (this.pc + 1);
          this.testSeeRelative(globals, distance);
          this.executeTest();
          break;
        }

        case GenomeCode.TestSeeFood:
          // case GenomeCode.TestSeeFoodOther:
          {
            let distance = (settings.sightDistance); // * (this.pc + 1);
            // let distance = (code === GenomeCode.TestSeeFood) ? settings.sightDistance : (settings.sightDistance * 2);// * (this.pc + 1);
            // while (this.pc < (genome.length - 2) && genome[(this.pc + 1) % genome.length] === GenomeCode.TestSeeFood) {
            //   distance += settings.sightDistance;
            //   this.pc = (this.pc + 1) % genome.length;
            // }
            this.testSeeFood(globals, distance, code === GenomeCode.TestSeeFood);
            this.executeTest();
            // if ((!this.condition) || (this.reverseIf && this.condition)) {
            //   this.nextCode();
            //   this.reverseIf = false;
            // }
            // this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          }
          break;

        case GenomeCode.TestBlocked:
          this.condition = this.blocked;
          this.blocked = false;
          this.executeTest();

          // this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;

        case GenomeCode.TestBitten:
          this.condition = this.bitten;
          this.bitten = false;
          this.executeTest();

          // this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;

        case GenomeCode.TestSpawned:
          this.condition = !!this.spawnedCount;
          this.spawnedCount = 0;
          this.executeTest();
          // this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;

        case GenomeCode.TestLeftSide:
          this.condition = decodePoint(this.cellPositions[0]).x < 128;
          this.executeTest();
          break;

        case GenomeCode.TestTopSide:
          this.condition = decodePoint(this.cellPositions[0]).y < 128;
          this.executeTest();
          break;


        case GenomeCode.TestTimer1:
          this.condition = this.timer1 > 0;
          // this.condition = this.timer1 === 0;
          // this.timer1 = -1;
          this.executeTest();
          // this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;

        case GenomeCode.TestTimer2:
          this.condition = this.timer2 > 0;
          // this.condition = this.timer2 === 0;
          // this.timer2 = -2;
          this.executeTest();
          // this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;

        case GenomeCode.TestUnfolded:
          this.condition = this.unfolded;
          this.executeTest();
          // this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;

        case GenomeCode.TestTurn: {
          ++this.counters[this.pc];
          this.condition = this.pc < this.counters[this.pc]

          // const turnPhase = (this.pc + 1) * 5;
          // this.condition = !!(Math.floor(globals.turn / turnPhase) & 1);
          // this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          this.executeTest();
          break;
        }

        case GenomeCode.TestFailed: {
          this.condition = this.failed;
          this.executeTest();
          break;
        }

        case GenomeCode.TestTouchingRelative: {
          this.testTouchingRelative(globals);
          this.executeTest();
          break;
        }

        case GenomeCode.IfCondition:
          this.condition = this.conditions[(--this.conditionHead + numConditions) % numConditions];
          if (this.pc !== (genomeLength - 1) && !this.condition) {
            this.advancePc();
            // this.nextCode();
            // this.pc = (this.pc + this.turnDirection + genomeLength) % genomeLength;
          }
          break;

        case GenomeCode.IfNotCondition:
          this.reverseIf = !this.reverseIf;
          // this.condition = this.conditions[(--this.conditionHead + numConditions) % numConditions];
          // if (this.pc !== (genomeLength - 1) && this.condition) {
          //   this.nextCode();
          //   // this.pc = (this.pc + this.turnDirection + genomeLength) % genomeLength;
          // }
          break;

        case GenomeCode.Restart:
          this.pc = this.startPc;
          this.turnDirection = 1;
          for (let i = 0; i < this.counters.length; i++) {
            this.counters[i] = 0;
          }
          break;

        case GenomeCode.Reverse:
          this.turnDirection = -this.turnDirection;
          break;

        case GenomeCode.NextMarker: {
          for (let i = this.pc; i < (genomeLength - 1); i++) {
            if (codes[i] === GenomeCode.Restart) {
              this.pc = i + 1;
              break;
            }
          }
        }
      }
    }
  }


  setPhotosynthesizing(globals: Simulation, value: boolean) {
    if (value !== !!this.photosynthesizing) {
      this.photosynthesizing = value ? globals.settings.photosynthesisDuration : 0;
      this.lengthPhotoCells = this.photosynthesizing ? 1 : 0;
      if (value) {
        if (this.length > 1 && this.unfolded) {
          const color = this.photosynthesizing ? this.genome.colorPhotosynthesizing : this.color;

          globals.setPixel(this.cellPositions[this.length - 1], color, this.critterIndex);
        }
      } else {
        for (let i = 0; i < this.length; i++) {
          globals.setPixel(this.cellPositions[i], this.color, this.critterIndex);
        }
      }
    }
  };

  move(globals: Simulation) {
    const { settings } = globals;
    this.blocked = false;
    // this.bitten = false;
    const delta = Orientation.deltas[this.orientation];
    const newHead = (this.cellPositions[0] + delta) & 0xffff;

    const destPixel = globals.pixelArray[newHead];
    const hitCritter = globals.critters[globals.pointToCritterIndex[newHead]];

    // this.energy -= settings.moveCost / 2;

    this.failed = false;
    if (destPixel === ColorBlack || destPixel === ColorDeathRay /* || (! this.photosynthesizing && hitCritter === this) */) {
      this.energy -= settings.moveCost;
      // this.energy -= settings.moveCost / 2;
      // this.setPhotosynthesizing(globals, false);
      // this.hypermode = false;

      const color = this.color; // this.photosynthesizing ? this.colorPhotosynthesizing : this.color;

      const tail = this.cellPositions[this.length - 1];

      const oldCellPos = this.cellPositions.slice();
      // set head
      for (let i = this.length - 1; i > 0; i--) {
        this.cellPositions[i] = this.cellPositions[i - 1];
      }
      this.cellPositions[0] = newHead;

      globals.setPixel(newHead, color, this.critterIndex);

      if (this.length > 1) {
        this.unfolded = this.cellPositions[this.length - 2] !== this.cellPositions[this.length - 1];
      }
      if (this.photosynthesizing && this.unfolded) {
        this.photosynthesizing = 0;
        this.lengthPhotoCells = 0;
        for (let i = 0; i < this.length; i++) {
          globals.setPixel(this.cellPositions[i], color, this.critterIndex);
        }

        // this.lengthPhotoCells = 1;
        // for (let i = 0; i < (this.length - 1); i++) {
        //   globals.setPixel(this.cellPositions[i], color, this.critterIndex);
        // }
  
        // globals.setPixel(this.cellPositions[this.length - this.lengthPhotoCells], ColorGreen, this.critterIndex);
        // this.lengthPhotoCells = Math.max(this.lengthPhotoCells - 1, 1);
      }

      if (tail !== this.cellPositions[this.length - 1]) {

        globals.setPixel(tail, ColorBlack);
        this.lastTailPoint = tail;
        // debugger;

        // if (this.unfolded && this.length > 1) {
        //   let pts = {};
        //   for (let i = 0; i < this.length; i++) {
        //     if (pts[this.cellPositions[i]]) {
        //       console.log(`overlap detected: oldCellPos=${JSON.stringify(oldCellPos)}, newHead=${newHead}, this.cellPositions=${JSON.stringify(this.cellPositions)}`);
        //       debugger;
        //     }
        //     pts[this.cellPositions[i]] = true;
        //   }
        // }

      }
    } else {
      this.blocked = true;
      this.failed = true;
    }
    this.validate(globals);

  }

  flip(globals: Simulation) {
    if (this.length > 1) {
      let photo = this.photosynthesizing;
      if (photo) {
        this.setPhotosynthesizing(globals, false)
      }

      for (let i = 0; i < (this.length / 2); i++) {
        const j = this.length - i - 1;
        let swap = this.cellPositions[i];
        this.cellPositions[i] = this.cellPositions[j];
        this.cellPositions[j] = swap;
      }
      this.orientation = (this.orientation + 2) % 4;

      if (photo) {
        this.setPhotosynthesizing(globals, true)
      }
    }
  }

  get wasEaten() {
    return this.energy <= -1000;
  }

  setEaten(globals: Simulation) {
    this.energy = -10000;
    for (let i = 0; i < this.length; i++) {
      const index = globals.pointToCritterIndex[this.cellPositions[i]];

      if (index === this.critterIndex || !index) {
        // World.setPixel(this.cellPositions[i], ColorBlack);
      } else {
//        debugger;
      }
    }
  }

  canEat(critter: Critter, allowCannibalism: boolean = false) {
    if (critter === this) {
      return false;
    }
    if (!allowCannibalism && critter.genome === this.genome) {
      return false;
    }
    if (critter.wasEaten) {
      return false;
    }
    return critter.photosynthesizing || !critter.unfolded;
  }

  eat(globals: Simulation, allowCannibalism: boolean) {
    // if (this.photosynthesizing) {
    //   return;
    // }
    const { settings } = globals;
    // this.setPhotosynthesizing(false);
    const delta = Orientation.deltas[this.orientation];
    const newHead = (this.cellPositions[0] + delta) & 0xffff;

    const destPixel = globals.pixelArray[newHead];
    this.energy -= settings.eatCost;

    this.failed = true;

    if (destPixel === ColorBlack) {
      return;
    }
    const digestionEfficiency = settings.digestionEfficiencyPercent / 100;

    const hitCritter = globals.critters[globals.pointToCritterIndex[newHead]];
    if (hitCritter && destPixel === hitCritter.colorPhotosynthesizing) {
      hitCritter.validate(globals);
      if (this.canEat(hitCritter, allowCannibalism)) {
        this.failed = false;

        let biteDamage = settings.spawnEnergyPerCell * settings.biteStrength;

        // this.energy += Math.min(hitCritter.unfolded ? hitCritter.energy : settings.spawnEnergyPerCell, biteDamage) * digestionEfficiency;
        this.energy += Math.min(hitCritter.energy, biteDamage) * digestionEfficiency;
        hitCritter.bitten = true;
        hitCritter.energy -= biteDamage;
        if (hitCritter.energy <= 0) {
          hitCritter.setEaten(globals);
        }
      }
    } else if (destPixel === ColorGreen) {
      this.failed = false;

      if (hitCritter) {
        debugger
      }
      this.energy += settings.spawnEnergyPerCell * digestionEfficiency; // / 2;
      globals.setPixel(newHead, ColorBlack);
    }
  }

  testSeeRelative(globals: Simulation, sightDistance: number) {
    this.condition = false;
    const delta = Orientation.deltas[this.orientation];

    let point = this.cellPositions[0];
    for (let i = 0; i < sightDistance; i++) {
      point = (point + delta) & 0xffff;
      const destPixel = globals.pixelArray[point];
      if (destPixel !== ColorBlack) {
        const hitCritter = globals.critters[globals.pointToCritterIndex[point]];
        if (hitCritter) {
          this.condition = hitCritter.genome === this.genome
        }
        break
      }
    }
  }


  testSeeFood(globals: Simulation, sightDistance: number, allowCannibalism: boolean) {
    this.condition = false;
    const delta = Orientation.deltas[this.orientation];

    let point = this.cellPositions[0];
    for (let i = 0; i < sightDistance; i++) {
      point = (point + delta) & 0xffff;
      const destPixel = globals.pixelArray[point];
      if (destPixel !== ColorBlack) {
        if (destPixel === ColorGreen) {
          const hitCritter = globals.critters[globals.pointToCritterIndex[point]];
          if (hitCritter) {
            if (this.canEat(hitCritter, allowCannibalism)) {
              this.condition = true;
            }
          } else //if (destPixel === ColorGreen) {
            this.condition = true;
        }
        break;
      }

      // const hitCritter = globals.critters[globals.pointToCritterIndex[point]];
      // if (hitCritter) {
      //   if (this.canEat(hitCritter, allowCannibalism)) {
      //     this.condition = true;
      //   }
      //   break;
      // } else {
      //   if (destPixel === ColorGreen) {
      //     this.condition = true;
      //     break;
      //   } else if (destPixel !== ColorBlack) {
      //     break;
      //   }

      // }

      // if (hitCritter !== this) {
      //   this.condition = true;
      //   if (!allowCannibalism) {
      //     if (hitCritter && hitCritter !== this && this.genome === hitCritter.genomeInfo) {
      //       this.condition = false;
      //     }
      //   }
      // }
      //   break;
      // } else if (destPixel !== ColorBlack) {
      //   break;
      // }
    }
  }


  testTouchingRelative(globals: Simulation) {
    this.condition = false;
    const delta = Orientation.deltas[this.orientation];
    const newHead = (this.cellPositions[0] + delta) & 0xffff;

    const destPixel = globals.pixelArray[newHead];
    if (destPixel !== ColorBlack) {

      const hitCritter = globals.critters[globals.pointToCritterIndex[newHead]];
      if (hitCritter && hitCritter.genome === this.genome /* && hitCritter !== this */) {
        this.condition = true;
      }
    }
  }

  canSpawn(globals: Simulation) {
    return (this.forceSpawn && this.unfolded && this.energy > globals.settings.spawnEnergyPerCell) || this.energy > this.spawnEnergy;
  }

  get isDead() {
    return this.age > this.maxLifespan || this.energy <= 0; //-this.spawnEnergy;
  }
}