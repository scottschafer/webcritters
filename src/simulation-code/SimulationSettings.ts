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
  baseInstructionCost = 0.2;
  photoSynthesisEnergy = 2.5;
  moveCost = 10;
  eatCost = 1;
  digestionEfficiencyPercent = 75;
  biteStrength = .5;
  sleepCount = 10;

  timer1Length = 10;
  timer2Length = 20;

  sightDistance = 64;

  limitCellLength = 10;

  addFoodCount = 50;

  showPreview = true;
  sleepAfterSpawnCount = 0; // 25;

  allowCannibalism = true;

  sleepTurnEnergyCost = .2;
  deathRays = 0;

  magnifierSize = 32;
  magnification = 8;

  sleepWhenCarryingBarrier = 0;

  preventMovingBarriers = true;

  maxPhotosynthesizeCells = 3;
}