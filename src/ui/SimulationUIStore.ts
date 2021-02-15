import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { FollowingDetails } from '../common/FollowingDetails';
import { SharedData } from '../common/SharedData';
import { SimulationConfig } from '../common/SimulationConfig';
import { SimulationConstants } from '../common/SimulationConstants';
import { WorldDetails } from '../common/WorldDetails';
import { WorldSummary } from '../common/WorldSummary';
import { SimulationSettings } from '../simulation-code/SimulationSettings';
import { workerAPI } from '../simulation-worker/workerAPI';


class SimulationUIStore {
  sharedArrayBufferUint8Array: Uint8Array;
  @observable.ref settings = new SimulationSettings();
  @observable.ref summary: WorldSummary = null;
  @observable.ref details: WorldDetails = null;

  @observable.ref following: FollowingDetails = new FollowingDetails();

  lastTurnTime = 0;
  lastGetDetailTime = 0;
  runningAtFullSpeed = false;
  isTakingTurn = false;

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

  @action.bound setSettings(value: SimulationSettings) {
    this.settings = value;

    workerAPI.updateSettings(value);
  }

  @computed get delay() {
    let result = 0;
    if (!this.settings.speed) {
      result = -1;
    } else {
      let delay = (SimulationConstants.maxSpeed - this.settings.speed) / SimulationConstants.maxSpeed;
      result = delay * delay * 100;
    }

    if (!SimulationConstants.useWorker) {
      result = Math.max(50, result);
    }
    return result;
  }


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

    this.runTurnLoop();
  }

  @action setTurn(turn: number) {
    this.turn = turn;
  }

  @action setSummary(value: WorldSummary) {
    this.summary = value;
  }

  @action setDetail(value: WorldDetails) {
    this.details = value;
  }

  takeTurn = () => {

    this.isTakingTurn = true;
    workerAPI.takeTurn().then(result => {
      this.isTakingTurn = false;
      this.setTurn(result);
      this.runTurnLoop();

      if (this.settings.showPreview && !(result % 100)) {
        workerAPI.getSummary().then(result => {
          this.setSummary(result);
        });
      }

      const currentTime = new Date().getTime();
      if (this.settings.showPreview && (currentTime - this.lastGetDetailTime) > (1000 / 20)) {
        this.lastGetDetailTime = currentTime;
        workerAPI.getDetail(this.following, 32).then(result => {
          this.setDetail(result);
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

    if (this.isTakingTurn) {
      return;
    }
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

export const simulationStore = new SimulationUIStore;
