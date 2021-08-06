import { SimulationConstants } from '../common/SimulationConstants';
import { ColorBlack, ColorDeathRay, ColorGreen } from './Colors';
import { Genome } from './Genome';
import { GenomeCode, GenomeCodeToInfoMap } from './GenomeCode';
import { Globals } from './Globals';
import { Orientation } from './Orientation';
import { SimulationSettings } from './SimulationSettings';
// import { Globals } from './Globals';
// import { SimulationSettings } from './SimulationSettings';

const numConditions = 5;

const allowCannibalism = true;

export class Critter {
  genome: Genome;
  cellPositions = new Array<number>(SimulationConstants.maxCritterLength);
  conditions = new Array<boolean>(numConditions);
  energy: number = -1;
  orientation: number;
  length: number;
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

  constructor(public readonly critterIndex: number) {
    for (let i = 0; i < SimulationConstants.maxCritterLength; i++) {
      this.cellPositions[i] = 0;
    }
    for (let i = 0; i < numConditions; i++) {
      this.conditions[i] = false;
    }
  }

  init(genome: Genome, point: number, globals: Globals) {
    // const { settings } = Globals;
    Object.assign(this, {
      genome,
      pc: 0,
      hypermode: false,
      condition: false,
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
      reverseIf: false
    });

    const { settings } = globals;
    const length = this.length = Math.min(globals.settings.limitCellLength, genome.asString.length);
    this.unfolded = length === 1;
    this.color = this.genome.color;

    // this.numPhotosynthesizeCells = 0;
    // for (let i = 0; i < genomeAsNumericArray.length; i++) {
    //   if (genomeAsNumericArray[i] === GenomeCode.Photosynthesize) {
    //     ++this.numPhotosynthesizeCells;
    //   }
    // }

    this.maxLifespan = Math.floor(length * settings.lifespanPerCell * (Math.random() / 2 + .5));
    this.spawnEnergy = settings.spawnEnergyPerCell * length;
    this.energy = this.spawnEnergy / 2;
    this.age = 0;

    this.orientation = Math.floor(4 * Math.random());

    for (let i = 0; i < length; i++) {
      this.cellPositions[i] = point;
    }
    this.lastTailPoint = point;
  }

