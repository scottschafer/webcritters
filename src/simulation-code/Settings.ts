import { observable } from 'mobx';
import { SimulationConstants } from '../common/SimulationConstants';

export class Settings {

  @observable speed = SimulationConstants.initialSpeed;
  @observable lifespanPerCell = 1000;
  @observable spawnEnergyPerCell = 200;
  @observable mutationRate = 25;

  @observable turnCost = 1;
  @observable photoSynthesisEnergy = 2;
  @observable moveCost = 4;
  @observable eatCost = 4;
  @observable digestionEfficiency = .75;//.2;
  @observable sleepCount = 50;

  @observable timer1Length = 20;
  @observable timer2Length = 50;

  @observable cannibalism = false;
  @observable sightDistance = 30;

  @observable limitCellLength = 10;
}