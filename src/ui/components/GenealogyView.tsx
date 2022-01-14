import { observer } from 'mobx-react';
import React, { CSSProperties } from "react";
import Tree, { withStyles } from '../components/VerticalTree'
// /../react-vertical-tree/dist/index.js' //'react-vertical-tree'
import { WorldSummary } from '../../common/WorldSummary';
import { colorToRGB } from '../../simulation-code/Colors';
import { simulationStore } from '../SimulationUIStore';
import { GenomeCodeList } from './GenomeCodeList';
import Grid from '@material-ui/core/Grid';

import './GenealogyView.scss';
import ReactTooltip from 'react-tooltip';
import { GenealogyReport } from '../../common/GenealogyReport';
import { genomeStore } from '../../simulation-code/GenomeStore';


const styles = {
  lines: {
    color: '#1890ff',
    height: '15px',
  },
  node: {
    backgroundColor: '#fff',
    border: '1px solid #1890ff',
    borderRadius: 8,
    width: 150,
    boxShadow: '5px 5px 15px 0px rgba(0, 0, 0, 0.89)'
  },
  text: {
    color: '#ccc',
  }
}

const StyledTree = withStyles(styles)(Tree) as typeof Tree


interface GenealogyViewProps {
  // readonly summary: WorldSummary;
  // readonly selectedGenome: string;
  // readonly selectedGenomeIndex: number;

  // onSelectGenome(genome: string);
}

