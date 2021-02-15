import { blendColors, ColorGreen, GenomeColors } from './Colors';
import { GenomeCode } from './Genome';
import { Globals } from './Globals';

export type GenomeInfo = {
  genome: string;
  color: number;
  colorPhotosynthesizing: number;
  count: number;
  parent: string;
  firstTurn: number;
};

class GenomeStore {

  genomeInfo: { [genome: string]: GenomeInfo } = {};
  usedColors: { [color: number]: true } = {};

  private nextGenomeColorIndex = 0;

  registerBirth(genome: string, parent: string) {
    ++Globals.numCritters;
    const genomeInfo = this.genomeInfo[genome];
    if (genomeInfo) {
      ++genomeInfo.count;
    } else {
      let color = ColorGreen;
      if (genome !== GenomeCode.Photosynthesize) {
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
            debugger;
          }
          const skipTop = 3;
          color = ColorGreen;
          while (color === ColorGreen) {
            color = sortedGenomes[Math.min(sortedGenomes.length - 1, skipTop + Math.floor(Math.random() * (GenomeColors.length - skipTop)))].color;
          }
          // let lowestCount = Infinity;
          // Object.values(this.genomeInfo).forEach(g => {
          //   if (g.count < lowestCount) {
          //     lowestCount = g.count;
          //   }
          // });
          // const leastUsedColors = Object.values(this.genomeInfo).filter(g => (g.count <= 2 * lowestCount)).map(g => g.color);
          // color = leastUsedColors[Math.floor(Math.random() * leastUsedColors.length)];
        }
      }
      const colorPhotosynthesizing = blendColors(color, ColorGreen);

      this.genomeInfo[genome] = {
        genome,
        color,
        colorPhotosynthesizing,
        count: 1,
        parent,
        firstTurn: Globals.turn
      };

      // console.log(`assigning color #${color.toString(16).substr(2)} to genome ${genome}`);

      this.usedColors[color] = true;
    }
  }

  registerDeath(genome: string) {

    const g = this.genomeInfo[genome];

    if (! --g.count) {
      delete this.usedColors[g.color];
      delete this.genomeInfo[genome];
    }
    --Globals.numCritters;
  }

}

export const genomeStore = new GenomeStore;