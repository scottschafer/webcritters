import { SharedData } from '../common/SharedData';
import { World } from './World';

let gWorld: World = new World();;

export function init(sharedData: SharedData) {
  gWorld.init(sharedData);
}

export function turnCrank() {
  return gWorld.takeTurn();
}
