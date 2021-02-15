import { GenomeCode } from '../simulation-code/Genome';

export class SimulationConstants {
  static readonly useWorker = true;

  static readonly allowDeathBirth = true;
  static readonly insertEvolvedCritter = false ?
    //'Em>'
    'Em2?>Zm82!m'
    // GenomeCode.TurnLeft + GenomeCode.Eat

    // (GenomeCode.TestSeeFood + GenomeCode.IfCondition + GenomeCode.Move + GenomeCode.Eat + GenomeCode.IfNotCondition + GenomeCode.TurnLeft)
    // (GenomeCode.OrientUp + GenomeCode.Move + GenomeCode.Move + GenomeCode.Eat + GenomeCode.OrientDown + GenomeCode.Move + GenomeCode.Move + GenomeCode.Eat)
    : null;

  static readonly minSpeed = 0;
  static readonly maxSpeed = 11;
  static readonly initialSpeed = 11;
  static readonly worldDim = 256;
  static readonly detailsDim = 32;
  static readonly totalPixels = SimulationConstants.worldDim * SimulationConstants.worldDim;

  static readonly maxGenomeLength = 50;
  static readonly maxGenomeAllocation = 1000;
  static readonly maxCritterLength = 10;
  // static readonly maxCells = SimulationConstants.worldDim * SimulationConstants.worldDim;
  static readonly maxCritters = SimulationConstants.totalPixels - 1;
}