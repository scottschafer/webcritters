
export enum GenomeCode {
  Photosynthesize, // = 'P',
  StopPhotosynthesize, // = 'p',
  Move, // = 'm',
  Eat, // = 'E',
  EatOther, // = 'e',
  Sleep, // = 'Z',
  Hypermode, // = 'H',
  Spawn, // = 'S',
  Flip, // = 'F',
  PickupBarrier,
  DropBarrier,

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

  TestSpawned,
  TestBitten,
  TestTurn,
  TestCoinFlip,
  TestFailed, // = '6'
  TestUnfolded, // = '7',
  TestTouchingRelative, // = '9',
  TestCarryingBarrier,
  TestNearbyRelative0,
  TestNearbyRelative1,
  TestNearbyRelativeMany,

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
  char: string;
  name?: string;
  disabled?: boolean;
}
export const GenomeCodeToInfoMap: {
  [key: number]: GenomeCodeInfo
} = {
  [GenomeCode.Photosynthesize]: {
    char: 'P',
    numCycles: 10,
    name: 'Photosynthesize',
    description: 'Photosynthesize'
  },
  [GenomeCode.StopPhotosynthesize]: {
    char: 'N',
    disabled: false,
    numCycles: 1,
    name: 'Stop Photosynthesis',
    description: 'Stop Photosynthesis'
  },
  [GenomeCode.Move]: {
    char: 'M',
    numCycles: 10,
    name: 'Move',
    description: 'Move forward one square'
  },
  [GenomeCode.Eat]: {
    char: 'E',
    numCycles: 10,
    name: 'Eat',
    description: 'Eat in front of head'
  },
  // [GenomeCode.EatOther]: {
  //   char: 'e',
  //   disabled: true,
  //   numCycles: 10,
  //   name: 'Eat other',
  //   description: 'Eat other species'
  // },
  [GenomeCode.Sleep]: {
    char: 'Z',
    numCycles: 10,
    name: 'Sleep',
    description: 'Sleep, enter low-energy state',
    disabled: false
  },
  [GenomeCode.Hypermode]: {
    char: 'H',
    numCycles: 1,
    name: 'Hypermode',
    description: 'Enter hypermode'
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
    disabled: true
  },

  [GenomeCode.PushBarrierForward]: {
    char: '0',
    numCycles: 10,
    description: 'Push barrier forward',
    disabled: false
  },

  [GenomeCode.PushBarrierLeft]: {
    char: '1',
    numCycles: 10,
    description: 'Push barrier left',
    disabled: false
  },

  [GenomeCode.PushBarrierRight]: {
    char: '2',
    numCycles: 10,
    description: 'Push barrier right',
    disabled: false
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
    description: 'If see food'
  },
  [GenomeCode.TestSeeRelative]: {
    char: 'b',
    description: 'If see (unrelated) food',
  },
  [GenomeCode.TestBlocked]: {
    char: 'c',
    description: 'If blocked'
  },
  [GenomeCode.TestBlockedBySelf]: {
    char: 'd',
    description: 'If blocked by self'
  },
  [GenomeCode.TestBlockedByOtherCritter]: {
    char: 'e',
    description: 'If blocked by other'
  },
  [GenomeCode.TestBlockedByRelatedCritter]: {
    char: 'f',
    description: 'If blocked by relation'
  },
  [GenomeCode.TestBlockedByBarrier]: {
    char: 'g',
    description: 'If blocked by barrier'
  },
  [GenomeCode.TestBlockedByFood]: {
    char: 'h',
    description: 'If blocked by food'
  },
  [GenomeCode.TestBlockedByRelatedFood]: {
    char: 'i',
    description: 'If blocked by related food'
  },
  [GenomeCode.TestSpawned]: {
    char: 'j',
    description: 'If spawned'
  },
  [GenomeCode.TestBitten]: {
    char: 'k',
    description: 'If bitten'
  },
  [GenomeCode.TestTurn]: {
    char: 'l',
    description: 'If turn'
  },
  [GenomeCode.TestCoinFlip]: {
    char: 'm',
    description: 'If coin flip'
  },
  [GenomeCode.TestFailed]: {
    char: 'n',
    description: 'If failed'
  },
  [GenomeCode.TestUnfolded]: {
    char: 'o',
    description: 'If fully unfolded'
  },
  [GenomeCode.TestTouchingRelative]: {
    char: 'p',
    description: 'If head touching relative'
  },
  [GenomeCode.TestCarryingBarrier]: {
    char: 'q',
    description: 'If carrying barrier'
  },
  [GenomeCode.TestNearbyRelative0]: {
    char: 'r',
    description: 'If 0 relatives nearby'
  },
  [GenomeCode.TestNearbyRelative1]: {
    char: 's',
    description: 'If 1 relative nearby'
  },
  [GenomeCode.TestNearbyRelativeMany]: {
    char: 't',
    description: 'If many relatives nearby'
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
    description: 'Else'
  },
  [GenomeCode.And]: {
    char: '&',
    numCycles: 0,
    name: '',
    description: 'And'
  },

  [GenomeCode.Restart]: {
    char: '*',
    numCycles: 0,
    name: '',
    description: 'Restart'
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
    disabled: false,
    numCycles: 0,
    name: '',
    description: 'Next marker'
  },


  // [GenomeCode.MarkerA]: {
  //   char: 'a',
  //   numCycles: 0,
  //   name: '',
  //   description: 'Marker A'
  // },

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
    char: 'A',
    disabled: false,
    numCycles: 0,
    name: '',
    description: 'Go to A'
  },

  [GenomeCode.GoToB]: {
    char: 'B',
    disabled: true,
    numCycles: 0,
    name: '',
    description: 'Go to B'
  },

  [GenomeCode.GoToC]: {
    char: 'C',
    disabled: true,
    numCycles: 0,
    name: '',
    description: 'Go to C'
  },
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
