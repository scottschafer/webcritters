import { SimulationConstants } from '../common/SimulationConstants';
import { Colors } from './Colors';
import { cellLengthFromGenome, GenomeCode } from './Genome';
import { genomeRepository } from './GenomeRepository';
import { Orientation } from './Orientation';
import { World } from './World';

export class Critter {
  genomeIndex: number = -1;
  genome: string;
  energy: number = -1;
  orientation: number;
  length: number;
  age: number;
  cellPosX = new Array<number>(SimulationConstants.maxCritterLength);
  cellPosY = new Array<number>(SimulationConstants.maxCritterLength);
  colors = new Array<number>(SimulationConstants.maxCritterLength);
  maxLifespan: number;
  spawnEnergy: number;
  photosynthesizing: boolean = false;
  pc: number;
  unfolded: boolean = false;


  init(world: World, genomeIndex: number, x: number, y: number) {
    this.genomeIndex = genomeIndex;
    this.genome = genomeRepository.indexToGenome[genomeIndex];
    const length = this.length = cellLengthFromGenome(this.genome);
    this.unfolded = length === 1;

    this.maxLifespan = Math.floor(length * world.settings.lifespanPerCell * (Math.random() / 2 + .5));
    this.spawnEnergy = world.settings.spawnEnergyPerCell * length;
    this.energy = this.spawnEnergy / 2;
    this.age = 0;
    this.pc = 0;

    this.orientation = Math.floor(4 * Math.random());

    for (let i = 0; i < length; i++) {
      this.cellPosX[i] = x;
      this.cellPosY[i] = y;
      this.colors[i] = (length === 1) ? Colors[1] : Colors[2];
    }
  }

  takeTurn(world: World, critterIndex: number) {

    this.energy -= world.settings.turnCost;
    ++this.age;

    const setPhotosynthesizing = (value: boolean) => {
      if (value !== this.photosynthesizing) {
        const color = this.photosynthesizing ? Colors[1] : this.colors[0];
        for (let i = 0; i < this.length; i++) {
          world.setPixel(this.cellPosX[i], this.cellPosY[i], color, critterIndex);
        }
        this.photosynthesizing = value;
      }
    };


    if (this.photosynthesizing) {
      // this.energy += world.settings.photoSynthesisEnergy;
    }

    const condition = this.genome[this.pc];
    const code = this.genome[this.pc + 1];
    switch (code) {
      case GenomeCode.Photosynthesize:
        if (this.unfolded) {
          this.energy += world.settings.photoSynthesisEnergy;
          setPhotosynthesizing(true);
        }
        break;

      case GenomeCode.Move:
        this.move(false, world, critterIndex);
        setPhotosynthesizing(false);
        break;


      case GenomeCode.MoveAndEat:
        this.move(true, world, critterIndex);
        setPhotosynthesizing(false);
        break;
    }
    this.pc = (this.pc + 2) % this.genome.length;
  }

  move(andEat: boolean, world: World, critterIndex: number) {
    this.energy -= world.settings.moveCost;
    const delta = Orientation.deltas[this.orientation];
    const newHeadX = this.cellPosX[0] + delta[0];
    const newHeadY = this.cellPosY[0] + delta[1];

    if (newHeadX >= 0 && newHeadX >= 0 && newHeadX < SimulationConstants.worldDim && newHeadY < SimulationConstants.worldDim) {
      const destPixel = world.pixelArray[newHeadY * SimulationConstants.worldDim + newHeadX];
      if (destPixel === Colors[0]) {

        const color = this.photosynthesizing ? Colors[1] : this.colors[0];


        const tailX = this.cellPosX[this.length - 1];
        const tailY = this.cellPosY[this.length - 1];

        for (let i = 1; i < this.length; i++) {
          this.cellPosX[i] = this.cellPosX[i - 1];
          this.cellPosY[i] = this.cellPosY[i - 1];
        }

        // set head
        this.cellPosX[0] = newHeadX;
        this.cellPosY[0] = newHeadY;
        world.setPixel(newHeadX, newHeadY, color, critterIndex);

        if (tailX !== this.cellPosX[this.length - 1] || tailY !== this.cellPosY[this.length - 1]) {
          world.setPixel(tailX, tailY, Colors[0]);
          this.unfolded = true;
        }
      } else {
        const hitCritter = world.getCritterAtPos(newHeadX, newHeadY);
        if (hitCritter && hitCritter.photosynthesizing) {
          this.energy += hitCritter.energy * world.settings.digestionEfficiency;
          hitCritter.energy = -100;
        }
      }
    }
  }

  canSpawn(world: World) {
    return this.energy > this.spawnEnergy;
  }

  get isDead() {
    return this.age > this.maxLifespan || this.energy <= 0;
  }
}