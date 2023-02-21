import React from 'react'
import {Paper, Typography} from "@material-ui/core";

export function Line() {
  return (
    <hr
      style={{
        color: 'lightgray',
        backgroundColor: 'lightgray',
        height: '0.1px',
        width: 'auto'
      }}
    />
  )
}

export function Example({classes, inputs, outputs}) {
  return (
    <Paper variant="outlined" square elevation={0} className={classes.examplePaper}>
      <Typography variant='h6'> input </Typography>
      <Line/>
      {inputs.map((input, key) => <Typography key={key}> {input} </Typography>)}
      <Typography variant='h6'> output </Typography>
      <Line/>
      {outputs.map((output, key) => <Typography key={key}> {output} </Typography>)}
    </Paper>
  )
}

const toExport = {
  Example,
  Line
}

export default toExport