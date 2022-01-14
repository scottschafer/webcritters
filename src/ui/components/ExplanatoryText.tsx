import React from "react";
import "./ExplanatoryText.scss";

export class ExplanatoryText extends React.Component {
  render() {
    return (
      <>
        <div className="ExplanatoryTextLogo">
          <table>
            <tr>
              <td>
                <img src="fledermoose-logo.jpg"/>
              </td>
              <td>
              <h1>Webcritters</h1>
              <h3>an evolutionary simulation</h3>
              <p><i>by Scott Schafer for Fledermoose Inc</i> </p>
              </td>
            </tr>
          </table>
        </div>
        <div className="ExplanatoryText">
          <div>
            <p>{`Welcome to the fast evolving world of Webcritters!`}</p>

            <p>
              {`On the left you'll see a rapidly moving and changing set of dots and colors. This is a grid containing
      evolving simulated lifeforms, or "critters". The circle is a magnifying glass, and you can drag it around to inspect the goings on.
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
          </div>
        </div>

        <div className="scrollMsg">scroll for more</div>
      </>
    );
  }
}
