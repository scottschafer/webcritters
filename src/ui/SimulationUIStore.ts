import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { FollowingDetails } from '../common/FollowingDetails';
import { GenealogyReport } from '../common/GenealogyReport';
import { SimulationConfig } from '../common/SimulationConfig';
import { SimulationConstants } from '../common/SimulationConstants';
import { WorldDetails } from '../common/WorldDetails';
import { WorldSummary } from '../common/WorldSummary';
import { persistence } from '../simulation-code/Persistence';
import { SimulationSettings } from '../simulation-code/SimulationSettings';
import { World } from '../simulation-code/World';
import { decodePoint } from '../simulation-code/Orientation';

// import { this.world } from '../simulation-worker/this.world';


class SimulationUIStore {
  // sharedArrayBufferUint8Array: Uint8Array;
  @observable.ref settings = new SimulationSettings();
  @observable.ref summary: WorldSummary = null;
  @observable.ref genealogyReport: GenealogyReport = null;
  @observable.ref details: WorldDetails = null;

  @observable.ref following: FollowingDetails = new FollowingDetails();

  @observable selectedGenome: string;
  @observable selectedGenomeIndex: number;

  lastTurnTime = 0;
  lastGetDetailTime = 0;
  lastGetSummaryTurn = 0;
  lastGetGenealogyTurn = 0;
  runningAtFullSpeed = false;
  isTakingTurn = false;
  world: World;


  started = false;

  @observable turn: number = 0;
  @observable config: SimulationConfig = {
    width: 256,
    height: 256
  }
  @observable tooltipsShown: number = 0;

  @action.bound handleShowTooltip() {
    ++this.tooltipsShown;
    console.log(`handleShowTooltip; tooltipsShown = ${this.tooltipsShown}`);
  }

  @action.bound handleHideTooltip() {
    --this.tooltipsShown;
    console.log(`handleHideTooltip: tooltipsShown = ${this.tooltipsShown}`);
  }

  @action.bound setSettings(value: SimulationSettings) {
    const oldValue = JSON.parse(JSON.stringify(this.settings))
    this.settings = value;

    this.world.updateSettings(oldValue);
  }

  @computed get delay() {
    let result = 0;
    if (!this.settings.speed || this.tooltipsShown) {
      result = -1;
    } else {
      let delay = (SimulationConstants.maxSpeed - this.settings.speed) / SimulationConstants.maxSpeed;
      result = delay * delay * delay * 100;
      // if (!SimulationConstants.useWorker) {
      result = Math.max(1, result);
      // }
    }

    return result;
  }


  constructor() {
    makeObservable(this);
    // this.sharedArrayBufferUint8Array = new Uint8Array(this.world.canvasBuffer);
    setTimeout(() => {
      persistence.load()
      this.startSimulation()
    })
  }

  startSimulation() {
    if (this.started) {
      return;
    }
    this.world = new World()
    this.world.reset();
    this.started = true;
    console.log('startSimulation');
    // this.world.init(this.sharedData, toJS(this.settings));

    this.runTurnLoop();
  }

  @action setTurn(turn: number) {
    this.turn = turn;
  }

  @action setSummary(value: WorldSummary) {
    this.summary = value;
  }

  @action setGenealogyReport(genealogyReport: GenealogyReport) {
    this.genealogyReport = genealogyReport;
  }

  @action setDetail(value: WorldDetails) {
    this.details = value;
  }

  @action.bound handleSelectGenome(genome: string) {
    this.selectedGenome = genome;
  }

  takeTurn = () => {

    const { settings } = this;
    this.isTakingTurn = true;
    this.lastTurnTime = new Date().getTime();
    const turnsToTake = (this.settings.speed === 11) ? 10 : 1

    let selectedCritter = null;
    let selectedCritterGenome = null
    if (this.settings.followSelection && this.following.followingIndex >= 0) {
      selectedCritter = this.world.critters[this.following.followingIndex];
      selectedCritterGenome = selectedCritter?.genome;
      if (selectedCritterGenome?.asString.includes('M') || selectedCritterGenome?.asString.includes('m')) {
        const headPoint = decodePoint(selectedCritter.cellPositions[0]);
        this.following.x = headPoint.x - settings.magnifierSize / 2;
        this.following.y = headPoint.y - settings.magnifierSize / 2;
      }
    }
    const turn = this.world.takeTurn(turnsToTake); //.then(result => {
    if (this.settings.followSelection) {
      if (selectedCritter) {
        if (selectedCritter.isDead || this.selectedGenome !== selectedCritter.genome?.asString) {
          selectedCritter = null;
        }
      }
      if (!selectedCritter) {
        let followIndex = -1;
        let maxEnergy = -1;
        this.world.critters.forEach((critter, index) => {
          if (!critter.isDead && critter.genome.asString === this.selectedGenome) {
            if (critter.energy > maxEnergy) {
              maxEnergy = critter.energy;
              followIndex = index;
              selectedCritterGenome = critter.genome
            }
          }
        })
        if (followIndex >= 0) {
          this.following.followingIndex = followIndex;
          this.following.followingGenome = selectedCritterGenome.asString;
        }
      }
    }

    this.setDetail(this.world.getDetail(this.following, settings.magnifierSize))

    //    this.world.getDetail(this.following, settings.magnifierSize)
    this.isTakingTurn = false;
    this.setTurn(turn);
    // this.runTurnLoop();

    this.setSummary(this.world.getSummary())


    if (this.settings.showPreview && ((turn - this.lastGetSummaryTurn) > 100)) {
      this.lastGetSummaryTurn = turn;
      //        console.log('calling getSummary because turn is %d', result);
      this.setSummary(this.world.getSummary())
    }


    if ((turn - this.lastGetGenealogyTurn) > 3000) {
      this.lastGetGenealogyTurn = turn;
      this.setGenealogyReport(this.world.getGenealogyReport())
    }


    const currentTime = new Date().getTime();
    const elapsedDetailTime = currentTime - this.lastGetDetailTime;
    // if (this.settings.showPreview && elapsedDetailTime > (1000 / 20)) {
    this.lastGetDetailTime = currentTime;
    //        console.log('calling getDetail because currentTime - this.lastGetDetailTime is %d', elapsedDetailTime);
    // this.setDetail(this.world.getDetail(this.following, settings.magnifierSize))
    // }



    // if (!this.delay) {
    //   this.runningAtFullSpeed = true;
    //   this.takeTurn();
    // } else {
    //   this.runningAtFullSpeed = false;
    // }

    if (!(simulationStore.turn % 1000)) {
      persistence.save()
    }
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

export const simulationStore = new SimulationUIStore();
