import { observable } from 'mobx';
import { SimulationConstants } from '../common/SimulationConstants';

export class SimulationSettings {

  followSelection = false;
  speed = SimulationConstants.initialSpeed;
  barriers = false;

  photosynthesisDuration = 5;
  lifespanPerCell = 500;
  spawnEnergyPerCell = 500;
  mutationRate = 25;

  turnCost = 1;
  baseInstructionCost = 0.1;
  photoSynthesisEnergy = 2.5;
  moveCost = 15;
  eatCost = 1;
  digestionEfficiencyPercent = 80;
  biteStrength = .3;
  sleepCount = 10;

  timer1Length = 10;
  timer2Length = 20;

  sightDistance = 32;

  limitCellLength = 5;

  addFoodCount = 200; //100;

  showPreview = true;
  sleepAfterSpawnCount = 0; // 25;

  allowCannibalism = true;

  sleepTurnEnergyCost = .1;
  deathRays = 0;

  magnifierSize = 32;
  magnification = 8;
}