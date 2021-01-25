export class SimulationConstants {
  static readonly minSpeed = 0;
  static readonly maxSpeed = 10;
  static readonly initialSpeed = 8;
  static readonly worldDim = 256;

  static readonly maxGenomeLength = 50;
  static readonly maxGenomeAllocation = 1000;
  static readonly maxCritterLength = 10;
  static readonly maxCells = SimulationConstants.worldDim * SimulationConstants.worldDim / 8;
  static readonly maxCritters = SimulationConstants.maxCells;

}