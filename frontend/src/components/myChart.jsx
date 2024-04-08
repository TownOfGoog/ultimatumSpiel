import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

export default function MyChart({...props}) {
  return (
    <BarChart
      {...props}
      width={600}
      height={430}
    />
  );
}