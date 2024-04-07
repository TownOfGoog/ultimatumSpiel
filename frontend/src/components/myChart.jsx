
import { ChartContainer, BarPlot } from '@mui/x-charts';

export default function MyChart() {
  return (
    <ChartContainer
      width={500}
      height={300}
      series={[{ data: [4000, 3000, 2000, 2780, 1890, 2390, 3490], label: 'uv', type: 'bar' }]}
      xAxis={[{ scaleType: 'band', data: [
        'Page A',
        'Page B',
        'Page C',
        'Page D',
        'Page E',
        'Page F',
        'Page G',
      ] }]}
    >
      <BarPlot />
    </ChartContainer>
  );
}