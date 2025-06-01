import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Charts from './components/Charts';

import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpacityIcon from '@mui/icons-material/Opacity';

const DEVICE_COUNT = 16;

const devices = Array.from({ length: DEVICE_COUNT }, (_, id) => ({
  id,
  data: id % 4 === 0 ? { temperature: '21.5', pressure: '992.3', humidity: '28.2' } : null,
}));

const App = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState(0);
  const selectedDevice = devices.find((d) => d.id === selectedDeviceId);

  return (
    <>
      <Navbar />
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              sx={{
                backgroundColor: '#00bcd4',
                color: 'white',
                height: '100%',
              }}
            >
              <CardContent>
                <Typography variant="h6">Device No. {selectedDeviceId}</Typography>
                {selectedDevice?.data ? (
                  <>
                    <Typography variant="body1">
                      <DeviceThermostatIcon /> {selectedDevice.data.temperature} °C
                    </Typography>
                    <Typography variant="body1">
                      <CloudUploadIcon /> {selectedDevice.data.pressure} hPa
                    </Typography>
                    <Typography variant="body1">
                      <OpacityIcon /> {selectedDevice.data.humidity}%
                    </Typography>
                  </>
                ) : (
                  <Typography>No data</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={12} md={9.6}>
            <Paper sx={{ backgroundColor: '#111', p: 2 }}>
              <Typography variant="h6" color="white" gutterBottom>
                Device No. {selectedDeviceId}
              </Typography>
              <Box mt={2}>
                <Charts data={selectedDevice?.data} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
        <Box
          mt={3}
          sx={{
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            pb: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              minHeight: 200,
              pr: 2,
            }}
          >
            {devices.map((device) => (
              <Card
                key={device.id}
                sx={{
                  backgroundColor:
                    device.id === selectedDeviceId ? '#00bcd4' : '#1e1e1e',
                  color: 'white',
                  width: 230,
                  flex: '0 0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardActionArea
                  onClick={() => setSelectedDeviceId(device.id)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">Device No. {device.id}</Typography>
                    {device.data ? (
                      <>
                        <Typography variant="body1">
                          <DeviceThermostatIcon /> {device.data.temperature} °C
                        </Typography>
                        <Typography variant="body1">
                          <CloudUploadIcon /> {device.data.pressure} hPa
                        </Typography>
                        <Typography variant="body1">
                          <OpacityIcon /> {device.data.humidity}%
                        </Typography>
                      </>
                    ) : (
                      <Typography>No data</Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default App;