import {Grid, Typography} from '@material-ui/core'
import {Line, Example} from './Example'

export function Problem({title, classes, description, input, output, tests}) {
  const examplein = tests.examplein
  const exampleout = tests.exampleout  
  const list = examplein.map((example, id) => <Example key={id} classes={classes} inputs={[example]} outputs={[exampleout[id]]}/>)
    

  return (
    <>
      <Typography variant='h3' gutterBottom> {title} </Typography>
      <Line/>
      {description.map((desc, key) => <Typography key={key} paragraph> {desc} </Typography>)}
      <Typography variant='h4' gutterBottom> Input </Typography>
      {input.map((inp, key) => <Typography key={key} paragraph> {inp} </Typography>)}
      <Typography variant='h4' gutterBottom> Output </Typography>
      {output.map((out, key) => <Typography key={key} paragraph> {out} </Typography>)}
      <Typography variant='h4' gutterBottom> Examples </Typography>
      <Grid container>
        <Grid item xs={12}>
          {list}          
        </Grid>
      </Grid>
    </>
  )
}

export default Problem
