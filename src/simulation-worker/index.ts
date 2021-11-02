import { expose } from "comlink";
import {
  init,
  takeTurn,
  getSummary,
  updateSettings,
  getDetail,
  getGenealogyReport
} from "../simulation-code/simulation";

const exports = {
  init,
  takeTurn,
  getSummary,
  updateSettings,
  getDetail,
  getGenealogyReport
};
export type SimulationWorker = typeof exports;

expose(exports);