import React from "react";
import "./ExplanatoryText.scss";
import { observer } from 'mobx-react';
import { action, observable } from "mobx";


export class ExplanatoryText extends React.Component<{}, {expanded: boolean}> {

  @observable expanded = true;

  handleClickToggle = () => {
    this.setState({expanded: ! (this.state?.expanded ?? true)})
  }

  render() {
    const expanded = this.state?.expanded ?? true;

    return (
      <>
        <div className="ExplanatoryTextLogo">
          <h1>Webcritters</h1>
          <h3>an evolutionary simulation</h3>
           <img src="fledermoose-logo.jpg"/>
           <p><i>by Scott Schafer for Fledermoose Inc</i> </p>
         </div>

        <div className={'ExplanatoryText ' + (expanded ? 'ExplanatoryTextExpanded' : 'ExplanatoryTextCollapsed')}>
          <div className='contents'>
            <p>{`Welcome to the fast evolving world of Webcritters!`}</p>

            {expanded && <>
            <p>
              {`The rapidly moving and changing grid of dots and colors on the left contains
      evolving simulated lifeforms, or "critters". You can use the magnifying glass (the circle) to inspect the goings on.
      You can also turn down the speed and tweak various settings, such as turning on barriers.`}
            </p>

            <p>
              {`Critters are very simple simulated lifeforms that share some common properties with actual biological organisms. They have energy
      which allows them to move and reproduce. They have a "genetic" code which governs their form and behavior. When they reproduce, their
      offspring may have mutations in the genetic code, and this results in evolution and adaptation.`}
            </p>

            <p>
              {`The form of a critter is simple, and somewhat reminiscent of the old Snake game. Each is a simply a one or more of dots in a chain, with a head that can
      be oriented up, right, down or left. They exist on a 256 x 256 grid. A critter cannot move over itself, another critter or a barrier. The
      initial critter is one-celled and simply photosynthesizes to gain energy.`}
            </p>

            <p>
              {`The upper-right gives a running tally of the most populous critters by genome (common genetic sequence). Each is given a randomly-assigned color.
      The tally shows the color, genome and the number of critters with that genome, and the selected genome shows a breakdown of its code.`}
            </p>

            <p>
              {`Critters can gain energy in two ways: they can Photosynthesize, or they can Eat. Photosynthesizing critters have one or
      more green cells, starting at the tail and extending up to the head, and they gain energy each turn for every green cell. 
      A critter can Eat to get energy from either a non-living food source or another critter. A critter can only eat if its head is
      touching and oriented towards a green cell of another critter or green food dot.`}
            </p>

            <p>
              {`If a critter's energy exceeds a threshold ("Spawn Energy per Cell" times its length), it will have an offspring at its tail. If Mutation Rate is on, the genetic
      sequence of the offspring may have an instruction randomly added, removed or changed from a set of available instructions. If a critter's energy goes to zero, it
      will die and turn to non-living green food dots.`}
            </p>

            <p>
              {`A critter's instructions are executed one by one, starting with the first instruction. When it reaches the end, the instructions start over at the beginning.
       Some instructions are conditional, and the next instruction (or group of instructions linked with an And instruction) will be skipped if the condition is not met.`}
            </p>

            <p>{`There's more to come, when time and energy permit. Enjoy!`}</p>
            </>
  }
          </div>
        </div>

        {expanded && <div className="scrollMsg">scroll for more</div>}
        <div className="btnExpandToggle">
          <button onClick={this.handleClickToggle}>{expanded ? 'Show Less' : 'Show More'}</button>
         </div>
      </>
    );
  }
}
