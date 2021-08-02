import { observer } from 'mobx-react';
import React, { CSSProperties } from "react";
import { WorldSummary } from '../../common/WorldSummary';
import { colorToRGB } from '../../simulation-code/Colors';
import { simulationStore } from '../SimulationUIStore';
import { GenomeCodeList } from './GenomeCodeList';
import Grid from '@material-ui/core/Grid';

import './SummaryView.scss';
import ReactTooltip from 'react-tooltip';

interface SummaryViewProps {
  readonly summary: WorldSummary;
  readonly selectedGenome: string;
  readonly selectedGenomeIndex: number;

  onSelectGenome(genome: string);
}

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

  handleClickSelectGenome = (evt: React.MouseEvent<HTMLElement>) => {
    const genome = evt.currentTarget.attributes.getNamedItem('data-genome').value;
    if (genome) {
      this.props.onSelectGenome(genome);
    }
  };

  render() {
    const { summary, selectedGenome } = this.props;
    if (!summary) {
      return null;
    }

    const topGenomes = summary.topGenomes.slice(0,14);
    return (
      <Grid container className='SummaryView'>
        <Grid item xs={12}>
          Total critters: {summary.totalCritters}
        </Grid>
        <Grid item xs={12}>
          Top genomes:
          </Grid>
        <Grid item xs={12}>
          <table>
            <tbody>
              {topGenomes.map(genome => (
                <tr
                  data-tip data-for={genome.genome}
                  data-genome={genome.genome}
                  key={genome.genome}
                  onClick={this.handleClickSelectGenome}
                  className={`genome-row ${(genome.genome === selectedGenome) ? 'selected-genome' : ''}`}>
                  <td>
                    {genome.count}
                  </td>
                  <td>
                    <div style={getStyleSwatchForGenome(genome.color)}></div>
                  </td>
                  <td>
                    {genome.genome}
                    <ReactTooltip
                      afterShow={simulationStore.handleShowTooltip}
                      afterHide={simulationStore.handleHideTooltip}
                      id={genome.genome} className='genome-tooltip' place='bottom' effect='solid'>
                      <h3>{genome.genome}</h3>
                      <GenomeCodeList genome={genome.genome} />
                    </ReactTooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Grid>

        {false && summary.topGenomes.length &&
          <GenomeCodeList genome={summary.topGenomes[0].genome} />}
        {/* </div> */}
      </Grid>
    )
  }
}
