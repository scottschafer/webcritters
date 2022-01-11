import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import ReactTooltip from 'react-tooltip';

import { simulationStore } from './SimulationUIStore';

import { SimulationBoard } from './components/SimulationBoard';
// import Row, Col, Container, Button from '@material-ui/core/Grid';
import { SummaryView } from './components/SummaryView';

// import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.scss";
import { Button, Container, Grid, Tab, Tabs } from '@material-ui/core';
import { SettingsEditorAdvanced, SettingsEditorBasic } from "./components/SettingsEditor";
import { GenealogyView } from "./components/GenealogyView";
import ReactResizeDetector from 'react-resize-detector'
import { ExplanatoryText } from './components/ExplanatoryText';

const tabs = ['Evolve' /*, 'Play' */, 'Tweak', 'Genealogy'];

export enum eAppMode {
  Evolve,
  Tweak,
  Genealogy,
  Play,
};

const App: React.FC = observer(() => {

  useEffect(() => {
    simulationStore.startSimulation();
    ReactTooltip.rebuild();
  });

  const [selectedTab, setSelectedTab] = useState(0);

  const handleChangeTab = (event, newValue: number) => {
    setSelectedTab(newValue);
    simulationStore.setAppMode(newValue)
  };

  function a11yProps(index) {
    return {
      id: `scrollable-auto-tab-${index}`,
      'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
  }

  return (
    <div className="App">
      <ReactTooltip />

      <div className='main-tabs-container'>
        <Tabs
          // centered
          value={selectedTab}
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary">
          {tabs.map((title, i) => <Tab key={i} label={title} {...a11yProps(i)} selected={selectedTab === i} />)}
        </Tabs>
      </div>

      <SimulationBoard />

      <ExplanatoryText/>

      <SummaryView
        selectedGenome={simulationStore.selectedGenome}
        selectedGenomeIndex={simulationStore.selectedGenomeIndex}
        onSelectGenome={simulationStore.handleSelectGenome}
        summary={simulationStore.summary}
        turn={simulationStore.turn} />
      {/* </Grid> */}

      {(selectedTab === eAppMode.Tweak) && <div className='Tweak'>
        <SettingsEditorAdvanced settings={simulationStore.settings} onChange={simulationStore.setSettings} />
      </div>}


      {false && <Grid container>

        <ReactTooltip />

        <Grid container>
          <Grid item xs={true}>
          </Grid>
          <Grid item xs={3}>
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

              {(selectedTab === eAppMode.Evolve) && <div>
                <SettingsEditorBasic settings={simulationStore.settings} onChange={simulationStore.setSettings} />
              </div>}


              {(selectedTab === eAppMode.Genealogy) && <div>
                <GenealogyView />
              </div>}
              {/* 
            <h2>TODO:</h2>
            <ul style={{ 'textAlign': 'left' }}>
              <li>Separate basic and advanced settings</li>
              <li>Info on individual settings</li>
              <li>Genome explorer (new #1 critter)</li>
              <li>Genealogy</li>
              <li>Load/save</li>
              <li>Play Vs Mode</li>
            </ul> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>}
    </div >
  );
});

export default App;
