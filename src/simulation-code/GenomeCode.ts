
export enum GenomeCode {
  Photosynthesize, // = 'P',
  StopPhotosynthesize, // = 'p',
  Move, // = 'M',
  Contract, // C
  Eat, // = 'E',
  EatOther, // = 'e',
  Sleep, // = 'Z',
  Hypermode, // = 'H',
  Spawn, // = 'S',
  Flip, // = 'F',
  PickupBarrier,
  DropBarrier,

  LimitLength,

  IncrementCounter1,
  IncrementCounter2,
  ResetCounters,

  PushBarrierForward,
  PushBarrierLeft,
  PushBarrierRight,
  PullBarrier,
  SwapRightBarrier,
  SwapLeftBarrier,

  TurnLeft, // = '<',
  TurnRight, // = '>',
  OrientUp, // = 'U',
  OrientDown, // = 'D',
  OrientRight, // = 'R',
  OrientLeft, // = 'L',
  // SetTimer1, // = 'x',
  // SetTimer2, // = 'y',

  TestSeeFood,
  TestSeeRelative,
  TestBlocked,
  TestBlockedBySelf,
  TestBlockedByOtherCritter,
  TestBlockedByRelatedCritter,
  TestBlockedByBarrier,
  TestBlockedByFood,
  TestBlockedByRelatedFood,
  TestCounter1GreaterThanCounter2,

  TestSpawned,
  TestBitten,
  TestTurn,
  TestCoinFlip,
  TestFailed,
  TestUnfolded,
  TestTouchingRelative, // = '9',
  TestCarryingBarrier,
  TestNearbyRelative0,
  TestNearbyRelative1,
  TestNearbyRelativeMany,
  TestSucceeded,

  IfCondition, // = '?',
  IfNotCondition, // = '!',
  Else, // = '!',
  And, // = '&'

  Restart, // = '*',
  Reverse, // = 'r',
  NextMarker, // = ']',

  MarkerA, // = 'a',
  MarkerB, // = 'b',
  MarkerC, // = 'c',

  GoToA, // = 'A',
  GoToB, // = 'B',
  GoToC, // = 'C',
};

