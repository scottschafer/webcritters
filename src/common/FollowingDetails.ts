import { observable } from 'mobx';
import { SimulationConstants } from './SimulationConstants';

export class FollowingDetails {
  // for when not following a critter
  @observable x: number = (SimulationConstants.worldDim - SimulationConstants.detailsDim) / 2;
  @observable y: number = (SimulationConstants.worldDim - SimulationConstants.detailsDim) / 2;

  @observable followingGenome: string = '';
  @observable followingIndex: number = -1;

}