const getStyleSwatchForGenome = (color: number) => {
  const rgb = colorToRGB(color);
  return {
    width: 24,
    height: 19,
    'backgroundColor': `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    marginRight: 5
  };
}

const genealogyReportRowStyle = {

}

const genealogyReportBoxStyle = {
}

type Node = {
  id: string,
  name: string,
  parent: { id: string } | null,
  children: Array<Node>,
  count: number
};

@observer
export class GenealogyView extends React.Component<GenealogyViewProps> {

  renderNodeContents = (item: Node) => {

    return <Grid container>
      <div id={item.name} className={`genome ${item.count ? '' : 'extinct'}`}>
        {item.name}{(item.count > 0) && ` (#${item.count})`}

        <ReactTooltip
          afterShow={simulationStore.handleShowTooltip}
          afterHide={simulationStore.handleHideTooltip}
          id={item.name} className='genome-tooltip' place='bottom' effect='solid'>
          <h3>{item.name}</h3>
          <GenomeCodeList genome={item.name} />
        </ReactTooltip>
      </div>
    </Grid>
  };


  render() {
    const { genealogyReport } = simulationStore;
    if (!genealogyReport) {
      return <h3>Please wait</h3>
    }
    const data = [];
    const addReport = (report: GenealogyReport, dest: Array<Object>, parent: any = null) => {
      if (!report) {
        return
      }
      const node: Node = {
        id: report.genome,
        name: report.genome,
        parent: parent ? { id: parent.id } : null,
        children: [],
        count: report.currentCount
      }
      dest.push(node)
      if (report.descendants) {
        for (const child of report.descendants) {
          addReport(child, node.children, node)
        }
      }
    }
    addReport(genealogyReport, data);

    const getCount = (genome: string) => {
      return genomeStore.genomeInfo[genome]?.count ?? 0;
    }

    const renderNodeFunction = this.renderNodeContents;
    return <div className='GenealogyView'>
      <StyledTree
        data={data}
        renderContents={renderNodeFunction}
        onClick={() => {}}
      />

    </div >

    /*

int printTree(GenomeBranch *pGenomeBranch, set<string> & livingGenomes, map<string,int> & genomeToPopulation, set<string> &addedGenomes,
               stringstream & f, int generationLevel, int siblingLevel, const char *parentGenome, int minPopulation)
{
  int result = 1;

    int x = siblingLevel * critter_width * 1.25;
    int y = generationLevel * (critter_height + 50);

    string &genome = pGenomeBranch->genome;
    bool alive = false;

    f << "<div id='critter_" << toHTMLGenome(genome) << "' class='critter";
    if (livingGenomes.find(genome) != livingGenomes.end()) {
        f << " alive";
        alive = true;
    }

    f << "' style='left:" << x << "px;top:" << y << "px' data-generation=" << generationLevel
        << " data-turn-appeared=" << pGenomeBranch->turnAppeared << " data-genome='" << toHTMLGenome(genome) << "'";

    if (parentGenome != NULL) {
        f << " data-parent-genome='" << toHTMLGenome(parentGenome) << "'";
    }
    f << ">" << '\n';

    int sx = (critter_width - genome.length() * segment_width) / 2;
    int sy = 4;

    for (int i = 0; i < genome.size(); i++) {

        for (int pass = 0; pass < 2; pass++) {
            char ch = genome[i];
            if (pass == 0) {
                ch = 'a' + ((ch & eInstructionMask) - eInstructionPhotosynthesize);
            }
            else {
        eSegmentExecutionType execType = Genome::getExecType(ch);
        switch (execType) {
          default:
          case eAlways:	ch = 0; break;
          case eIf:		ch = 'Y'; break;
          case eNotIf:	ch = 'N'; break;
        }
            }
            if (ch != 0) {
                f << "<div class='segment segment_";
                if (ch == 'Y' || (ch == 'N'))
                    f << '_';
                f << ch;
                f << "' style='left:" << sx << "px;top:" << sy << "px'></div>";
            }
        }
        sx += segment_width;
    }

    if (alive) {
        f << "<p class='population'>Population: " << genomeToPopulation[genome] << "</p>";
    }
    else {
        f << "<p class='population'><i>EXTINCT</i></p>";
    }
    f << "</div>" << '\n';


  vector<GenomeBranch*> children;

    for (vector<GenomeBranch*>::const_iterator i = pGenomeBranch->getDescendants().begin(); i != pGenomeBranch->getDescendants().end(); i++) {
        if (addedGenomes.find((*i)->genome) != addedGenomes.end()) {
            continue;
        }
        addedGenomes.insert((*i)->genome);

        if (! skipGenome((*i)->genome)) {
            children.push_back(*i);
        }
    }
    sort(children.begin(), children.end(), compareDecendantsFunc);

    for (vector<GenomeBranch*>::iterator i = children.begin(); i != children.end(); i++) {
    if ((*i)->getDescendants().size() == 0) {
      if (genomeToPopulation[(*i)->genome] < minPopulation)
        return siblingLevel;
    }
        int maxSibs = printTree(*i, livingGenomes, genomeToPopulation, addedGenomes, f, generationLevel + 1, siblingLevel++, genome.c_str(), minPopulation);
    if (maxSibs > siblingLevel)
      siblingLevel = maxSibs;
    }
  return siblingLevel;
}
*/

    const addRow = (reportsInRow: Array<GenealogyReport>) => {
    }
    let rowParents = [genealogyReport];
    addRow(rowParents)

    const renderWithDescendants = (report: GenealogyReport) => {
      return <div style={genealogyReportRowStyle}>
        <div style={genealogyReportBoxStyle}>
          <h1>{report.genome}</h1>
        </div>
      </div>
    }
    return <div className='GenealogyView'>
      <pre>{JSON.stringify(simulationStore.genealogyReport, null, 2)}</pre>
    </div>
    // return <h1>Genealogy</h1>
    // const { summary, selectedGenome } = this.props;
    // if (!summary) {
    //   return null;
    // }

    // const topGenomes = summary.topGenomes.slice(0, 14);
    // return (
    //   <Grid container className='GenealogyView'>
    //     <Grid item xs={12}>
    //       Total critters: {summary.totalCritters}
    //     </Grid>
    //     <Grid item xs={12}>
    //       Top genomes:
    //     </Grid>
    //     <Grid item xs={12}>
    //       <table>
    //         <tbody>
    //           {topGenomes.map(genome => (
    //             <tr
    //               data-tip data-for={genome.genome}
    //               data-genome={genome.genome}
    //               key={genome.genome}
    //               onClick={this.handleClickSelectGenome}
    //               className={`genome-row ${(genome.genome === selectedGenome) ? 'selected-genome' : ''}`}>
    //               <td>
    //                 {genome.count}
    //               </td>
    //               <td>
    //                 <div style={getStyleSwatchForGenome(genome.color)}></div>
    //               </td>
    //               <td>
    //                 {genome.genome}
    //                 <ReactTooltip
    //                   afterShow={simulationStore.handleShowTooltip}
    //                   afterHide={simulationStore.handleHideTooltip}
    //                   id={genome.genome} className='genome-tooltip' place='bottom' effect='solid'>
    //                   <h3>{genome.genome}</h3>
    //                   <GenomeCodeList genome={genome.genome} />
    //                 </ReactTooltip>
    //               </td>
    //             </tr>
    //           ))}
    //         </tbody>
    //       </table>
    //     </Grid>

    //     {false && summary.topGenomes.length &&
    //       <GenomeCodeList genome={summary.topGenomes[0].genome} />}
    //     {/* </div> */}
    //   </Grid>
    // )
  }
}
