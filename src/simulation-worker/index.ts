import { expose } from "comlink";
import {
  init,
  takeTurn,
  getSummary,
  updateSettings
} from "../simulation-code/simulation";

const exports = {
  init,
  takeTurn,
  getSummary,
  updateSettings
};
export type SimulationWorker = typeof exports;

expose(exports);