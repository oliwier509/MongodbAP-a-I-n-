import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { axisClasses, markElementClasses } from '@mui/x-charts';

interface DeviceDataPoint {
  temperature: number;
  pressure: number;
  humidity: number;
  readingDate: string;
}

interface ChartsProps {
  dataPoints: DeviceDataPoint[];
}

const Charts: React.FC<ChartsProps> = ({ dataPoints }) => {
  const sortedData = dataPoints
    .slice()
    .sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());

  const xLabels = sortedData.map((d) =>
    new Date(d.readingDate).toLocaleTimeString('en-GB', { hour12: false })
  );

  const temperature = sortedData.map((d) => d.temperature);
  const pressure = sortedData.map((d) => d.pressure * 0.1);
  const humidity = sortedData.map((d) => d.humidity);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ minWidth: 1000 }}>
        <LineChart
          width={1000}
          height={300}
          series={[
            {
              data: pressure,
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
      </div>
    </div>
  );
};

export default Charts;