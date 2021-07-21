import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import ReactTooltip from 'react-tooltip';

import { simulationStore } from './SimulationUIStore';
import { SettingsEditor } from './components/SettingsEditor';

import { SimulationBoard } from './components/SimulationBoard';
// import Row, Col, Container, Button from '@material-ui/core/Grid';
import { SummaryView } from './components/SummaryView';

// import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import { Button, Container, Grid, Tab, Tabs } from '@material-ui/core';


const tabs = ['Settings'];
enum eTabs {
  Settings
};

const App: React.FC = observer(() => {

  useEffect(() => {
    simulationStore.startSimulation();
    ReactTooltip.rebuild();
  });

  const [selectedTab, setSelectedTab] = useState(0);

  const handleChangeTab = (event, newValue: number) => {
    setSelectedTab(newValue);
  };

  function a11yProps(index) {
    return {
      id: `scrollable-auto-tab-${index}`,
      'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
  }

  return (
    <div className="App">
      <Grid container>

        <ReactTooltip />

        <Grid container>
          <Grid item xs={true}>
            <SimulationBoard></SimulationBoard>
          </Grid>
          <Grid item xs={3}>
            <SummaryView
              selectedGenome={simulationStore.selectedGenome}
              selectedGenomeIndex={simulationStore.selectedGenomeIndex}
              onSelectGenome={simulationStore.handleSelectGenome}
              summary={simulationStore.summary} />
          </Grid>
        </Grid>

        <Grid container direction='column'>

          <Tabs
            value={selectedTab}
            onChange={handleChangeTab}
            indicatorColor="primary"
            textColor="primary"
            centered>
            {tabs.map((title, i) => <Tab key={i} label={title} {...a11yProps(i)} selected={selectedTab === i} />)}
          </Tabs>
          {
            (selectedTab === eTabs.Settings) && <div>
              <SettingsEditor settings={simulationStore.settings} onChange={simulationStore.setSettings}></SettingsEditor>
            </div>
          }

          <h2>TODO:</h2>
          <ul style={{ 'textAlign': 'left' }}>
            <li>Separate basic and advanced settings</li>
            <li>Info on individual settings</li>
            <li>Genome explorer (new #1 critter)</li>
            <li>Geneology</li>
            <li>Load/save</li>
            <li>Play Vs Mode</li>
          </ul>
        </Grid>
      </Grid>
    </div >
  );
});

export default App;
