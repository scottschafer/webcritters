
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

  TurnLeft, // = '<',
  TurnRight, // = '>',
  OrientUp, // = 'U',
  OrientDown, // = 'D',
  OrientRight, // = 'R',
  OrientLeft, // = 'L',
  SetTimer1, // = 'x',
  SetTimer2, // = 'y',

  TestSeeFood, // = '0',
  TestSeeRelative, // = '1',
  TestBlocked, // = '2',
  TestBitten, // = '3',
  TestSpawned, // = '4',
  TestTimer1, // = 'xx 5',
  TestTimer2, // = 'xx 6',
  TestLeftSide, // = '5',
  TestTopSide, // = 'xxx 6,
  TestFailed, // = '6'
  TestUnfolded, // = '7',
  TestTurn, // = '8',
  TestTouchingRelative, // = '9',

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
  numCycles: number;
  description: string;
  char: string;
  name: string;
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
    char: 'p',
    disabled: false,
    numCycles: 1,
    name: 'Stop Photosynthesis',
    description: 'Stop Photosynthesis'
  },
  [GenomeCode.Move]: {
    char: 'm',
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
  [GenomeCode.EatOther]: {
    char: 'e',
    disabled: true,
    numCycles: 10,
    name: 'Eat other',
    description: 'Eat other species'
  },
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
    numCycles: 1,
    name: 'Flip',
    description: 'Flip'
  },

  [GenomeCode.TurnLeft]: {
    char: '<',
    numCycles: 1,
    name: 'Turn Left',
    description: 'Turn head 90 degrees to the left'
  },
  [GenomeCode.TurnRight]: {
    char: '>',
    numCycles: 1,
    name: '',
    description: 'Turn head 90 degrees to the right'
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
  // [GenomeCode.SetTimer1]: {
  //   char: 'x',
  //   // disabled: true,
  //   numCycles: 1,
  //   name: '',
  //   description: 'Set timer 1'
  // },
  // [GenomeCode.SetTimer2]: {
  //   char: 'y',
  //   // disabled: true,
  //   numCycles: 1,
  //   name: '',
  //   description: 'Set timer 2'
  // },

  [GenomeCode.TestSeeFood]: {
    char: '0',
    numCycles: 5,
    name: '',
    description: 'Test see food'
  },

  [GenomeCode.TestSeeRelative]: {
    char: '1',
    numCycles: 5,
    name: '',
    description: 'Test see food (ignoring relatives)',
  },

  [GenomeCode.TestBlocked]: {
    char: '2',
    numCycles: 1,
    name: '',
    description: 'Test blocked'
  },
  [GenomeCode.TestBitten]: {
    char: '3',
    disabled: false,
    numCycles: 1,
    name: '',
    description: 'Test bitten'
  },
  [GenomeCode.TestSpawned]: {
    char: '4',
    disabled: false,
    numCycles: 1,
    name: '',
    description: 'Test spawned'
  },
  [GenomeCode.TestLeftSide]: {
    char: '5',
    numCycles: 1,
    name: '',
    description: 'Test on Left Side'
  },
  // [GenomeCode.TestTopSide]: {
  //   char: '6',
  //   numCycles: 1,
  //   name: '',
  //   description: 'Test on Top Side'
  // },
  [GenomeCode.TestFailed]: {
    char: '6',
    numCycles: 0,
    name: '',
    description: 'Test failed'
  },

  // [GenomeCode.TestTimer1]: {
  //   char: '5',
  //   // disabled: true,
  //   numCycles: 1,
  //   name: '',
  //   description: 'Test Timer1'
  // },
  // [GenomeCode.TestTimer2]: {
  //   char: '6',
  //   // disabled: true,
  //   numCycles: 1,
  //   name: '',
  //   description: 'Test Timer2'
  // },
  [GenomeCode.TestUnfolded]: {
    char: '7',
    disabled: false,
    numCycles: 1,
    name: '',
    description: 'Test fully unfolded'
  },
  [GenomeCode.TestTurn]: {
    char: '8',
    numCycles: 1,
    name: '',
    description: 'Test turn'
  },
  [GenomeCode.TestTouchingRelative]: {
    char: '9',
    numCycles: 1,
    name: '',
    description: 'Test head touching relative (same genome)'
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

  [GenomeCode.Reverse]: {
    char: 'r',
    disabled: true,
    numCycles: 0,
    name: '',
    description: 'Reverse'
  },

  [GenomeCode.NextMarker]: {
    char: ']',
    disabled: false,
    numCycles: 0,
    name: '',
    description: 'Next marker'
  },


  [GenomeCode.MarkerA]: {
    char: 'a',
    numCycles: 0,
    name: '',
    description: 'Marker A'
  },

  [GenomeCode.MarkerB]: {
    char: 'b',
    disabled: true,
    numCycles: 0,
    name: '',
    description: 'Marker B'
  },

  [GenomeCode.MarkerC]: {
    char: 'c',
    disabled: true,
    numCycles: 0,
    name: '',
    description: 'Marker C'
  },


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
