import { SimulationConstants } from '../common/SimulationConstants';
import { GenomeColors } from './Colors';
import { Globals } from './Globals';
import { SimulationSettings } from './SimulationSettings';

export enum GenomeCode {
  Photosynthesize = 'P',
  StopPhotosynthesize = 'p',
  // MoveAndEat = 'M',
  Move = 'm',
  Eat = 'E',
  Sleep = 'Z',
  Hypermode = 'H',
  Spawn = 'S',

  TurnLeft = '<',
  TurnRight = '>',
  OrientUp = 'U',
  OrientDown = 'D',
  OrientRight = 'R',
  OrientLeft = 'L',
  SetTimer1 = 'a',
  SetTimer2 = 'b',

  TestSeeFood = '0',
  TestSeeFoodX2 = '1',
  TestBlocked = '2',
  TestBitten = '3',
  TestSpawned = '4',
  TestTimer1 = '5',
  TestTimer2 = '6',
  TestUnfolded = '7',
  TestTurn = '8',

  IfCondition = '?',
  IfNotCondition = '!',

  Restart = '*',
  Reverse = 'r'
};


export const GenomeCodeInfo: { [key in GenomeCode]: {
  numCycles: number;
  description: string;
  name: string;
  disabled?: boolean;
} } = {
  [GenomeCode.Photosynthesize]: {
    numCycles: 10,
    name: 'Photosynthesize',
    description: 'Gain energy'
  },
  [GenomeCode.StopPhotosynthesize]: {
    numCycles: 1,
    name: 'Stop Photosynthesis',
    description: 'Gain energy'
  },
  [GenomeCode.Move]: {
    numCycles: 5,
    name: 'Move',
    description: ''
  },
  [GenomeCode.Eat]: {
    numCycles: 5,
    name: 'Eat',
    description: ''
  },
  [GenomeCode.Sleep]: {
    numCycles: 10,
    name: 'Sleep',
    description: '',
    disabled: false
  },
  [GenomeCode.Hypermode]: {
    numCycles: 1,
    name: 'Hypermode',
    description: ''
  },

  [GenomeCode.Spawn]: {
    numCycles: 1,
    name: 'Spawn',
    description: ''
  },

  [GenomeCode.TurnLeft]: {
    numCycles: 1,
    name: 'Turn Left',
    description: ''
  },
  [GenomeCode.TurnRight]: {
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.OrientUp]: {
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.OrientDown]: {
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.OrientRight]: {
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.OrientLeft]: {
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.SetTimer1]: {
    disabled: false,
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.SetTimer2]: {
    disabled: false,
    numCycles: 1,
    name: '',
    description: ''
  },

  [GenomeCode.TestSeeFood]: {
    numCycles: 5,
    name: '',
    description: ''
  },

  [GenomeCode.TestSeeFoodX2]: {
    numCycles: 5,
    name: '',
    description: '',
    disabled: true
  },

  [GenomeCode.TestBlocked]: {
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.TestBitten]: {
    disabled: false,
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.TestSpawned]: {
    disabled: false,
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.TestTimer1]: {
    disabled: false,
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.TestTimer2]: {
    disabled: false,
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.TestUnfolded]: {
    disabled: false,
    numCycles: 1,
    name: '',
    description: ''
  },
  [GenomeCode.TestTurn]: {
    numCycles: 1,
    name: '',
    description: ''
  },

  [GenomeCode.IfCondition]: {
    numCycles: 0,
    name: '',
    description: ''
  },
  [GenomeCode.IfNotCondition]: {
    numCycles: 0,
    name: '',
    description: ''
  },

  [GenomeCode.Restart]: {
    numCycles: 0,
    name: '',
    description: ''
  },

  [GenomeCode.Reverse]: {
    numCycles: 0,
    name: '',
    description: ''
  }
};

export const getCyclesPerCode = (code: GenomeCode) => {
  return 10;
  // if (!GenomeCodeInfo[code].numCycles) {
  // return 10;
  //   return 0;
  // }
  // return 10;
  return GenomeCodeInfo[code].numCycles;
};

export const PhotosynthesizeGenome = GenomeCode.Photosynthesize;
export const MoveAndEatGenome = GenomeCode.Move + GenomeCode.Eat;

enum MutationType {
  insert,
  delete,
  modify
};

function getRandomCode() {
  const codes = Object.values(GenomeCode).filter(code => (GenomeCodeInfo[code].disabled !== true));
  return codes[Math.floor(Math.random() * codes.length)];
};

export function reproduceGenome(genome: string) {

  const { settings } = Globals;

  if (!SimulationConstants.allowDeathBirth) {
    return genome;
  }
  if (Math.random() > (settings.mutationRate / 100)) {
    // no mutation
    return genome;
  }

  // mutation!
  let mutationType = Math.floor(Math.random() * 3);
  switch (mutationType) {
    case MutationType.insert: {
      if (genome.length >= SimulationConstants.maxGenomeLength) {
        return genome;
      }
      const position = Math.floor(Math.random() * genome.length + 1);
      const c = getRandomCode();
      if (position === 0) {
        return c + genome;
      } else if (position > genome.length) {
        return genome + c;
      } else {
        return genome.substr(0, position) + c + genome.substr(position);
      }
    }

    case MutationType.delete:
      if (genome.length > 2) {
        const position = Math.floor(Math.random() * genome.length);
        if (position === 0) {
          return genome.substr(1);
        } else if (position === (genome.length - 1)) {
          return genome.substr(0, genome.length - 1);
        } else {
          return genome.substr(0, position) + genome.substr(position + 1);
        }
      }
      break;
    case MutationType.modify: {
      const position = Math.floor(Math.random() * genome.length);
      const c = getRandomCode();
      if (position === 0) {
        return c + genome.substr(1);
      } else if (position === (genome.length - 1)) {
        return genome.substr(0, genome.length - 1) + c;
      } else {
        return genome.substr(0, position) + c + genome.substr(position + 1);
      }
    }
  }
  return genome;

}

export function cellLengthFromGenome(genome: string) {
  const { settings } = Globals;
  return Math.min(settings.limitCellLength, genome.length);
  // let result = 0;

  // for (let i = 0; i < genome.length; ++i) {
  //   switch (genome[i]) {
  //     case GenomeCode.Move:
  //     case GenomeCode.MoveAndEat:
  //     case GenomeCode.Photosynthesize:
  //     case GenomeCode.Sleep:
  //       ++result;
  //   }
  // }

  // return Math.min(1, result);
}
