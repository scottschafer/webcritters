export class SimulationConstants {
  static readonly minSpeed = 0;
  static readonly maxSpeed = 11;
  static readonly initialSpeed = 11;
  static readonly worldDim = 256;
  static readonly totalPixels = SimulationConstants.worldDim * SimulationConstants.worldDim;

  static readonly maxGenomeLength = 50;
  static readonly maxGenomeAllocation = 1000;
  static readonly maxCritterLength = 10;
  // static readonly maxCells = SimulationConstants.worldDim * SimulationConstants.worldDim;
  static readonly maxCritters = SimulationConstants.totalPixels - 1;
}