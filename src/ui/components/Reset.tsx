import React from "react";
import "./Reset.scss";
import { simulationStore } from '../SimulationUIStore';
import { eAppMode } from "../App";
import { SimulationSettings } from "../../simulation-code/SimulationSettings";


export class Reset extends React.Component {

  handleClickResetSettings = () => {
    simulationStore.setSettings(new SimulationSettings())
    simulationStore.setAppMode(eAppMode.Evolve)
  }

  handleClickResetCritters = () => {
    simulationStore.simulation.reset()
    simulationStore.setAppMode(eAppMode.Evolve)
  }


  handleClickResetAll = () => {
    simulationStore.setSettings(new SimulationSettings())
    simulationStore.simulation.reset()
    simulationStore.setAppMode(eAppMode.Evolve)
  }

  handleClickCancel = () => {
    simulationStore.setAppMode(eAppMode.Evolve)
  }

  render() {
    return (
      <div className='Reset'>
      <h1>Reset</h1>
      <table>
      <tr>
          <td><button onClick={this.handleClickResetSettings}>Reset Settings</button></td>
          <td>Reset settings to defaults, leaving critters alone</td>
        </tr>
        <tr>
          <td><button onClick={this.handleClickResetCritters}>Reset Critters</button></td>
          <td>Kill all critters, repopulate with "P" (photosynthesizing) only</td>
        </tr>
        <tr>
          <td><button onClick={this.handleClickResetAll}>Reset All</button></td>
          <td>Reset everything!</td>
        </tr>
        <tr>
          <td><button onClick={this.handleClickCancel}>Cancel</button></td>
        </tr>
      </table>
      </div>
    );
  }
}
