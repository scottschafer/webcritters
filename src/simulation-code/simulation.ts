import { FollowingDetails } from '../common/FollowingDetails';
import { SharedData } from '../common/SharedData';
import { SimulationSettings } from './SimulationSettings';
import { World } from './World';

let gWorld: World = new World();

export function init(sharedData: SharedData, settings: SimulationSettings) {
  gWorld.init(sharedData, settings);
}

export function takeTurn() {
  return gWorld.takeTurn();
}

export function getSummary() {
  const result = gWorld.getSummary();
  return result;
}

export function getDetail(follow: FollowingDetails, dimension = 32) {
  const result = gWorld.getDetail(follow, dimension);
  return result;
}

export function updateSettings(settings: SimulationSettings) {
  gWorld.updateSettings(settings);
}