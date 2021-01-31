import { GenomeColors } from './Colors';

class GenomeRepository {

  genomeToIndex: { [genome: string]: number } = {};
  genomeToCount: { [genome: string]: number } = {};
  indexToGenome: { [index: number]: string } = {};
  indexToColor: { [index: number]: number } = {};

  genomeToParentIndex: { [genome: string]: number } = {};

  private static nextIndex: number = 1;
  private static nextGenomeColorIndex = 0;

  registerGenome(genome: string, parentIndex = 0) {
    let index = this.genomeToIndex[genome]
    if (!index) {
      index = GenomeRepository.nextIndex++;
      this.genomeToIndex[genome] = index;
      this.genomeToCount[genome] = 0;
      this.genomeToParentIndex[genome] = parentIndex;
      this.indexToGenome[index] = genome;
      this.indexToColor[index] = GenomeColors[GenomeRepository.nextGenomeColorIndex];
      GenomeRepository.nextGenomeColorIndex = (GenomeRepository.nextGenomeColorIndex + 1) % GenomeColors.length;
    }
    return index;
  }

}

export const genomeRepository = new GenomeRepository;