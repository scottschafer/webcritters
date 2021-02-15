import { SimulationConstants } from '../common/SimulationConstants';
import { ColorBlack, ColorGreen } from './Colors';
import { cellLengthFromGenome, GenomeCode, GenomeCodeInfo, getCyclesPerCode } from './Genome';
import { GenomeInfo, genomeStore } from './GenomeStore';
import { Globals } from './Globals';
import { Orientation } from './Orientation';
import { SimulationSettings } from './SimulationSettings';

const numConditions = 5;

export class Critter {
  genomeInfo: GenomeInfo;
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

  constructor(public readonly critterIndex: number) {
    for (let i = 0; i < SimulationConstants.maxCritterLength; i++) {
      this.cellPositions[i] = 0;
    }
    for (let i = 0; i < numConditions; i++) {
      this.conditions[i] = false;
    }
  }

  init(genome: string, point: number) {
    const { settings } = Globals;
    Object.assign(this, {
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
      conditionHead: 0
    });
    this.genomeInfo = genomeStore.genomeInfo[genome];

    const length = this.length = cellLengthFromGenome(genome);
    this.unfolded = length === 1;
    this.color = this.genomeInfo.color;

    this.numPhotosynthesizeCells = 0;
    for (let i = 0; i < genome.length; i++) {
      if (genome[i] === GenomeCode.Photosynthesize) {
        ++this.numPhotosynthesizeCells;
      }
    }

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

  validate() {
    return;
    let pts = {};
    const pointToCritterIndex = Globals.pointToCritterIndex;
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

  takeTurn() {

    if (this.wasEaten) {
      return;
    }


    if (!SimulationConstants.allowDeathBirth && !this.wasEaten) {
      this.energy = Math.max(this.energy, 20);
    }
    const { settings } = Globals;
    const { genome } = this.genomeInfo;
    if (this.timer1 > 0) {
      --this.timer1;
    }
    if (this.timer2 > 0) {
      --this.timer2;
    }

    if (this.sleepCount) {
      ++this.age;
      --this.sleepCount;
      // this.energy -= settings.turnCost / 2;

      return;
    }


    let numCycles = 20;
    this.energy -= settings.turnCost;
    ++this.age;
    if (this.hypermode) {
      this.energy -= settings.turnCost;
      ++this.age;
      numCycles *= 2;
    }

    let maxExecution = genome.length;

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
      this.validate();
      this.energy -= settings.baseInstructionCost;

      if (this.pc === 0) {
        this.hypermode = false;
        // this.setPhotosynthesizing(false);
        // this.condition = false;
      }

      const code = genome[this.pc] as GenomeCode;
      // this.energy -= .25;
      const codeCycles = getCyclesPerCode(code);
      numCycles -= codeCycles;
      if (numCycles < 0) {
        break;
      }

      switch (code) {
        case GenomeCode.Photosynthesize:
          this.setPhotosynthesizing(true);
          if (this.unfolded) {
            // this.energy += settings.photoSynthesisEnergy; // * this.numPhotosynthesizeCells;
            // this.energy += settings.photoSynthesisEnergy * this.length;
            // this.energy += settings.photoSynthesisEnergy;// + (this.length - 1) * (settings.photoSynthesisEnergy - settings.turnCost);
          }
          break;

        case GenomeCode.StopPhotosynthesize:
          this.setPhotosynthesizing(false);
          break;

        // case GenomeCode.MoveAndEat:
        //   this.move(settings, true);
        //   this.setPhotosynthesizing(false);
        //   break;

        case GenomeCode.Eat:
          // const orientation = this.orientation;
          // for (let i = 0; i < 4; i++) {
          //   this.orientation = i;
          this.eat(true); //!!(this.pc & 1));
          // }
          // this.orientation = orientation;
          break;


        case GenomeCode.Move:
          this.move(settings);
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
            this.testSeeFood(distance, true);
            this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          }
          break;

        case GenomeCode.TestBlocked:
          this.condition = this.blocked;
          this.blocked = false;
          this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;

        case GenomeCode.TestBitten:
          this.condition = this.bitten;
          this.bitten = false;
          this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;

        case GenomeCode.TestSpawned:
          this.condition = !!this.spawnedCount;
          this.spawnedCount = 0;
          this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;


        case GenomeCode.TestTimer1:
          this.condition = this.timer1 > 0;
          // this.condition = this.timer1 === 0;
          // this.timer1 = -1;
          this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;

        case GenomeCode.TestTimer2:
          this.condition = this.timer2 > 0;
          // this.condition = this.timer2 === 0;
          // this.timer2 = -2;
          this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;

        case GenomeCode.TestUnfolded:
          this.condition = this.unfolded;
          this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;

        case GenomeCode.TestTurn: {
          const turnPhase = (this.pc + 1) * 10;
          this.condition = !!(Math.floor(Globals.turn / turnPhase) & 1);
          this.conditions[(this.conditionHead++) % numConditions] = this.condition;
          break;
        }

        case GenomeCode.IfCondition:
          this.condition = this.conditions[(--this.conditionHead + numConditions) % numConditions];
          if (this.pc !== (genome.length - 1) && !this.condition) {
            this.pc = (this.pc + this.turnDirection + genome.length) % genome.length;
          }
          break;

        case GenomeCode.IfNotCondition:
          this.condition = this.conditions[(--this.conditionHead + numConditions) % numConditions];
          if (this.pc !== (genome.length - 1) && this.condition) {
            this.pc = (this.pc + this.turnDirection + genome.length) % genome.length;
          }
          break;

        case GenomeCode.Restart:
          this.pc = 0;
          this.turnDirection = 1;
          break;

        case GenomeCode.Reverse:
          this.turnDirection = -this.turnDirection;
          break;

      }

      this.pc = (this.pc + this.turnDirection + genome.length) % genome.length;
      numCycles -= codeCycles;
    }
  }


