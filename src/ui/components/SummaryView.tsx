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
  readonly turn: number;

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
    const { summary, selectedGenome, turn } = this.props;
    if (!summary) {
      return null;
    }

    const topGenomes = summary.topGenomes.slice(0, 10);
    if (!topGenomes.find((genome) => (genome.genome === selectedGenome))) {
      setTimeout(() => {
        this.props.onSelectGenome(topGenomes[0].genome);
      });
    }
    return (
      <div className='SummaryView'>
        <Grid container>
          <Grid item xs={12}>
            Total critters: {summary.totalCritters}, Turn # {turn}
          </Grid>
          <Grid item xs={12} className='top-genome-label'>
            Top genomes:
          </Grid>
          <Grid item xs={12}>
            <table>
              <tbody>
                {topGenomes.map(genome => (<>
                  <tr
                    data-tip data-for={genome.genome}
                    data-genome={genome.genome}
                    key={genome.genome}
                    onClick={this.handleClickSelectGenome}
                    className={`genome-row ${(genome.genome === selectedGenome) ? 'selected-genome' : ''}`}>
                    {/* <td>
                      {genome.count}
                    </td> */}
                    <td>
                      <div style={getStyleSwatchForGenome(genome.color)}></div>
                    </td>
                    <td>
                      <span className='genome-and-list'>
                      {genome.genome}
                      </span>
                      {(genome.genome === selectedGenome) &&
                        <GenomeCodeList genome={selectedGenome} />}
                    </td>
                    <td>#{genome.count}</td>
                  </tr>
                </>

                ))}
              </tbody>
            </table>
          </Grid>
          {/* 
          {true && summary.topGenomes.length &&
            <GenomeCodeList genome={summary.topGenomes[0].genome} />}
          </div> */}
        </Grid>
      </div>
    )
  }
}
