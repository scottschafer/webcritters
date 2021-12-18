import { simulationStore } from "../ui/SimulationUIStore";
import { genomeStore } from "./GenomeStore";

class Persistence {
  serialize(): Object {
    return {
      turn: simulationStore.turn,
      settings: simulationStore.settings,
      pixelArray: simulationStore.world.canvasBuffer,
      genomeInfo: genomeStore.genomeInfo,
      usedColors: genomeStore.usedColors
    }
  }

  save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('world', JSON.stringify(this.serialize()))
    }
  }

  load() {
    if (typeof window !== 'undefined') {
      const data = JSON.parse(localStorage.getItem('world') || '{}')
      simulationStore.turn = data.turn
      // for now:
      // Object.assign(simulationStore.settings, data.settings)
      // genomeStore.genomeInfo = data.genomeInfo
      // genomeStore.usedColors = data.usedColors
    }
  }
}

export const persistence = new Persistence()
