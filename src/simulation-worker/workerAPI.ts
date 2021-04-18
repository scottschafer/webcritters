
import { wrap } from 'comlink';
import { SharedData } from '../common/SharedData';
import { WorldSummary } from '../common/WorldSummary';
import { SimulationSettings } from '../simulation-code/SimulationSettings';
import {
  init,
  takeTurn,
  getSummary,
  updateSettings,
  getDetail
} from "../simulation-code/simulation";
import { SimulationConstants } from '../common/SimulationConstants';
import { WorldDetails } from '../common/WorldDetails';
import { FollowingDetails } from '../common/FollowingDetails';


interface WorkerAPI {
  init(sharedData: SharedData, settings: SimulationSettings);
  updateSettings(settings: SimulationSettings);
  takeTurn(numTurns: number): Promise<number>;
  getSummary(): Promise<WorldSummary>;
  getSummary(): Promise<WorldSummary>;
  getDetail(follow: FollowingDetails, dimension: number): Promise<WorldDetails>;
}

export const workerAPI: WorkerAPI =

  (() => {
    if (SimulationConstants.useWorker) {
      const worker = new Worker("./", {
        name: "simulation-worker",
        type: "module"
      });
      const workerApi = wrap<import(".").SimulationWorker>(worker);
      return workerApi;
    } else {
      const takeTurnReturnPromise = (numTurns: number = 1) => { return new Promise<number>(resolve => { resolve(takeTurn(numTurns)) }) };
      const getSummaryReturnPromise = () => { return new Promise<WorldSummary>(resolve => { resolve(getSummary()) }) };
      const getDetailReturnPromise = (follow: FollowingDetails, dimension = 32) => {
        return new Promise<WorldDetails>(resolve => { resolve(getDetail(follow, dimension)) })
      };
      return {
        init,
        updateSettings,
        takeTurn: takeTurnReturnPromise,
        getSummary: getSummaryReturnPromise,
        getDetail: getDetailReturnPromise
      };
    }
  })();