  validate(globals: Globals) {
    return;
    let pts = {};
    const pointToCritterIndex = globals.pointToCritterIndex;
    for (let i = 0; i < this.length; i++) {
      const pos = this.cellPositions[i];
      if (this.unfolded && pts[pos]) {
        debugger;
      }
      pts[pos] = true;

      const curIndex = pointToCritterIndex[pos];
      if (curIndex !== this.critterIndex) {
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
      for (let i = 0; i < codes.length; i++) {
        let testPC = (this.pc + i) % codes.length;
        if (codes[testPC] === GenomeCode.Else) {
          this.pc = (testPC + 1) % codes.length;
          return;
        }
      }
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
    }
  }

  takeTurn(globals: Globals) {

    if (this.wasEaten) {
      return;
    }


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

    if (this.sleepCount) {
      ++this.age;
      --this.sleepCount;
      this.energy -= turnCost / 2;

      return;
    }



    let numCycles = 20;

    this.energy -= turnCost;
    ++this.age;
    if (this.hypermode) {
      this.energy -= turnCost;
      ++this.age;
      numCycles *= 2;
    }

    let maxExecution = genomeLength;

    if (this.photosynthesizing) {

      if (this.unfolded /* && this.length > 1 */) {
        this.energy += settings.photoSynthesisEnergy * this.length; // (this.length - 1) * (settings.photoSynthesisEnergy - settings.turnCost);
      }
      // --this.photosynthesizing;
      // this.energy += settings.photoSynthesisEnergy / 2;
      // + (this.length - 1) * (settings.photoSynthesisEnergy - settings.turnCost);
      // this.energy += settings.photoSynthesisEnergy + (this.length - 1) * (settings.photoSynthesisEnergy - settings.turnCost);
    }



    while (!this.sleepCount && maxExecution-- > 0) {
      this.validate(globals);

      // if (this.pc === 0) {
      //   this.hypermode = false;
      //   // this.setPhotosynthesizing(false);
      //   // this.condition = false;
      // }

      const code = codes[this.pc];
      if (code === GenomeCode.MarkerA || code === GenomeCode.MarkerB || code === GenomeCode.MarkerC || code === GenomeCode.Else) {
        continue;
      }
      const codeInfo = codesInfo[this.pc];

      // this.energy -= settings.baseInstructionCost;

      // const code = genomeAsStringArray[this.pc] as GenomeCode;
      // this.energy -= .25;
      const codeCycles = codeInfo.numCycles ? 10 : 1; // codeInfo.numCycles;
      numCycles -= codeCycles;
      if (numCycles < 0) {
        break;
      }

      this.advancePc();

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
          this.setPhotosynthesizing(globals, true);
          if (this.unfolded) {
            // this.energy += settings.photoSynthesisEnergy; // * this.numPhotosynthesizeCells;
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
          // const orientation = this.orientation;
          // for (let i = 0; i < 4; i++) {
          //   this.orientation = i;
          // const allowCannibalism = !!(this.pc & 1);
          this.eat(globals, allowCannibalism); //);
          // }
          // this.orientation = orientation;
          break;


        case GenomeCode.Move:
          this.move(globals);
          // this.setPhotosynthesizing(false);
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

        case GenomeCode.TestSeeFood:
          {
            let distance = (settings.sightDistance) * (this.pc + 1);
            // let distance = (code === GenomeCode.TestSeeFood) ? settings.sightDistance : (settings.sightDistance * 2);// * (this.pc + 1);
            // while (this.pc < (genome.length - 2) && genome[(this.pc + 1) % genome.length] === GenomeCode.TestSeeFood) {
            //   distance += settings.sightDistance;
            //   this.pc = (this.pc + 1) % genome.length;
            // }
            this.testSeeFood(globals, distance, allowCannibalism);
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
          const turnPhase = (this.pc + 1) * 10;
          this.condition = !!(Math.floor(globals.turn / turnPhase) & 1);
          // this.conditions[(this.conditionHead++) % numConditions] = this.condition;
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


  setPhotosynthesizing(globals: Globals, value: boolean) {
    if (value !== !!this.photosynthesizing) {
      this.photosynthesizing = value ? globals.settings.photosynthesisDuration : 0;
      if (this.length > 1 && this.unfolded) {
        const color = this.photosynthesizing ? this.genome.colorPhotosynthesizing : this.color;
        const pointToCritterIndex = globals.pointToCritterIndex;
        for (let i = 0; i < this.length; i++) {
          const pos = this.cellPositions[i];
          const curIndex = pointToCritterIndex[pos];
          if (curIndex !== this.critterIndex) {
            debugger;
          }
          globals.setPixel(this.cellPositions[i], color, this.critterIndex);
        }
      }
    }
  };

  move(globals: Globals) {
    const { settings } = globals;
    this.blocked = false;
    // this.bitten = false;
    const delta = Orientation.deltas[this.orientation];
    const newHead = (this.cellPositions[0] + delta) & 0xffff;

    const destPixel = globals.pixelArray[newHead];

    this.energy -= settings.moveCost / 2;

    if (destPixel === ColorBlack || destPixel === ColorDeathRay) {
      this.energy -= settings.moveCost / 2;
      this.setPhotosynthesizing(globals, false);
      this.hypermode = false;

      const color = this.photosynthesizing ? this.colorPhotosynthesizing : this.color;

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
    }
    this.validate(globals);

  }

  get wasEaten() {
    return this.energy <= -1000;
  }

  setEaten(globals: Globals) {
    this.energy = -10000;
    for (let i = 0; i < this.length; i++) {
      const index = globals.pointToCritterIndex[this.cellPositions[i]];

      if (index === this.critterIndex || !index) {
        // Globals.setPixel(this.cellPositions[i], ColorBlack);
      } else {
        debugger;
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

  eat(globals: Globals, allowCannibalism: boolean) {
    // if (this.photosynthesizing) {
    //   return;
    // }
    const { settings } = globals;
    // this.setPhotosynthesizing(false);
    const delta = Orientation.deltas[this.orientation];
    const newHead = (this.cellPositions[0] + delta) & 0xffff;

    const destPixel = globals.pixelArray[newHead];
    this.energy -= settings.eatCost;

    if (destPixel === ColorBlack) {
      return;
    }
    const digestionEfficiency = settings.digestionEfficiencyPercent / 100;

    const hitCritter = globals.critters[globals.pointToCritterIndex[newHead]];
    if (hitCritter) {
      hitCritter.validate(globals);
      if (this.canEat(hitCritter, allowCannibalism)) {
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
      this.energy += settings.spawnEnergyPerCell * digestionEfficiency / 2;
      globals.setPixel(newHead, ColorBlack);
    }
  }


  testSeeFood(globals: Globals, sightDistance: number, allowCannibalism: boolean) {
    this.condition = false;
    const delta = Orientation.deltas[this.orientation];

    let point = this.cellPositions[0];
    for (let i = 0; i < sightDistance; i++) {
      point = (point + delta) & 0xffff;
      const destPixel = globals.pixelArray[point];
      if (destPixel !== ColorBlack) {
        const hitCritter = globals.critters[globals.pointToCritterIndex[point]];
        if (hitCritter) {
          if (this.canEat(hitCritter, allowCannibalism)) {
            this.condition = true;
          }
        } else if (destPixel === ColorGreen) {
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


  testTouchingRelative(globals: Globals) {
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

  canSpawn(globals: Globals) {
    return (this.forceSpawn && this.unfolded && this.energy > globals.settings.spawnEnergyPerCell) || this.energy > this.spawnEnergy;
  }

  get isDead() {
    return this.age > this.maxLifespan || this.energy <= 0; //-this.spawnEnergy;
  }
}