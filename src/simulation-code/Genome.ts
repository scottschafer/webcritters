import { SimulationConstants } from '../common/SimulationConstants';
import { Settings } from './Settings';

export enum GenomeCode {
  Photosynthesize = 'P',
  MoveAndEat = 'M',
  Move = 'm',
  Sleep = 'Z',
  TurnLeft = '<',
  TurnRight = '>',
  OrientUp = 'U',
  OrientDown = 'D',
  OrientRight = 'R',
  OrientLeft = 'L',
};

export enum GenomeConditions {
  ConditionAlways = '0',
  ConditionFacingFood = '1',
  ConditionNotFacingFood = '2',
  ConditionBlocked = '3',
  ConditionNotBlocked = '4',
};

export const PhotosynthesizeGenome = GenomeConditions.ConditionAlways + GenomeCode.Photosynthesize;
export const MoveAndEatGenome = GenomeConditions.ConditionAlways + GenomeCode.MoveAndEat;

enum MutationType {
  insert,
  delete,
  modify
};

function getRandomCode() {
  const conditions = Object.values(GenomeConditions);
  const codes = Object.values(GenomeCode);
  return conditions[Math.floor(Math.random() * conditions.length)]
    + codes[Math.floor(Math.random() * codes.length)];
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
      const position = Math.floor(Math.random() * (genome.length / 2 + 1)) * 2;
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
        const position = 2 * Math.floor(genome.length * Math.random() / 2);
        if (position === 0) {
          return genome.substr(2);
        } else if (position === (genome.length - 2)) {
          return genome.substr(0, genome.length - 2);
        } else {
          return genome.substr(0, position) + genome.substr(position + 2);
        }
      }
      break;
    case MutationType.modify: {
      const position = 2 * Math.floor(genome.length * Math.random() / 2);
      const c = getRandomCode();
      if (position === 0) {
        return c + genome.substr(2);
      } else if (position === (genome.length - 2)) {
        return genome.substr(0, genome.length - 2) + c;
      } else {
        return genome.substr(0, position) + c + genome.substr(position + 2);
      }
    }
  }
  return genome;

}

export function cellLengthFromGenome(genome: string) {
  let result = 0;

  for (let i = 1; i < genome.length; i += 2) {
    switch (genome[i]) {
      case GenomeCode.Move:
      case GenomeCode.MoveAndEat:
      case GenomeCode.Photosynthesize:
      case GenomeCode.Sleep:
        ++result;
    }
  }

  return result;
}
