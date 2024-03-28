import React from 'react';
import { Grid } from '@mui/joy';

export default function MyGrid({...props}) {
  //this exists so that when woring in a development environment, the grid will have a random color
  const isDevelopment = process.env.NODE_ENV === 'development';

  //generate a random color
  const randomColor =  isDevelopment ? '#' + Math.floor(Math.random()*16777215).toString(16) : 'auto';
  
  // const style = { ...props.style, backgroundColor: randomColor };
  const sx = { display: 'flex', height: '100%', ...props.sx, backgroundColor: randomColor}
  return <Grid {...props} sx={sx} >{props.children}</Grid>;
}
