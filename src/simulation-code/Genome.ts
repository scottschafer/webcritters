import { SimulationConstants } from '../common/SimulationConstants';
import { Settings } from './Settings';

export enum GenomeCode {
  Photosynthesize = 'P',
  MoveAndEat = 'M',
  Move = 'm',
  Sleep = 'Z',
  Hypermode = 'H',

  TurnLeft = '<',
  TurnRight = '>',
  OrientUp = 'U',
  OrientDown = 'D',
  OrientRight = 'R',
  OrientLeft = 'L',
  SetTimer1 = 'a',
  SetTimer2 = 'b',

  TestSeeFood = '0',
  TestBlocked = '1',
  TestHighEnergy = '2',
  TestLowEnergy = '3',
  TestTimer1 = '4',
  TestTimer2 = '5',

  IfCondition = '?',
  IfNotCondition = '!',

  Restart = '*'
};

export const getCyclesPerCode = (code: GenomeCode) => {
  switch (code) {
    case GenomeCode.IfCondition:
    case GenomeCode.IfNotCondition:
      return 0;

    case GenomeCode.TestSeeFood:
    case GenomeCode.TestBlocked:
    case GenomeCode.TestHighEnergy:
    case GenomeCode.TestLowEnergy:
    case GenomeCode.TestTimer1:
    case GenomeCode.TestTimer2:
      return 1;

    case GenomeCode.Move:
    case GenomeCode.MoveAndEat:
    case GenomeCode.Photosynthesize:
    case GenomeCode.Sleep:
      return 7;
  }
  return 1;

};

export const PhotosynthesizeGenome = GenomeCode.Photosynthesize;
export const MoveAndEatGenome = GenomeCode.MoveAndEat;

enum MutationType {
  insert,
  delete,
  modify
};

function getRandomCode() {
  const codes = Object.values(GenomeCode);
  return codes[Math.floor(Math.random() * codes.length)];
};

export function reproduceGenome(genome: string, settings: Settings) {

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

export function cellLengthFromGenome(genome: string, settings: Settings) {
  return Math.min(settings.limitCellLength, genome.length);
  let result = 0;

  for (let i = 0; i < genome.length; ++i) {
    switch (genome[i]) {
      case GenomeCode.Move:
      case GenomeCode.MoveAndEat:
      case GenomeCode.Photosynthesize:
      case GenomeCode.Sleep:
        ++result;
    }
  }

  return Math.min(1, result);
}
