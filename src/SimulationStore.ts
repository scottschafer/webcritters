import { SimulationConfig } from './common/SimulationConfig';

import { action, computed, makeObservable, observable, runInAction, toJS } from 'mobx';
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
  @observable settings: Settings = new Settings();
  @observable.ref summary: WorldSummary = null;

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

  @observable speed: number = SimulationConstants.initialSpeed;
  @observable turn: number = 0;
  @observable config: SimulationConfig = {
    width: 256,
    height: 256
  }

  @action.bound setSpeed(value: number | { target: { value: number } }) {
    let oldSpeed = this.speed;
    if (typeof value === 'object') {
      value = value.target.value;
    }
    this.speed = value;

    if (!oldSpeed && this.speed) {
      this.takeTurn();
    }
  }

  @computed get delay() {
    if (!this.speed) {
      return -1;
    }
    let delay = (SimulationConstants.maxSpeed - this.speed) / SimulationConstants.maxSpeed * 50;
    return delay * delay;
  }


  // private workerApi: any; //SimulationWorker;

  constructor() {
    makeObservable(this);
    this.sharedArrayBufferUint8Array = new Uint8Array(this.sharedData.canvasBuffer);


  }

  startSimulation() {
    if (this.started) {
      return;
    }
    this.started = true;
    console.log('startSimulation');
    workerAPI.init(this.sharedData, toJS(this.settings));

    this.takeTurn();
  }

  @action setTurn(turn: number) {
    this.turn = turn;
  }

  @action.bound takeTurn() {
    workerAPI.takeTurn().then(result => {
      // console.log(`turn crank #${result}`);
      this.setTurn(result);
      if (this.delay) {
        if (this.delay > 0) {
          setTimeout(this.takeTurn, this.delay);
        }
      } else {
        this.takeTurn();
      }

      if (!(result % 100)) {
        workerAPI.getSummary().then(result => {
          this.summary = result;
        });
      }
    });
  }
};

export const simulationStore = new SimulationStore;
