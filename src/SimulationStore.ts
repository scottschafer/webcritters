import { SimulationConfig } from './common/SimulationConfig';

import { action, computed, isObservable, makeObservable, observable, runInAction, toJS } from 'mobx';
import { wrap, releaseProxy } from "comlink";
import { worker } from 'cluster';
import { SimulationConstants } from './common/SimulationConstants';
import { CellsData } from './common/CellsData';
import { SharedData } from './common/SharedData';
import { Settings } from './simulation-code/Settings';
import { WorldSummary } from './common/WorldSummary';

const workerAPI = (() => {
  const worker = new Worker("./simulation-worker", {
    name: "simulation-worker",
    type: "module"
  });
  const workerApi = wrap<import("./simulation-worker").SimulationWorker>(worker);
  return workerApi;
})();

class SimulationStore {
  sharedArrayBufferUint8Array: Uint8Array;
  @observable.ref settings = new Settings();
  @observable.ref summary: WorldSummary = null;

  lastTurnTime = 0;
  runningAtFullSpeed = false;

  sharedData: SharedData = {
    canvasBuffer: new SharedArrayBuffer(SimulationConstants.worldDim * SimulationConstants.worldDim * 4),
    // cellsData: {
    //   x_u16: new SharedArrayBuffer(SimulationConstants.maxCells * 2),
    //   y_u16: new SharedArrayBuffer(SimulationConstants.maxCells * 2),
    //   colors_u32: new SharedArrayBuffer(SimulationConstants.maxCells * 4),
    //   nextCell_u16: new SharedArrayBuffer(SimulationConstants.maxCells * 2)
    // },
    // crittersData: {
    //   firstCellIndex_u16: new SharedArrayBuffer(SimulationConstants.maxCritters * 2),
    //   genomeIndex_u16: new SharedArrayBuffer(SimulationConstants.maxCritters * 2),
    //   energy_u8: new SharedArrayBuffer(SimulationConstants.maxCritters),
    //   orientation_u8: new SharedArrayBuffer(SimulationConstants.maxCritters),
    // }
  };

  started = false;

  @observable turn: number = 0;
  @observable config: SimulationConfig = {
    width: 256,
    height: 256
  }

  @action.bound setSettings(value: Settings) {
    this.settings = value;
    workerAPI.updateSettings(value);
  }

  @computed get delay() {
    if (!this.settings.speed) {
      return -1;
    }
    let delay = (SimulationConstants.maxSpeed - this.settings.speed) / SimulationConstants.maxSpeed;
    return delay * delay * 100;
  }


  constructor() {
    makeObservable(this);
    this.sharedArrayBufferUint8Array = new Uint8Array(this.sharedData.canvasBuffer);

    console.log('isObservable(this.settings.lifespanPerCell) = ' + isObservable(this.settings.lifespanPerCell));
  }

  startSimulation() {
    if (this.started) {
      return;
    }
    this.started = true;
    console.log('startSimulation');
    workerAPI.init(this.sharedData, toJS(this.settings));

    this.runTurnLoop();
  }

  @action setTurn(turn: number) {
    this.turn = turn;
  }

  @action setSummary(value: WorldSummary) {
    this.summary = value;
  }

  takeTurn = () => {
    workerAPI.takeTurn().then(result => {
      this.setTurn(result);
      this.runTurnLoop();

      if (!(result % 100)) {
        workerAPI.getSummary().then(result => {
          this.setSummary(result);
        });
      }

      if (!this.delay) {
        this.runningAtFullSpeed = true;
        this.takeTurn();
      } else {
        this.runningAtFullSpeed = false;
      }
    });

  }

  runTurnLoop = () => {

    window.setTimeout(this.runTurnLoop, 0);

    if (!this.delay) {
      if (!this.runningAtFullSpeed) {
        this.runningAtFullSpeed = true;
        this.takeTurn();
      }
    } else {

      if (this.delay > 0) {
        const curTime = new Date().getTime();
        if ((curTime - this.lastTurnTime) >= this.delay) {
          this.lastTurnTime = curTime;
          this.takeTurn();
        }
      }
    }
  }

};

export const simulationStore = new SimulationStore;
