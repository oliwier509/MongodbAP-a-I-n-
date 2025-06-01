import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { axisClasses, markElementClasses } from '@mui/x-charts';

const xLabels = ['13:30:14', '13:30:21', '13:30:28', '15:28:32', '15:28:39', '15:28:45'];

const Charts = ({ data }: { data: { temperature: string; pressure: string; humidity: string } | null }) => {
  const temperatureValue = parseFloat(data?.temperature || '0');
  const pressureValue = parseFloat(data?.pressure || '0');
  const humidityValue = parseFloat(data?.humidity || '0');

  // Repeat values to match the xLabels length
  const temperature = Array(xLabels.length).fill(temperatureValue);
  const pressure = Array(xLabels.length).fill(pressureValue);
  const humidity = Array(xLabels.length).fill(humidityValue);

  return (
    <LineChart
      width={1000}
      height={300}
      series={[
        {
          data: pressure.map((v) => v * 0.1), // scale as shown in legend
          label: 'Pressure x10 [hPa]',
          color: '#00e5ff',
          curve: 'linear',
          showMark: true,
          markerSize: 6,
        },
        {
          data: humidity,
          label: 'Humidity [%]',
          color: '#7cb342',
          curve: 'linear',
          showMark: true,
          markerSize: 6,
        },
        {
          data: temperature,
          label: 'Temperature [°C]',
          color: '#ff4081',
          curve: 'linear',
          showMark: true,
          markerSize: 6,
        },
      ]}
      xAxis={[
        {
          scaleType: 'point',
          data: xLabels,
          tickLabelStyle: { fill: '#ccc', fontSize: 12 },
        },
      ]}
      yAxis={[
        {
          min: 0,
          max: 120,
          tickLabelStyle: { fill: '#ccc', fontSize: 12 },
        },
      ]}
      grid={{ horizontal: true, vertical: false }}
      margin={{ top: 30, bottom: 50, left: 60, right: 20 }}
      legend={{
        direction: 'row',
        position: { vertical: 'bottom', horizontal: 'middle' },
        itemMarkWidth: 15,
        itemMarkHeight: 15,
        markGap: 10,
        itemGap: 30,
        labelStyle: { fill: '#aaa', fontSize: 14 },
      }}
      sx={{
        backgroundColor: '#111',
        borderRadius: 2,
        [`& .${axisClasses.root}`]: {
          stroke: '#555',
        },
        [`& .${axisClasses.grid}`]: {
          stroke: '#222',
        },
        [`& .${axisClasses.tickLabel}`]: {
          fill: '#aaa',
        },
        [`& .${markElementClasses.root}`]: {
          strokeWidth: 2,
          stroke: '#111',
        },
      }}
    />
  );
};

export default Charts;