import { observable } from 'mobx';
import { SimulationConstants } from '../common/SimulationConstants';

export class SimulationSettings {

  /* @observable */speed = SimulationConstants.initialSpeed;
  /* @observable */barriers = false;

  /* @observable */photosynthesisDuration = 5;
  /* @observable */lifespanPerCell = 500;
  /* @observable */spawnEnergyPerCell = 500;
  /* @observable */mutationRate = 25;

  /* @observable */turnCost = 1;
  /* @observable */baseInstructionCost = 0.1;
  /* @observable */photoSynthesisEnergy = 2.5;
  /* @observable */moveCost = 15;
  /* @observable */eatCost = 1;
  /* @observable */digestionEfficiencyPercent = 80;
  /* @observable */biteStrength = .3;
  /* @observable */sleepCount = 10;

  /* @observable */timer1Length = 10;
  /* @observable */timer2Length = 20;

  /* @observable */sightDistance = 32;

  /* @observable */limitCellLength = 5;

  /* @observable */addFoodCount = 200; //100;

  /* @observable */showPreview = true;
  /* @observable */sleepAfterSpawnCount = 0; // 25;

  allowCannibalism = true;

  sleepTurnEnergyCost = .1;
  deathRays = 0;
}