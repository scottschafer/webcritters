import { observer } from "mobx-react";
import React, { useEffect } from "react";
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
  });

  return (
    <div className="App">

      <Row>
        <Col xs='9'>
          <SimulationBoard></SimulationBoard>
        </Col>
        <Col xs='3'>
          <SummaryView summary={simulationStore.summary}></SummaryView>
        </Col>
      </Row>
      <SettingsEditor settings={simulationStore.settings} onChange={simulationStore.setSettings}></SettingsEditor>
    </div>
  );
});

export default App;
