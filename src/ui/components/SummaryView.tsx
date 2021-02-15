import { observer } from 'mobx-react';
import React from "react";
import { Row } from 'react-bootstrap';
import { WorldSummary } from '../../common/WorldSummary';
import { colorToRGB } from '../../simulation-code/Colors';
import './SummaryView.scss';

class SummaryViewProps {
  readonly summary: WorldSummary;
}

const styleSwatchForIndex: { [index: number]: object } = {};

const getStyleSwatchForGenome = (color: number) => {
  const rgb = colorToRGB(color);
  return {
    width: 24,
    height: 24,
    'backgroundColor': `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    marginRight: 5
  };
}

@observer
export class SummaryView extends React.Component<SummaryViewProps> {

  render() {
    const { summary } = this.props;
    if (!summary) {
      return null;
    }
    return (
      <div className='SummaryView'>
        <Row>
          Total critters: {summary.totalCritters}
        </Row>
        <Row>
          Top genomes:
          </Row>
        <Row>
          <table>
            <tbody>
              {summary.topGenomes.map(genome => (
                <tr key={genome.genome}>
                  <td>
                    {genome.count}
                  </td>
                  <td>
                    <div style={getStyleSwatchForGenome(genome.color)}></div>
                  </td>
                  <td>
                    {genome.genome}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Row>
      </div>
    )
  }
}
