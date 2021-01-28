import { SimulationConstants } from '../common/SimulationConstants';
import { Colors } from './Colors';
import { cellLengthFromGenome, GenomeCode } from './Genome';
import { genomeRepository } from './GenomeRepository';
import { Globals } from './Globals';
import { Orientation } from './Orientation';
import { World } from './World';
import { Settings } from './Settings';
import { runInThisContext } from 'vm';

// const commandHandlers: { [code:string] : (critter: Critter, settings: Settings) => void } =
// {
//   (GenomeCode.Photosynthesize): (critter: Critter, settings: Settings) => {

//   }  

// };


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
  pc: number;
  unfolded: boolean = false;
  color: number;
  cellPositions = new Array<number>(SimulationConstants.maxCritterLength);

  constructor(public readonly critterIndex: number) {
  }

  init(settings: Settings, genomeIndex: number, point: number) {
    this.genomeIndex = genomeIndex;
    this.genome = genomeRepository.indexToGenome[genomeIndex];
    const length = this.length = cellLengthFromGenome(this.genome);
    this.unfolded = length === 1;
    this.color = (length === 1 && this.genome[1] === GenomeCode.Photosynthesize) ? Colors[1] : Colors[2];


    this.maxLifespan = Math.floor(length * settings.lifespanPerCell * (Math.random() / 2 + .5));
    this.spawnEnergy = settings.spawnEnergyPerCell * length;
    this.energy = this.spawnEnergy / 2;
    this.age = 0;
    this.pc = 0;

    this.orientation = Math.floor(4 * Math.random());

    for (let i = 0; i < length; i++) {
      this.cellPositions[i] = point;
    }
  }

  takeTurn(settings: Settings) {

    this.energy -= settings.turnCost;
    ++this.age;

    const setPhotosynthesizing = (value: boolean) => {
      if (value !== this.photosynthesizing) {
        this.photosynthesizing = value;
        const color = this.photosynthesizing ? Colors[1] : this.color;
        for (let i = 0; i < this.length; i++) {
          Globals.setPixel(this.cellPositions[i], color, this.critterIndex);
        }
      }
    };

    if (this.photosynthesizing) {
      // this.energy += world.settings.photoSynthesisEnergy;
    }

    const condition = this.genome[this.pc];
    const code = this.genome[this.pc + 1];
    switch (code) {
      case GenomeCode.Photosynthesize:
        setPhotosynthesizing(true);
        if (this.unfolded) {
          this.energy += settings.photoSynthesisEnergy;
        }
        break;

      case GenomeCode.Move:
        setPhotosynthesizing(false);
        this.move(settings, false);
        break;

      case GenomeCode.MoveAndEat:
        this.move(settings, true);
        setPhotosynthesizing(false);
        break;
    }
    this.pc = (this.pc + 2) % this.genome.length;
  }

  move(settings: Settings, andEat: boolean) {
    this.energy -= settings.moveCost;
    const delta = Orientation.deltas[this.orientation];
    const newHead = (this.cellPositions[0] + delta) & 0xffff;

    const destPixel = Globals.pixelArray[newHead];
    if (destPixel === Colors[0]) {

      const color = this.photosynthesizing ? Colors[1] : this.color;

      const tail = this.cellPositions[this.length - 1];

      for (let i = 1; i < this.length; i++) {
        this.cellPositions[i] = this.cellPositions[i - 1];
      }

      // set head
      this.cellPositions[0] = newHead;

      Globals.setPixel(newHead, this.color, this.critterIndex);

      if (tail !== this.cellPositions[this.length - 1]) {
        Globals.setPixel(tail, Colors[0], 0);
        this.unfolded = true;
      }
    } else {
      const hitCritter = Globals.critters[Globals.pointToCritterIndex[newHead]];
      if (hitCritter && hitCritter.photosynthesizing) {
        this.energy += hitCritter.energy * settings.digestionEfficiency;
        hitCritter.energy = -100;
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