class GenomeRepository {

  genomeToIndex: { [genome: string]: number } = {};
  genomeToCount: { [genome: string]: number } = {};
  indexToGenome: { [index: number]: string } = {};
  genomeToParentIndex: { [genome: string]: number } = {};

  private static nextIndex: number = 1;

  registerGenome(genome: string, parentIndex = 0) {
    let index = this.genomeToIndex[genome]
    if (!index) {
      index = GenomeRepository.nextIndex++;
      this.genomeToIndex[genome] = index;
      this.genomeToCount[genome] = 0;
      this.genomeToParentIndex[genome] = parentIndex;
      this.indexToGenome[index] = genome;
    }
    return index;
  }

}

export const genomeRepository = new GenomeRepository;