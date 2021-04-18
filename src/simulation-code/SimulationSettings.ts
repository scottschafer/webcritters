import { observable } from 'mobx';
import { SimulationConstants } from '../common/SimulationConstants';

export class SimulationSettings {

  /* @observable */speed = SimulationConstants.initialSpeed;
  /* @observable */barriers = false;

  /* @observable */photosynthesisDuration = 5;
  /* @observable */lifespanPerCell = 300;
  /* @observable */spawnEnergyPerCell = 500;
  /* @observable */mutationRate = 25;

  /* @observable */turnCost = .1;
  /* @observable */baseInstructionCost = .1;
  /* @observable */photoSynthesisEnergy = 2.5;
  /* @observable */moveCost = 5;
  /* @observable */eatCost = 1;
  /* @observable */digestionEfficiencyPercent = 75;
  /* @observable */biteStrength = 3;
  /* @observable */sleepCount = 5;

  /* @observable */timer1Length = 10;
  /* @observable */timer2Length = 20;

  /* @observable */sightDistance = 128;

  /* @observable */limitCellLength = 5;

  /* @observable */addFoodCount = 500; //100;

  /* @observable */showPreview = true;
  /* @observable */sleepAfterSpawnCount = 5; // 25;

}