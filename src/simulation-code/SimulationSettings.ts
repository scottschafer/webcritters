import { observable } from 'mobx';
import { SimulationConstants } from '../common/SimulationConstants';

export class SimulationSettings {

  @observable speed = SimulationConstants.initialSpeed;
  @observable barriers = false;

  @observable photosynthesisDuration = 5;
  @observable lifespanPerCell = 1000;
  @observable spawnEnergyPerCell = 1000;
  @observable mutationRate = 10;

  @observable turnCost = 1;
  @observable baseInstructionCost = .25;
  @observable photoSynthesisEnergy = 3;
  @observable moveCost = 15;
  @observable eatCost = 1;
  @observable digestionEfficiencyPercent = 100;
  @observable biteStrength = 3;
  @observable sleepCount = 1;

  @observable timer1Length = 10;
  @observable timer2Length = 20;

  @observable sightDistance = 20;

  @observable limitCellLength = 4;

  @observable addFoodCount = 200; //100;

  @observable showPreview = true;
  @observable sleepAfterSpawnCount = 25;

}