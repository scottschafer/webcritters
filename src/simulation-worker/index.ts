import { expose } from "comlink";
import {
  init,
  takeTurn,
  getSummary,
  updateSettings,
  getDetail
} from "../simulation-code/simulation";

const exports = {
  init,
  takeTurn,
  getSummary,
  updateSettings,
  getDetail
};
export type SimulationWorker = typeof exports;

expose(exports);