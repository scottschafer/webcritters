import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import ReactTooltip from 'react-tooltip';

import { simulationStore } from './SimulationUIStore';

import { SimulationBoard } from './components/SimulationBoard';
// import Row, Col, Container, Button from '@material-ui/core/Grid';
import { SummaryView } from './components/SummaryView';

// import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
import { Button, Container, Grid, Tab, Tabs } from '@material-ui/core';
import { SettingsEditorAdvanced, SettingsEditorBasic } from "./components/SettingsEditor";


const tabs = ['Settings', 'Advanced'];
enum eTabs {
  SettingsBasic,
  SettingsAdvanced
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

        <Grid container direction='column' spacing={3}>
        <Grid item xs={12}>
        <Grid item justify='center'>

          <Tabs
            centered
            value={selectedTab}
            onChange={handleChangeTab}
            indicatorColor="primary"
            textColor="primary">
            {tabs.map((title, i) => <Tab key={i} label={title} {...a11yProps(i)} selected={selectedTab === i} />)}
          </Tabs>
          </Grid>

          {
            (selectedTab === eTabs.SettingsBasic) && <div>
            <SettingsEditorBasic settings={simulationStore.settings} onChange={simulationStore.setSettings}/>
            </div>}
            {(selectedTab === eTabs.SettingsAdvanced) && <div>
            <SettingsEditorAdvanced settings={simulationStore.settings} onChange={simulationStore.setSettings}/>
          </div>}
          
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
        </Grid>
      </div >
  );
});

export default App;
