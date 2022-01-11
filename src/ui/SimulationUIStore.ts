import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { FollowingDetails } from '../common/FollowingDetails';
import { GenealogyReport } from '../common/GenealogyReport';
import { SimulationConfig } from '../common/SimulationConfig';
import { SimulationConstants } from '../common/SimulationConstants';
import { WorldDetails } from '../common/WorldDetails';
import { WorldSummary } from '../common/WorldSummary';
import { persistence } from '../simulation-code/Persistence';
import { SimulationSettings } from '../simulation-code/SimulationSettings';
import { Simulation } from '../simulation-code/Simulation';
import { decodePoint } from '../simulation-code/Orientation';
import { eAppMode } from './App';

// import { this.world } from '../simulation-worker/this.world';

class SimulationUIStore {
  // sharedArrayBufferUint8Array: Uint8Array;
  @observable.ref settings = new SimulationSettings();
  @observable.ref summary: WorldSummary = null;
  @observable.ref genealogyReport: GenealogyReport = null;
  @observable.ref details: WorldDetails = null;
  @observable.ref playDetails: WorldDetails = null;

  @observable.ref following: FollowingDetails = new FollowingDetails();

  @observable selectedGenome: string;
  @observable selectedGenomeIndex: number;

  @observable appMode: eAppMode;

  lastTurnTime = 0;
  lastGetDetailTime = 0;
  lastGetSummaryTurn = 0;
  lastGetGenealogyTurn = 0;
  runningAtFullSpeed = false;
  isTakingTurn = false;
  simulation: Simulation;


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

  @action setAppMode(mode: eAppMode) {
    if (mode === eAppMode.Play) {
      persistence.save()
    } else if (this.appMode === eAppMode.Play) {
      persistence.load()
    }
    this.appMode = mode;

    if (this.appMode === eAppMode.Play) {
      // find the critter with highest energy and control that one
      let highestEnergy = 0;
      let highestEnergyCritter = null;
      for (let i = 1; i < this.simulation.numCritters; i++) {
        const critter = this.simulation.critters[i];
        if (! critter.isDead && critter.energy > highestEnergy) {
          highestEnergy = critter.energy;
          highestEnergyCritter = critter;
        }
      }
      this.following.followingIndex = highestEnergyCritter?.critterIndex;
    }
  }

  @action.bound setSettings(value: SimulationSettings) {
    const oldValue = JSON.parse(JSON.stringify(this.settings))
    this.settings = value;

    this.simulation.updateSettings(oldValue);
  }

  @computed get delay() {
    let result = 0;
    if (!this.settings.speed || this.tooltipsShown) {
      result = Infinity;
    } else {
      let delay = (SimulationConstants.maxSpeed - this.settings.speed) / SimulationConstants.maxSpeed;
      result = delay * delay * delay * 150;
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
    this.simulation = new Simulation()
    this.simulation.reset();
    this.started = true;
    console.log('startSimulation');

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

  @action setPlayDetail(value: WorldDetails) {
    this.playDetails = value;
  }

  @action setDetail(value: WorldDetails) {
    this.details = value;
  }

  @action.bound handleSelectGenome(genome: string) {
    this.selectedGenome = genome;
  }

  @action.bound takeTurn() {
    
    let playerControlledIndex = -1;
    let turnsToTake = (this.settings.speed === 11) ? 10 : 1

    if (this.appMode === eAppMode.Play) {
      turnsToTake = 1;
      playerControlledIndex = this.following.followingIndex;
    }

    const { settings } = this;
    this.isTakingTurn = true;
    this.lastTurnTime = new Date().getTime();
    let selectedCritter = null;
    let selectedCritterGenome = null
    if ((this.settings.followSelection || this.appMode === eAppMode.Play) && this.following.followingIndex >= 0) {
      selectedCritter = this.simulation.critters[this.following.followingIndex];
      selectedCritterGenome = selectedCritter?.genome;
      if (selectedCritterGenome?.asString.includes('M') || selectedCritterGenome?.asString.includes('m')) {
        const headPoint = decodePoint(selectedCritter.cellPositions[0]);
        this.following.x = headPoint.x - settings.magnifierSize / 2;
        this.following.y = headPoint.y - settings.magnifierSize / 2;
      }
    }

    const t0 = performance.now();
    const turn = this.simulation.takeTurn(turnsToTake, playerControlledIndex); //.then(result => {
    const t1 = performance.now();
    console.log(`Call to this.world.takeTurn took ${t1 - t0} milliseconds.`);

    if (this.settings.followSelection) {
      if (selectedCritter) {
        if (selectedCritter.isDead || this.selectedGenome !== selectedCritter.genome?.asString) {
          selectedCritter = null;
        }
      }
      if (!selectedCritter) {
        let followIndex = -1;
        let maxEnergy = -1;
        this.simulation.critters.forEach((critter, index) => {
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

    if (this.appMode === eAppMode.Play) {
      this.setPlayDetail(this.simulation.getDetail(this.following, SimulationConstants.playDim));
    } else {
      this.setDetail(this.simulation.getDetail(this.following, settings.magnifierSize))
    }
    //    this.world.getDetail(this.following, settings.magnifierSize)
    this.isTakingTurn = false;
    this.setTurn(turn);
    // this.runTurnLoop();

    this.setSummary(this.simulation.getSummary())


    if (this.settings.showPreview && ((turn - this.lastGetSummaryTurn) > 100)) {
      this.lastGetSummaryTurn = turn;
      //        console.log('calling getSummary because turn is %d', result);
      this.setSummary(this.simulation.getSummary())
    }


    if ((turn - this.lastGetGenealogyTurn) > 3000) {
      this.lastGetGenealogyTurn = turn;
      this.setGenealogyReport(this.simulation.getGenealogyReport())
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

    if (this.isTakingTurn) {
      return;
    }

    window.setTimeout(this.runTurnLoop, 0);

    const curTime = new Date().getTime();
    if ((curTime - this.lastTurnTime) >= this.delay) {
      this.lastTurnTime = curTime;

      const t0 = performance.now();
      this.takeTurn();
      const t1 = performance.now();
      console.log(`Call to takeTurn took ${t1 - t0} milliseconds.`);
    }


  //   if (!this.delay) {
  //     if (!this.runningAtFullSpeed) {
  //       this.runningAtFullSpeed = true;
  //       this.takeTurn();
  //     }
  //   } else {

  //     if (this.delay > 0) {
  //       const curTime = new Date().getTime();
  //       if ((curTime - this.lastTurnTime) >= this.delay) {
  //         this.lastTurnTime = curTime;
  //         this.takeTurn();
  //       }
  //     }
  //   }
  }

};

export const simulationStore = new SimulationUIStore();