  setPhotosynthesizing(value: boolean) {
    if (value !== !!this.photosynthesizing) {
      this.photosynthesizing = value ? Globals.settings.photosynthesisDuration : 0;
      if (this.length > 1 && this.unfolded) {
        const color = this.photosynthesizing ? this.genomeInfo.colorPhotosynthesizing : this.color;
        const pointToCritterIndex = Globals.pointToCritterIndex;
        for (let i = 0; i < this.length; i++) {
          const pos = this.cellPositions[i];
          const curIndex = pointToCritterIndex[pos];
          if (curIndex !== this.critterIndex) {
            debugger;
          }
          Globals.setPixel(this.cellPositions[i], color, this.critterIndex);
        }
      }
    }
  };

  move(settings: SimulationSettings) {
    this.blocked = false;
    // this.bitten = false;
    const delta = Orientation.deltas[this.orientation];
    const newHead = (this.cellPositions[0] + delta) & 0xffff;

    const destPixel = Globals.pixelArray[newHead];

    this.energy -= settings.moveCost;

    if (destPixel === ColorBlack) {
      const color = this.photosynthesizing ? ColorGreen : this.color;

      const tail = this.cellPositions[this.length - 1];

      const oldCellPos = this.cellPositions.slice();
      // set head
      for (let i = this.length - 1; i > 0; i--) {
        this.cellPositions[i] = this.cellPositions[i - 1];
      }
      this.cellPositions[0] = newHead;

      Globals.setPixel(newHead, color, this.critterIndex);

      if (this.length > 1) {
        this.unfolded = this.cellPositions[this.length - 2] !== this.cellPositions[this.length - 1];
      }

      if (tail !== this.cellPositions[this.length - 1]) {

        Globals.setPixel(tail, ColorBlack);
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
    this.validate();

  }

  get wasEaten() {
    return this.energy <= -1000;
  }

  setEaten() {
    this.energy = -10000;
    for (let i = 0; i < this.length; i++) {
      const index = Globals.pointToCritterIndex[this.cellPositions[i]];

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
    if (!allowCannibalism && critter.genomeInfo === this.genomeInfo) {
      return false;
    }
    if (critter.wasEaten) {
      return false;
    }
    return critter.photosynthesizing || !critter.unfolded;
  }

  eat(allowCannibalism: boolean) {
    const { settings } = Globals;
    // this.setPhotosynthesizing(false);
    const delta = Orientation.deltas[this.orientation];
    const newHead = (this.cellPositions[0] + delta) & 0xffff;

    const destPixel = Globals.pixelArray[newHead];
    this.energy -= settings.eatCost;

    const digestionEfficiency = settings.digestionEfficiencyPercent / 100;

    const hitCritter = Globals.critters[Globals.pointToCritterIndex[newHead]];
    if (hitCritter) {
      hitCritter.validate();
      if (this.canEat(hitCritter, allowCannibalism)) {
        let biteDamage = settings.spawnEnergyPerCell * settings.biteStrength;

        this.energy += Math.min(hitCritter.unfolded ? hitCritter.energy : settings.spawnEnergyPerCell, biteDamage) * digestionEfficiency;
        hitCritter.bitten = true;
        hitCritter.energy -= biteDamage;
        // if (hitCritter.energy <= 0) {
        //   hitCritter.setEaten();
        // }
      }
    } else if (destPixel === ColorGreen) {
      this.energy += settings.spawnEnergyPerCell * digestionEfficiency; // / 2;
      Globals.setPixel(newHead, ColorBlack);
    }
  }


  testSeeFood(sightDistance: number, allowCannibalism: boolean) {
    this.condition = false;
    const delta = Orientation.deltas[this.orientation];


    let point = this.cellPositions[0];
    for (let i = 0; i < sightDistance; i++) {
      point = (point + delta) & 0xffff;
      const hitCritter = Globals.critters[Globals.pointToCritterIndex[point]];
      if (hitCritter) {
        if (this.canEat(hitCritter, allowCannibalism)) {
          this.condition = true;
        }
        break;
      } else {
        const destPixel = Globals.pixelArray[point];
        if (destPixel === ColorGreen) {
          this.condition = true;
          break;
        } else if (destPixel !== ColorBlack) {
          break;
        }

      }

      // if (hitCritter !== this) {
      //   this.condition = true;
      //   if (!allowCannibalism) {
      //     if (hitCritter && hitCritter !== this && this.genomeInfo === hitCritter.genomeInfo) {
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

  canSpawn() {
    return (this.forceSpawn && this.unfolded && this.energy > Globals.settings.spawnEnergyPerCell) || this.energy > this.spawnEnergy;
  }

  get isDead() {
    return this.age > this.maxLifespan || this.energy <= 0;
  }
}