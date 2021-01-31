import { SimulationConstants } from '../common/SimulationConstants';
import { ColorBlack, ColorGreen } from './Colors';
import { cellLengthFromGenome, GenomeCode, getCyclesPerCode } from './Genome';
import { genomeRepository } from './GenomeRepository';
import { Globals } from './Globals';
import { Orientation } from './Orientation';
import { Settings } from './Settings';


export class Critter {
  genomeIndex: number = -1;
  genome: string;
  energy: number = -1;
  orientation: number;
  length: number;
  age: number;
  maxLifespan: number;
  spawnEnergy: number;
  photosynthesizing: boolean = false;
  unfolded: boolean = false;
  color: number;
  cellPositions = new Array<number>(SimulationConstants.maxCritterLength);
  numPhotosynthesizeCells = 0;

  pc: number;
  hypermode: boolean;
  condition: boolean;
  timer1: number;
  timer2: number;
  sleepCount: number;
  blocked: boolean;
  lastTailPoint: number;


  constructor(public readonly critterIndex: number) {
  }

  init(settings: Settings, genomeIndex: number, point: number) {
    this.genomeIndex = genomeIndex;
    this.genome = genomeRepository.indexToGenome[genomeIndex];
    const length = this.length = cellLengthFromGenome(this.genome, settings);
    this.unfolded = length === 1;
    this.color = (length === 1 && this.genome[0] === GenomeCode.Photosynthesize) ? ColorGreen :
      genomeRepository.indexToColor[genomeIndex];

    this.numPhotosynthesizeCells = 0;
    for (let i = 0; i < this.genome.length; i++) {
      if (this.genome[i] === GenomeCode.Photosynthesize) {
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

    Object.assign(this, {
      pc: 0,
      hypermode: false,
      condition: false,
      timer1: -1,
      timer2: -1,
      sleepCount: 0,
      blocked: false,
      photosynthesizing: false,
    });
  }

  takeTurn(settings: Settings) {

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


    let numCycles = 10;
    this.energy -= settings.turnCost;
    ++this.age;
    if (this.hypermode) {
      this.energy -= settings.turnCost;
      ++this.age;
      numCycles *= 2;
    }

    let maxExecution = this.genome.length;

    while (!this.sleepCount && maxExecution-- > 0) {
      const code = this.genome[this.pc] as GenomeCode;
      const codeCycles = getCyclesPerCode(code);
      numCycles -= codeCycles;
      if (numCycles < 0) {
        break;
      }

      switch (code) {
        case GenomeCode.Photosynthesize:
          this.setPhotosynthesizing(true);
          if (this.unfolded) {
            this.energy += settings.photoSynthesisEnergy; // * this.numPhotosynthesizeCells;
            // this.energy += settings.photoSynthesisEnergy * this.length;
            // this.energy += settings.photoSynthesisEnergy;// + (this.length - 1) * (settings.photoSynthesisEnergy - settings.turnCost);
          }
          break;

        case GenomeCode.MoveAndEat:
          this.move(settings, true);
          this.setPhotosynthesizing(false);
          break;

        case GenomeCode.Move:
          this.move(settings, false);
          this.setPhotosynthesizing(false);
          break;

        case GenomeCode.Sleep:
          this.sleepCount = settings.sleepCount;
          numCycles = 0;
          break;

        case GenomeCode.Hypermode:
          this.hypermode = true;
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
            let distance = settings.sightDistance;
            while (this.pc < (this.genome.length - 2) && this.genome[(this.pc + 1) % this.genome.length] === GenomeCode.TestSeeFood) {
              distance += settings.sightDistance;
              this.pc = (this.pc + 1) % this.genome.length;
            }
            this.testSeeFood(settings, distance);
          }
          break;

        case GenomeCode.TestBlocked:
          this.condition = this.blocked;
          break;


        case GenomeCode.TestTimer1:
          this.condition = this.timer1 === 0;
          this.timer1 = -1;
          break;

        case GenomeCode.TestTimer2:
          this.condition = this.timer2 === 0;
          this.timer2 = -2;
          break;


        case GenomeCode.TestHighEnergy:
          this.condition = (this.energy > this.spawnEnergy * .75);
          break;

        case GenomeCode.TestLowEnergy:
          this.condition = (this.energy < this.spawnEnergy * .25);
          break;

        case GenomeCode.IfCondition:
          if (this.pc !== (this.genome.length - 1) && !this.condition) {
            this.pc = (this.pc + 1) % this.genome.length;
          }
          break;

        case GenomeCode.IfNotCondition:
          if (this.pc !== (this.genome.length - 1) && this.condition) {
            this.pc = (this.pc + 1) % this.genome.length;
          }
          break;

        case GenomeCode.Restart:
          this.pc = 0;
          return;
          break;
      }

      this.pc = (this.pc + 1) % this.genome.length;
      if (this.pc === 0) {
        this.hypermode = false;
        // this.condition = false;
      }
      numCycles -= codeCycles;
    }

    // if (this.photosynthesizing && this.unfolded) {
    //   this.energy += settings.photoSynthesisEnergy + (this.length - 1) * (settings.photoSynthesisEnergy - settings.turnCost);
    // }

  }


  setPhotosynthesizing(value: boolean) {
    if (value !== this.photosynthesizing) {
      this.photosynthesizing = value;
      const color = this.photosynthesizing ? ColorGreen : this.color;
      for (let i = 0; i < this.length; i++) {
        Globals.setPixel(this.cellPositions[i], color, this.critterIndex);
      }
    }
  };

  move(settings: Settings, andEat: boolean) {
    this.blocked = false;
    const delta = Orientation.deltas[this.orientation];
    const newHead = (this.cellPositions[0] + delta) & 0xffff;

    const destPixel = Globals.pixelArray[newHead];

    this.energy -= settings.moveCost;
    if (andEat) {
      this.energy -= settings.eatCost;
    }

    if (destPixel === ColorBlack) {
      const color = this.photosynthesizing ? ColorGreen : this.color;

      const tail = this.cellPositions[this.length - 1];

      // set head
      this.cellPositions[0] = newHead;
      for (let i = this.length - 1; i > 0; i--) {
        this.cellPositions[i] = this.cellPositions[i - 1];
      }

      Globals.setPixel(newHead, this.color, this.critterIndex);

      if (tail !== this.cellPositions[this.length - 1]) {

        Globals.setPixel(tail, ColorBlack, 0);
        this.lastTailPoint = tail;
        this.unfolded = true;
      }
    } else {
      this.blocked = true;
      if (andEat) {
        if (destPixel === ColorGreen) {
          const hitCritter = Globals.critters[Globals.pointToCritterIndex[newHead]];
          if (hitCritter) {
            if (hitCritter.photosynthesizing) {
              this.blocked = false;
              let biteDamage = settings.spawnEnergyPerCell;

              this.energy += Math.min(hitCritter.energy, biteDamage * settings.digestionEfficiency);
              hitCritter.energy -= biteDamage;
              if (hitCritter.energy <= 0) {
                hitCritter.energy = -1000; //-hitCritter.spawnEnergy / 2;
              }
            }
          } else {
            this.energy += settings.spawnEnergyPerCell * settings.digestionEfficiency; // / 2;
            Globals.setPixel(newHead, ColorBlack, 0);
          }
        }
      }
    }
  }

  testSeeFood(settings: Settings, sightDistance?: number) {
    this.condition = false;
    const delta = Orientation.deltas[this.orientation];

    if (!sightDistance) {
      sightDistance = settings.sightDistance;
    }

    let point = this.cellPositions[0];
    for (let i = 0; i < sightDistance; i++) {
      point = (point + delta) & 0xffff;
      const destPixel = Globals.pixelArray[point];
      if (destPixel === ColorGreen) {
        this.condition = true;
        if (!settings.cannibalism) {
          const hitCritter = Globals.critters[Globals.pointToCritterIndex[point]];
          if (hitCritter && this.genomeIndex === hitCritter.genomeIndex) {
            this.condition = false;
          }
        }
        break;
      } else if (destPixel !== ColorBlack) {
        break;
      }
    }
  }

  canSpawn() {
    return this.energy > this.spawnEnergy;
  }

  get isDead() {
    return this.age > this.maxLifespan || this.energy <= 0;
  }
}