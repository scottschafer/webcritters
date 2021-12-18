
import { observer } from 'mobx-react';
import React from "react";
import './InsertCritters.scss';

import { Box, Button, Card, createStyles, Dialog, DialogContent, Grid, makeStyles, Theme } from '@material-ui/core';

@observer
export class InsertCritters extends React.Component {

  onChangeValue = (evt: React.ChangeEvent<HTMLInputElement>) => {
  }

  render() {
    const data = {};

    return <Grid container className='ValuesEditorPanel'>
    </Grid>;
  }
}
