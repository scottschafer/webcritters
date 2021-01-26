import { expose } from "comlink";
import {
  // takeALongTimeToDoSomething,
  // takeALongTimeToAddTwoNumbers,
  init,
  takeTurn,
  getSummary
} from "../simulation-code/simulation";

const exports = {
  // takeALongTimeToDoSomething,
  // takeALongTimeToAddTwoNumbers,
  init,
  takeTurn,
  getSummary
};
export type SimulationWorker = typeof exports;

expose(exports);

// import { expose } from "comlink";
// import {
//   startSimulation,
//   turnCrank
// } from "../simulation-code/simulation";

// const exports = {
//   startSimulation,
//   turnCrank
// };
// export type SimulationWorker = typeof exports;

// expose(exports);