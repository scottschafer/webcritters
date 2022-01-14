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
  count: number; // number of living critters with this genome
  cellLength: number;
  firstTurn: number;


  constructor(src: string | Array<GenomeCode>, readonly ancestors: string) {
    const origSrc = src;

    if (typeof src === 'string') {
      // remove all the limit length characters before we produce the codes
      this.cellLength = src.indexOf('^') + 1;
      if (!this.cellLength) {
        this.cellLength = src.length;
      } else {
        src = src.replace(/\^/g, '')
      }


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

      let limitedCellLength = 0;
      for (let i = 0; i < src.length; i++) {
        if (! limitedCellLength && src[i] === GenomeCode.LimitLength) {
          limitedCellLength = i + 1;
        }
        this.codesInfo[i] = GenomeCodeToInfo[src[i]];
      }
      this.cellLength = limitedCellLength ? limitedCellLength : src.length;
    }
    this.asString = (typeof origSrc === 'string') ? origSrc : this.codesInfo.map(code => code.char).join('');
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

    // if the new codes only include LimitLength codes, then it's invalid
    if (! newCodes.filter(code => (code !== GenomeCode.LimitLength)).length) {
      return this;
    }
    return new Genome(newCodes, this.ancestors ? (this.ancestors + ',' + this.asString) : this.asString);
  }
}
