import { computed } from 'mobx';
import { SimulationConstants } from '../common/SimulationConstants';
import { simulationStore } from '../ui/SimulationUIStore';
import { GenomeCharToCode, GenomeCode, GenomeCodeInfo, GenomeCodeToInfo } from './GenomeCode';

export class Genome {
  codes: Array<GenomeCode>;
  codesInfo: Array<GenomeCodeInfo>;
  asString: string;
  color: number;
  colorPhotosynthesizing: number;
  count: number;
  firstTurn: number;

  constructor(src: string | Array<GenomeCode>, readonly ancestors: string) {
    if (typeof src === 'string') {
      this.codes = new Array<GenomeCode>(src.length);
      this.codesInfo = new Array<GenomeCodeInfo>(src.length);
      const codeMap = GenomeCharToCode;
      for (let i = 0; i < src.length; i++) {
        const char = src[i];
        const code = codeMap[char];
        const info = GenomeCodeToInfo[code];
        if (info) {
          this.codes[i] = code;
          this.codesInfo[i] = info;
        } else {
          debugger;
        }
      }
    } else {
      this.codes = src;
      this.codesInfo = new Array<GenomeCodeInfo>(src.length);
      for (let i = 0; i < src.length; i++) {
        this.codesInfo[i] = GenomeCodeToInfo[src[i]];
      }
    }
    this.asString = this.codesInfo.map(code => code.char).join('');
  }

  /**
   * Return a new mutated genome
   */
  mutate(): Genome {
    let result = this;

    enum MutationType {
      insert,
      delete,
      modify
    };
    // console.log(JSON.stringify(GenomeCodeToInfo, null, 2))
    const codes = Object.keys(GenomeCodeToInfo).filter(code => (GenomeCodeToInfo[code].disabled !== true)).map(code => parseInt(code, 10) as GenomeCode);

    function getRandomCode() {
      return codes[Math.floor(Math.random() * codes.length)];
    };

    const { settings } = simulationStore.simulation;
    if (Math.random() > (settings.mutationRate / 100)) {
      // no mutation
      return result;
    }
    // mutation!
    let mutationType = Math.floor(Math.random() * 3);
    let newCodes = this.codes.slice();
    switch (mutationType) {
      case MutationType.insert: {
        if (newCodes.length >= SimulationConstants.maxGenomeLength) {
          return result;
        }
        const position = Math.floor(Math.random() * newCodes.length + 1);
        const c = getRandomCode();
        if ("4" === (c as any)) {
          debugger
        }
        if (position === 0) {
          newCodes.unshift(c);
        } else if (position >= newCodes.length) {
          newCodes.push(c);
        } else {
          newCodes.splice(position, 0, c);
        }
        break;
      }

      case MutationType.delete:
        if (newCodes.length > 1) {
          const position = Math.floor(Math.random() * newCodes.length);
          newCodes.splice(position, 1);
        }
        break;

      case MutationType.modify: {
        const position = Math.floor(Math.random() * newCodes.length);
        const c = getRandomCode();
        newCodes[position] = c;
        break;
      }
    }

    return new Genome(newCodes, this.ancestors ? (this.ancestors + ',' + this.asString) : this.asString);
  }

  // export function cellLengthFromGenome(genome: string) {
  //   const { settings } = Globals;
  //   return Math.min(settings.limitCellLength, genome.length);
  //   // let result = 0;

  //   // for (let i = 0; i < genome.length; ++i) {
  //   //   switch (genome[i]) {
  //   //     case GenomeCode.Move:
  //   //     case GenomeCode.MoveAndEat:
  //   //     case GenomeCode.Photosynthesize:
  //   //     case GenomeCode.Sleep:
  //   //       ++result;
  //   //   }
  //   // }

  //   // return Math.min(1, result);
  // }
}
