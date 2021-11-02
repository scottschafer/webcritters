
export class SimulationConstants {
  // static readonly useWorker = true;
  static readonly useWorker = true;
  static readonly validate = false;


  static readonly allowDeathBirth = true;
  static readonly insertEvolvedCritters = false ? {
    // 'mEmEF': 100,
    'EPme<0': 1,
    // 'EP9<mPFmR0': 1000,
    // 'EP09<mm': 1,
    // '4Zm0P1E7E0>E69]2<6aE<70mEp': 1,
    // '4ZrEEE>E6e<E<0mmE': 1,
    // '4ZH0PE0>E2E<0mEp': 1,
    // '?Z0x3PE53<mEHmp': 1,
    // 'Z0mE>': 0
  } : {};

  static readonly initialPhotosynthesizeCritterCount = 500;
  // static readonly allowDeathBirth = true;
  // static readonly insertEvolvedCritters = false ? {
  //   'P4Zm0P1E7E0>E69]2<6aE<70mEp': 100,
  //   '4ZrEEE>E6e<E<0mmE': 1,
  //   '4ZH0PE0>E2E<0mEp': 1,
  //   '?Z0x3PE53<mEHmp': 1,
  //   'Z0mE>': 0
  // } : {};

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