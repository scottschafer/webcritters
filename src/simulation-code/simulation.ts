import { SharedData } from '../common/SharedData';
import { Settings } from './Settings';
import { World } from './World';

let gWorld: World = new World();

export function init(sharedData: SharedData, settings: Settings) {
  gWorld.init(sharedData, settings);
}

export function takeTurn() {
  return gWorld.takeTurn();
}

export function getSummary() {
  return gWorld.getSummary();
}