import { observer } from 'mobx-react';
import React from "react";
import { GenomeCharToCode, GenomeCodeInfo, GenomeCodeToInfoMap } from '../../simulation-code/GenomeCode';
import './GenomeCodeList.scss'

class GenomeCodeListProps {
  readonly genome: string;
}

@observer
export class GenomeCodeList extends React.Component<GenomeCodeListProps> {

  render() {
    const genome = this.props.genome || '';
    const codes: Array<GenomeCodeInfo> =
      genome.split('')
        .map(char => GenomeCharToCode[char])
        .map(code => GenomeCodeToInfoMap[code])
        .filter(codeInfo => !!codeInfo);

    return (
      <div className='GenomeCodeList'>
        {codes.map((codeInfo, index) =>
          <div key={index}>
            <span>{codeInfo.char}: &nbsp;</span>
            <span>{codeInfo.description}</span>
          </div>)}
      </div>
      // <>
      //   <table className='GenomeCodeList'>
      //     <tbody>
      //       {
      //         codes.map((codeInfo, index) =>
      //           <tr key={index}>
      //             <td>{codeInfo.char}</td>
      //             <td>{codeInfo.description}</td>
      //           </tr>
      //         )}
      //     </tbody>
      //   </table>
      // </>
    )
  }
}
