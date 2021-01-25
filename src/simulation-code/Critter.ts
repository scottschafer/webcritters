import { World } from './World';

export class Critter {
  static takeTurn(world: World, critterIndex: number) {
    world.critters.energy[critterIndex] += 10;
  }

  static getSpawnEnergy(world: World, critterIndex: number) {
    return 200;
  }

  static canSpawn(world: World, critterIndex: number) {
    return true;
    return world.critters.energy[critterIndex] > Critter.getSpawnEnergy(world, critterIndex);
  }

  static isDead(world: World, critterIndex: number) {
    return false;
  }
}