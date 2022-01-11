import React from "react";
import './ExplanatoryText.scss';

export class ExplanatoryText extends React.Component {

  render() {

    return <>
    <div className='ExplanatoryText'>
      <div>
      <h1>Webcritters</h1>
      <h3>an evolutionary simulation by Scott Schafer</h3>
      <p>
      {`Welcome to the fast evolving world of Webcritters!`}
      </p>

      <p>
      {`On the left you'll see a rapidly moving and changing set of dots and colors. This is a grid containing
      evolving, simulated lifeforms called "critters". The circle is a magnifying glass, and you can drag it around to inspect the goings on.
      You may wish to turn down the speed.`}
      </p>

      <p>
      {`The upper-right gives a running tally of the most populous critters by genome. It shows a randomly-assigned color, the genome, and the number
      of critters with that genome.`}
      </p>

      <p>
      {`Critters are very simple simulated lifeforms that share some common properties with actual biological organisms. They have energy
      which allows them to do this, such as move and reproduce. They have a "genetic" code which governs their form and behavior, and when
      they reproduce, their offspring may have mutations in the genetic code. The result - evolution!`}
      </p>

      <p>
      {`The form of a critter is simple, and somewhat reminiscent of the old Snake game. Each is a simply a one or more of dots in a chain, with a head that can
      be oriented up, right, down or left. They exist on a 256 x 256 grid. A critter cannot move over itself, another critter or a barrier.`}
      </p>

      <p>
      {`Critters can gain energy in two ways: they can Photosynthesize, or they can Eat. They will have one or
      more cells that are green, starting at the tail and extending up to the head and they gain energy each turn for every green cell. However, a critter can Eat
      to get energy from either a non-living food source or the green cell of another Critter if its head is directly pointing at a green cell.`}
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


      <p>
      {`There's more to come, when time and energy permit. Enjoy!`}
      </p>

      </div>
      </div>

      <div className='scrollMsg'>
        scroll for more
      </div>

     </>


  }
}
