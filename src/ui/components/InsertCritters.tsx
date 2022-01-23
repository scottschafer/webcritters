import autoBind from "auto-bind";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import {
  GenomeCharToCode,
  GenomeCodeToInfo
} from "../../simulation-code/GenomeCode";
import { eAppMode } from "../App";
import { simulationStore } from "../SimulationUIStore";
import "./InsertCritters.scss";



@observer
export class InsertCritters extends React.Component {
  genome = "";
  allowableCodes = "";
  nukeFirst = false;
  insertCount = 1;

  constructor(p: any) {
    super(p);
    autoBind(this);
    makeObservable(this, { genome: observable, nukeFirst: observable, insertCount: observable });

    this.allowableCodes = Object.keys(GenomeCharToCode).join("");
  }

  handleClickInsert() {
    simulationStore.insertCritters(this.genome, this.insertCount, this.nukeFirst)
    simulationStore.setAppMode(eAppMode.Evolve);
  }

  handleChangeGenome(evt: React.ChangeEvent<HTMLInputElement>) {
    this.genome = evt.target.value
      .split("")
      .filter((value) => this.allowableCodes.includes(value))
      .join("");
  }

  handleChangeNukeFirst(evt: React.ChangeEvent<HTMLInputElement>) {
    this.nukeFirst = evt.target.checked;
  }

  handleChangeNumber(evt: React.ChangeEvent<HTMLInputElement>) {
    this.insertCount = evt.target.valueAsNumber;
  }

  handleCancel() {
    simulationStore.setAppMode(eAppMode.Evolve);
  }

  componentDidMount(): void {}

  render() {
    const getSortCode = code => {
      if (code >= 'A' && code <= 'Z') {
        return '0' + code;
      } else if (code >= 'a' && code <= 'z') {
        return '1' + code;
      } else {
        return '2' + code;
      }
    }
    const codes = Object.keys(GenomeCharToCode)
      .sort((a, b) => {
        return getSortCode(a).localeCompare(getSortCode(b))
      })
      .filter(
        (code) => GenomeCodeToInfo[GenomeCharToCode[code]].disabled !== true
      );

    return (
      <div className="InsertCritters">
        <h2>
          Enter a genome to insert. Can you improve on evolution?
        </h2>

        <input
          className='inputGenome'
          value={this.genome}
          onChange={this.handleChangeGenome}
          maxLength={20}
          placeholder="Enter instructions"
        ></input>

        {!!this.genome && (
          <span className='insertContainer'>
            <button
              onClick={() => this.handleClickInsert()}>
              Insert 
            </button>
            <input
              type="number"
              min={1}
              max={1000}
              value={this.insertCount}
              onChange={this.handleChangeNumber}
            />
            <label>
              <input
                type="checkbox"
                checked={this.nukeFirst}
                onChange={this.handleChangeNukeFirst}
              />
              Kill all others before insert
            </label>
          </span>
        )}
        <button className="cancel" onClick={this.handleCancel}>
          Cancel
        </button>

        <div className="description">
          <table>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Additional details</th>
            </tr>
            {codes.map((code) => (
              <tr key={code}>
                <td>{code}</td>
                <td>{GenomeCodeToInfo[GenomeCharToCode[code]].description}</td>
                <td>
                  <i>{GenomeCodeToInfo[GenomeCharToCode[code]].details}</i>
                </td>
              </tr>
            ))}
          </table>
        </div>
      </div>
    );
  }
}