export type GenomeCodeInfo = {
  numCycles?: number;
  description: string;
  details?: string;
  char: string;
  name?: string;
  disabled?: boolean;
  // energyCostSuccess
}
export const GenomeCodeToInfoMap: {
  [key: number]: GenomeCodeInfo
} = {
  [GenomeCode.Photosynthesize]: {
    char: 'P',
    numCycles: 10,
    name: 'Photosynthesize',
    description: 'Photosynthesize',
    details: `Turns a tail cell into a green photosynthesis cell (up to "Max photosynthesis cells"), Critters gain energy every turn for each green cell.`
  },
  [GenomeCode.StopPhotosynthesize]: {
    char: 'N',
    disabled: false,
    numCycles: 1,
    name: 'Stop Photosynthesis',
    description: 'Stop Photosynthesis',
    details: `Turns off all photosynthesis cells.`
  },
  [GenomeCode.Move]: {
    char: 'M',
    numCycles: 10,
    name: 'Move',
    description: 'Move forward one square',
    details: 'Cannot move over food, barriers, other critters or itself. If fails, sets failure code. Only uses energy if moved.'
  },
  [GenomeCode.Contract]: {
    char: 'C',
    numCycles: 10,
    name: 'Contract',
    description: 'Contracts head into body back towards tail',
    details: 'Fails if already fully contracted'
  },
  [GenomeCode.Eat]: {
    char: 'E',
    numCycles: 10,
    name: 'Eat',
    description: 'Eat in front of head',
    details: 'If head is pointing at and touching green dot, gain energy. If green dot belongs to critter, then the target critter loses Spawn Energy times Bite Strength. The recipient receives that energy times Digestion Efficiency.'
  },
  [GenomeCode.Sleep]: {
    char: 'Z',
    numCycles: 10,
    name: 'Sleep',
    description: 'Sleep, enter low-energy state',
    disabled: false,
    details: 'Becomes inactive for Sleep count turns, using a fraction of Turn Cost'
  },
  [GenomeCode.Hypermode]: {
    char: 'H',
    numCycles: 1,
    name: 'Hypermode',
    description: 'Enter hypermode',
    details: 'Turn on Hypermode, allowing two moves per turn. Turns off after a successful move.'
  },

  [GenomeCode.Spawn]: {
    disabled: true,
    char: 'S',
    numCycles: 1,
    name: 'Spawn',
    description: 'Force spawning'
  },


  [GenomeCode.Flip]: {
    char: 'F',
    disabled: true,
    numCycles: 10,
    name: 'Flip',
    description: 'Flip'
  },

  [GenomeCode.PickupBarrier]: {
    char: '{',
    numCycles: 10,
    description: 'Pick up barrier',
    disabled: true
  },

  [GenomeCode.DropBarrier]: {
    char: '}',
    numCycles: 10,
    description: 'Drop barrier',
    disabled: true
  },

  [GenomeCode.PullBarrier]: {
    char: ')',
    numCycles: 10,
    description: 'Pull barrier',
    disabled: false,    
    details: 'If head facing barrier, contract head towards body, pulling barrier into previous head position - otherwise set failure.'
  },

  [GenomeCode.PushBarrierForward]: {
    char: '0',
    numCycles: 10,
    description: 'Push barrier forward',
    disabled: false,
    details: 'If head facing barrier, push forward (if can be pushed) and move - otherwise set failure.'
  },

  [GenomeCode.PushBarrierLeft]: {
    char: '1',
    numCycles: 10,
    description: 'Push barrier left',
    disabled: false,
    details: 'If head facing barrier, push to the left of head (if can be pushed) and move - otherwise set failure.'
  },

  [GenomeCode.PushBarrierRight]: {
    char: '2',
    numCycles: 10,
    description: 'Push barrier right',
    disabled: false,
    details: 'If head facing barrier, push to the left of head (if can be pushed) and move - otherwise set failure.'
  },
  [GenomeCode.SwapRightBarrier]: {
    char: '3',
    numCycles: 10,
    description: 'Swap right barrier',
    disabled: true
  },
  [GenomeCode.SwapLeftBarrier]: {
    char: '4',
    numCycles: 10,
    description: 'Swap left barrier',
    disabled: true
  },
  [GenomeCode.LimitLength]: {
    char: '^',
    numCycles: 0,
    description: 'Limit critters length',
    disabled: false,
    details: `Limit this critter's cell length to this instruction position (1 cell if first in genome, etc)`
  },
  [GenomeCode.IncrementCounter1]: {
    char: 'W',
    numCycles: 0,
    description: 'Increment Counter 1',
  },
  [GenomeCode.IncrementCounter2]: {
    char: 'X',
    numCycles: 0,
    description: 'Increment Counter 2',
  },
  [GenomeCode.ResetCounters]: {
    char: 'Y',
    numCycles: 0,
    description: 'Reset counters',
  },

  [GenomeCode.TurnLeft]: {
    char: '<',
    numCycles: 1,
    name: 'Turn Left',
    description: 'Turn head 90 degrees left'
  },
  [GenomeCode.TurnRight]: {
    char: '>',
    numCycles: 1,
    name: '',
    description: 'Turn head 90 degrees right'
  },
  [GenomeCode.OrientUp]: {
    char: 'U',
    numCycles: 1,
    name: '',
    description: 'Turn head up'
  },
  [GenomeCode.OrientDown]: {
    char: 'D',
    numCycles: 1,
    name: '',
    description: 'Turn head down'
  },
  [GenomeCode.OrientRight]: {
    char: 'R',
    numCycles: 1,
    name: '',
    description: 'Turn head right'
  },
  [GenomeCode.OrientLeft]: {
    char: 'L',
    numCycles: 1,
    name: '',
    description: 'Turn head left'
  },

  [GenomeCode.TestSeeFood]: {
    char: 'a',
    description: 'If see food',
    details: 'Look a number of cells (Sight distance) in the head orientation. If the first non-black pixel is a green dot, the test passes and execution continues. When a test fails, skip over any instructions linked by And (&) or up to an Else (!) instruction.'
  },
  [GenomeCode.TestSeeRelative]: {
    char: 'b',
    description: 'If see relative',
    details: 'Test passes if facing critter with same genome.'
  },
  [GenomeCode.TestBlocked]: {
    char: 'c',
    description: 'If blocked',
    details: 'Test passes if the last attempt to move was blocked for any reason.'
  },
  [GenomeCode.TestBlockedBySelf]: {
    char: 'd',
    description: 'If blocked by self',
    details: 'Test passes if the last attempt to move was blocked by the critter attempting to move over self.'
  },
  [GenomeCode.TestBlockedByOtherCritter]: {
    char: 'e',
    description: 'If blocked by other',
    details: 'Test passes if the last attempt to move was blocked a critter with a different genome.'

  },
  [GenomeCode.TestBlockedByRelatedCritter]: {
    char: 'f',
    description: 'If blocked by relation',
    details: 'Test passes if the last attempt to move was blocked a critter with the same genome.'
  },
  [GenomeCode.TestBlockedByBarrier]: {
    char: 'g',
    description: 'If blocked by barrier',
    details: 'Test passes if the last attempt to move was blocked by a barrier.'
  },
  [GenomeCode.TestBlockedByFood]: {
    char: 'h',
    description: 'If blocked by food',
    details: 'Test passes if the last attempt to move was blocked by food (excluding critters with same genome).'
  },
  [GenomeCode.TestBlockedByRelatedFood]: {
    char: 'i',
    description: 'If blocked by related food',
    details: 'Test passes if the last attempt to move was blocked a photosynthesizing critter with same genome.'
  },
  [GenomeCode.TestSpawned]: {
    char: 'j',
    description: 'If spawned',
    details: 'Test passes if critter has spawned since last test.'
  },
  [GenomeCode.TestBitten]: {
    char: 'k',
    description: 'If bitten',
    details: 'Test passes if critter has been bitten since last test.'
  },
  [GenomeCode.TestTurn]: {
    char: 'l',
    description: 'If global turn phase',
    details: 'Test passes according to this test: Math.floor(globals.turn / (pc * 5 + 5)) & 1'
  },
  [GenomeCode.TestCoinFlip]: {
    char: 'm',
    description: 'If coin flip',
    details: 'Test passes 50% of the time, randomly'
  },
  [GenomeCode.TestFailed]: {
    char: 'n',
    description: 'If failed',
    details: 'Test passes if the last operation (Move, Eat, etc) failed.'
  },
  [GenomeCode.TestUnfolded]: {
    char: 'o',
    description: 'If fully unfolded',
    details: 'Test passes if all cells have unique positions.'
  },
  [GenomeCode.TestTouchingRelative]: {
    char: 'p',
    description: 'If head touching relative',
    details: 'Test passes if head touching different critter with same genome.'
  },
  [GenomeCode.TestCarryingBarrier]: {
    char: 'q',
    description: 'If carrying barrier',
    disabled: true
  },
  [GenomeCode.TestNearbyRelative0]: {
    char: 'r',
    description: 'If 0 relatives nearby',
    details: 'Test passes if no critters with same genome are nearby.'
  },
  [GenomeCode.TestNearbyRelative1]: {
    char: 's',
    description: 'If 1 relative nearby',
    details: 'Test passes if 1 critter with same genome is nearby.'
  },
  [GenomeCode.TestNearbyRelativeMany]: {
    char: 't',
    description: 'If many relatives nearby',
    details: 'Test passes if > 1 critters with same genome is nearby.'
  },
  [GenomeCode.TestCounter1GreaterThanCounter2]: {
    char: 'u',
    description: 'If counter1 > counter 2'
  },
  [GenomeCode.TestSucceeded]: {
    char: 'v',
    description: 'If succeeded',
    details: 'Opposite of "If failed"'

  },
  

  [GenomeCode.IfCondition]: {
    char: '?',
    numCycles: 0,
    disabled: true,
    name: '',
    description: 'If'
  },
  // [GenomeCode.IfNotCondition]: {
  //   char: '!',
  //   disabled: true,
  //   numCycles: 0,
  //   name: '',
  //   description: 'If not'
  // },
  [GenomeCode.Else]: {
    char: '!',
    numCycles: 0,
    name: '',
    description: 'Else',
    details: 'When a test fails, skip to Else if present'
  },
  [GenomeCode.And]: {
    char: '&',
    numCycles: 0,
    name: '',
    description: 'And',
    details: 'When a test fails, skip over any instructions linked by And'
  },

  [GenomeCode.Restart]: {
    char: '*',
    numCycles: 0,
    name: '',
    description: 'Restart',
    details: 'Move Program Counter to start'

  },

  // [GenomeCode.Reverse]: {
  //   char: 'r',
  //   disabled: true,
  //   numCycles: 0,
  //   name: '',
  //   description: 'Reverse'
  // },

  [GenomeCode.NextMarker]: {
    char: ']',
    numCycles: 0,
    name: '',
    description: 'Next marker',
    details: 'Move Program Counter to Restart or Marker'
  },


  [GenomeCode.MarkerA]: {
    char: 'A',
    numCycles: 0,
    name: '',
    description: 'Marker A',
    details: 'Does nothing (but "Go to A" or "Next Marker" moves execution here)'
  },

  // [GenomeCode.MarkerB]: {
  //   char: 'b',
  //   disabled: true,
  //   numCycles: 0,
  //   name: '',
  //   description: 'Marker B'
  // },

  // [GenomeCode.MarkerC]: {
  //   char: 'c',
  //   disabled: true,
  //   numCycles: 0,
  //   name: '',
  //   description: 'Marker C'
  // },


  [GenomeCode.GoToA]: {
    char: '@',
    disabled: false,
    numCycles: 0,
    name: '',
    description: 'Go to A',
    details: 'Move execution to Marker A'
  },

  [GenomeCode.GoToB]: {
    char: 'B',
    disabled: true,
    numCycles: 0,
    name: '',
    description: 'Go to B'
  },

  // [GenomeCode.GoToC]: {
  //   char: 'C',
  //   disabled: true,
  //   numCycles: 0,
  //   name: '',
  //   description: 'Go to C'
  // },
};

export const PhotosynthesizeGenome = GenomeCodeToInfoMap[GenomeCode.Photosynthesize].char;

export const GenomeCharToCode: { [char: string]: GenomeCode } = {};
export const GenomeCodeToChar: { [code: number]: string } = {};
export const GenomeCodeToInfo: { [code: number]: GenomeCodeInfo } = {};

Object.keys(GenomeCodeToInfoMap).map(num => parseInt(num, 10)).forEach((code: GenomeCode) => {
  const info = GenomeCodeToInfoMap[code];
  const char = GenomeCodeToInfoMap[code].char;
  if (GenomeCharToCode[char]) {
    debugger;
  }
  GenomeCharToCode[char] = code;
  GenomeCodeToInfo[code] = info;
});

// export const genomeCodeToString = (code: GenomeCode) => {
//   return GenomeCodeInfo[code].char;
// }

// export const getCyclesPerCode = (code: GenomeCode) => {
//   return GenomeCodeInfo[code].numCycles;
// };

// export const MoveAndEatGenome = GenomeCode.Move + GenomeCode.Eat;
