import { observer } from 'mobx-react';
import React from "react";
import { Settings } from '../simulation-code/Settings';
import { ValuesEditorPanel, ValuesEditorPanelFieldDefs } from './ValuesEditorPanel';

const settingsFields: ValuesEditorPanelFieldDefs = [

  {
    label: 'Speed',
    fieldName: 'speed',
    type: 'range',
    minValue: 0,
    maxValue: 11
  },

  {
    label: 'Lifespan per cell',
    fieldName: 'lifespanPerCell',
    type: 'range',
    minValue: 10,
    maxValue: 10000
  },

  {
    label: 'Spawn energy per cell',
    fieldName: 'spawnEnergyPerCell',
    type: 'range',
    minValue: 10,
    maxValue: 1000
  },


  {
    label: 'Mutation rate',
    fieldName: 'mutationRate',
    type: 'range',
    minValue: 0,
    maxValue: 100
  },

  {
    label: 'Cannibalism',
    fieldName: 'cannibalism',
    type: 'boolean'
  }
];

class SettingsEditorProps {
  readonly settings: Settings;
  readonly onChange: (data: object) => void;
}

@observer
export class SettingsEditor extends React.Component<SettingsEditorProps> {

  render() {
    return (
      <ValuesEditorPanel
        fieldsToEdit={settingsFields}
        data={this.props.settings}
        onChange={this.props.onChange}></ValuesEditorPanel>
    )
  }
}
