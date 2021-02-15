import { Critter } from '../simulation-code/Critter';

export type WorldDetails = {
  x: number;
  y: number;
  critters: { [index: number]: Critter };
  dots: Array<{ x: number; y: number; color: number }>;
};
