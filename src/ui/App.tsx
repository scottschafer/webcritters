import { observer } from "mobx-react";
import React, { useEffect } from "react";
import ReactTooltip from 'react-tooltip';

import { simulationStore } from './SimulationUIStore';
import { SettingsEditor } from './components/SettingsEditor';

import { SimulationBoard } from './components/SimulationBoard';
import { Row, Col } from 'react-bootstrap';
import { SummaryView } from './components/SummaryView';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";


const App: React.FC = observer(() => {

  useEffect(() => {
    simulationStore.startSimulation();
    ReactTooltip.rebuild();
  });

  return (
    <div className="App">
      <ReactTooltip />
      <Row>
        <Col xs='9'>
          <SimulationBoard></SimulationBoard>
        </Col>
        <Col xs='3'>
          <SummaryView
            selectedGenome={simulationStore.selectedGenome}
            selectedGenomeIndex={simulationStore.selectedGenomeIndex}
            onSelectGenome={simulationStore.handleSelectGenome}
            summary={simulationStore.summary} />
        </Col>
      </Row>

      <SettingsEditor settings={simulationStore.settings} onChange={simulationStore.setSettings}></SettingsEditor>

      <h2>TODO:</h2>
      <ul style={{ 'textAlign': 'left' }}>
        <li>Separate basic and advanced settings</li>
        <li>Info on individual settings</li>
        <li>Genome explorer (new #1 critter)</li>
        <li>Geneology</li>
        <li>Load/save</li>
        <li>Play Vs Mode</li>
      </ul>
    </div >
  );
});

export default App;
