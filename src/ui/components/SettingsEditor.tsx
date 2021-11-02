import { observer } from 'mobx-react';
import React from "react";
import { SimulationSettings } from '../../simulation-code/SimulationSettings';
import { ValuesEditorPanel, ValuesEditorPanelFieldDefs } from './ValuesEditorPanel';

// type SettingsEditorPanelFieldDefs = Array<{
//   label: string;
//   suffix?: string;
//   fieldName: keyof SimulationSettings;
//   type: 'range' | 'boolean' | 'options';
//   minValue?: number;
//   maxValue?: number;
//   step?: number;
//   options?: Array<{ label: string, value: (string | number | boolean) }>;
// }>;;


// @observable timer1Length = 10;
// @observable timer2Length = 20;

// @observable sightDistance = 50;

// @observable limitCellLength = 5;

// @observable addFoodCount = 150; //100;


const settingsFieldsBasic: ValuesEditorPanelFieldDefs = [

  {
    label: 'Speed',
    fieldName: 'speed',
    type: 'range',
    minValue: 0,
    maxValue: 11,
    tooltip: 'Controls the speed of the simulation, from 0 (stopped) to 11 (fast as possible)'
  },
  {
    label: 'Barriers',
    fieldName: 'barriers',
    type: 'boolean'
  },
  {
    label: 'Mutation rate',
    fieldName: 'mutationRate',
    type: 'range',
    minValue: 0,
    maxValue: 50
  },

  {
    label: 'Death rays',
    fieldName: 'deathRays',
    type: 'range',
    minValue: 0,
    maxValue: 4
  },

];

const settingsFieldsAdvanced: ValuesEditorPanelFieldDefs = [
  {
    label: 'Lifespan per cell',
    fieldName: 'lifespanPerCell',
    type: 'range',
    minValue: 10,
    maxValue: 1000
  },
  {
    label: 'Spawn energy per cell',
    fieldName: 'spawnEnergyPerCell',
    type: 'range',
    minValue: 10,
    maxValue: 1000
  },
  {
    label: 'Turn cost',
    fieldName: 'turnCost',
    type: 'range',
    minValue: 0,
    maxValue: 5,
    step: .1
  },
  {
    label: 'Base instruction cost',
    fieldName: 'baseInstructionCost',
    type: 'range',
    minValue: 0,
    maxValue: 2,
    step: .01
  },

  {
    label: 'Move cost',
    fieldName: 'moveCost',
    type: 'range',
    minValue: 0,
    maxValue: 100
  },
  {
    label: 'Photosynthesis Energy',
    fieldName: 'photoSynthesisEnergy',
    type: 'range',
    minValue: 0,
    maxValue: 10,
    step: .1
  },

  {
    label: 'Eat cost',
    fieldName: 'eatCost',
    type: 'range',
    minValue: 0,
    maxValue: 50
  },
  {
    label: 'Digestion efficiency',
    fieldName: 'digestionEfficiencyPercent',
    type: 'range',
    minValue: 0,
    maxValue: 100,
    suffix: '%'
  },
  {
    label: 'Bite strength',
    fieldName: 'biteStrength',
    type: 'range',
    minValue: 0,
    maxValue: 10,
    step: .1
  },
  {
    label: 'Sleep count',
    fieldName: 'sleepCount',
    type: 'range',
    minValue: 1,
    maxValue: 20,
  },

  {
    label: 'Sight distance',
    fieldName: 'sightDistance',
    type: 'range',
    minValue: 1,
    maxValue: 256,
  },
  {
    label: 'Max cells',
    fieldName: 'limitCellLength',
    type: 'range',
    minValue: 1,
    maxValue: 20,
  },
  {
    label: 'Add food',
    fieldName: 'addFoodCount',
    type: 'range',
    minValue: 0,
    maxValue: 500,
  },
  {
    label: 'Allow Cannibalism',
    fieldName: 'allowCannibalism',
    type: 'boolean'
  },
  {
    label: 'Show preview',
    fieldName: 'showPreview',
    type: 'boolean'
  }];

class SettingsEditorProps {
  readonly settings: SimulationSettings;
  readonly onChange: (data: object) => void;
}

@observer
export class SettingsEditorBasic extends React.Component<SettingsEditorProps> {

  render() {
    return (
      <>
        <ValuesEditorPanel
          fieldsToEdit={settingsFieldsBasic}
          data={this.props.settings}
          onChange={this.props.onChange}></ValuesEditorPanel>
      </>
    )
  }
}

@observer
export class SettingsEditorAdvanced extends React.Component<SettingsEditorProps> {

  render() {
    return (
      <>
        <ValuesEditorPanel
          fieldsToEdit={settingsFieldsAdvanced}
          data={this.props.settings}
          onChange={this.props.onChange}></ValuesEditorPanel>
      </>
    )
  }
}
