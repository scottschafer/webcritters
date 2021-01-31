import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { simulationStore } from './SimulationStore';
import { SettingsEditor } from './components/SettingsEditor';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import { SimulationBoard } from './components/SimulationBoard';
import { Row, Col } from 'react-bootstrap';
import { SummaryView } from './components/SummaryView';


const App: React.FC = observer(() => {

  useEffect(() => {
    simulationStore.startSimulation();
  });

  return (
    <div className="App">

      <Row>
        <Col>
          <SimulationBoard></SimulationBoard>
        </Col>
        <Col>
          <SummaryView summary={simulationStore.summary}></SummaryView>
        </Col>
      </Row>
      <SettingsEditor settings={simulationStore.settings} onChange={simulationStore.setSettings}></SettingsEditor>
    </div>
  );
});

export default App;
