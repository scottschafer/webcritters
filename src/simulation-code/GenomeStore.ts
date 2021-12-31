import { blendColors, ColorGreen, GenomeColors } from './Colors';
import { GenomeCharToCode, GenomeCode, GenomeCodeInfo, PhotosynthesizeGenome } from './GenomeCode';
import { Genome } from './Genome';
import { SimulationConstants } from '../common/SimulationConstants';
import { simulationStore } from '../ui/SimulationUIStore';

class GenomeStore {

  genomeInfo: { [genome: string]: Genome } = {};
  usedColors: { [color: number]: true } = {};

  /**
   * 
   * @param genome
   * @param parent 
   */
  registerBirth(genome: string | Genome, allowMutation: boolean = true): Genome {
    let result: Genome;
    if (typeof genome === 'string') {
      if (this.genomeInfo[genome]) {
        genome = this.genomeInfo[genome];
      } else {
        genome = new Genome(genome, null);
        this.initNewGenome(genome);
      }
      result = genome;
    } else {
      result = genome;
    }

    const { settings } = simulationStore.simulation;

    // optionally produce a mutated offspring
    if (SimulationConstants.allowDeathBirth && allowMutation && (Math.random() < (settings.mutationRate / 100))) {
      if (!result?.mutate) {
        debugger;
        return
      }
      let mutatedGenome = result.mutate();
      const existingGenome = genomeStore.genomeInfo[mutatedGenome.asString];
      if (existingGenome) {
        result = mutatedGenome = existingGenome;
      }
      if (mutatedGenome !== result) {
        this.initNewGenome(mutatedGenome);
        result = mutatedGenome;
      }
    }
    ++result.count;
    ++simulationStore.simulation.numCritters;
    return result;
  }

  registerDeath(genome: string | Genome) {

    if (!(genome instanceof Genome)) {
      genome = this.genomeInfo[genome];
    }
    // const g = this.genomeInfo[genome];

    if (! --genome.count) {
      delete this.usedColors[genome.color];
      delete this.genomeInfo[genome.asString];
    }
    --simulationStore.simulation.numCritters;
  }

  private initNewGenome(genome: Genome) {

    const colors = GenomeColors;
    // console.log(colors.length);

    let color = ColorGreen;
    if (genome.asString !== PhotosynthesizeGenome) {
      color = null;

      // try to find unused color
      for (let i = 1; i < GenomeColors.length; i++) {
        const testColor = GenomeColors[i];
        if (!this.usedColors[testColor]) {
          color = testColor;
          break;
        }
      }

      if (color === null) {
        const sortedGenomes = Object.values(genomeStore.genomeInfo).sort((a, b) => (b.count - a.count));
        if (sortedGenomes.length < GenomeColors.length) {
          // Dunno why this happens, but for now ignore it
          // debugger;

        }
        const skipTop = 3;
        color = ColorGreen;
        while (color === ColorGreen) {
          color = sortedGenomes[Math.min(sortedGenomes.length - 1, skipTop + Math.floor(Math.random() * (GenomeColors.length - skipTop)))].color;
        }
      }
    }
    const colorPhotosynthesizing = ColorGreen; // blendColors(color, ColorGreen);

    genome.color = color;
    genome.colorPhotosynthesizing = colorPhotosynthesizing;
    genome.count = 0;
    genome.firstTurn = simulationStore.simulation.turn;

    // console.log(`assigning color #${color.toString(16).substr(2)} to genome ${genome}`);

    this.usedColors[color] = true;
    this.genomeInfo[genome.asString] = genome;
  }
}

export const genomeStore = new GenomeStore();