import React, { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Charts from './components/Charts';
import LoginForm from './components/Login';
import SignUpForm from './components/SignUpForm';
import { io, Socket } from 'socket.io-client';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Button,
} from '@mui/material';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpacityIcon from '@mui/icons-material/Opacity';
import { isExpired } from 'react-jwt';

import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import config from './config';

let DEVICE_COUNT = config.devices;

interface DeviceDataPoint {
  temperature: number;
  pressure: number;
  humidity: number;
  readingDate: string;
}

interface Device {
  id: number;
  dataPoints: DeviceDataPoint[];
}

const AppContent = () => {
  const [devices, setDevices] = useState<Device[]>(
    Array.from({ length: DEVICE_COUNT }, (_, id) => ({
      id,
      dataPoints: [],
    }))
  );

  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(0);
  const [combinedPastHourData, setCombinedPastHourData] = useState<DeviceDataPoint[] | null>(null);

  const selectedDevice = selectedDeviceId !== null ? devices.find((d) => d.id === selectedDeviceId) : null;

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const tokenExpired = !token || isExpired(token);

  useEffect(() => {
    if (tokenExpired) return;

    const socket: Socket = io(`${config.apiBaseUrl}`, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to socket.io server');
    });

    socket.on('disconnect', () => {
      console.warn('Disconnected from socket.io server');
    });

    socket.on('new_device_data', ({ deviceId, data }: { deviceId: number; data: DeviceDataPoint }) => {
      const parsedDataPoint = {
        temperature: Number(data.temperature),
        pressure: Number(data.pressure),
        humidity: Number(data.humidity),
        readingDate: data.readingDate,
      };

      setDevices((prevDevices) =>
        prevDevices.map((device) => {
          if (device.id !== deviceId) return device;

          const newDataPoints = [...device.dataPoints, parsedDataPoint];
          newDataPoints.sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());

          return {
            ...device,
            dataPoints: newDataPoints,
          };
        })
      );

      setCombinedPastHourData((prevCombined) => {
        if (prevCombined === null) return prevCombined;

        const updated = [...prevCombined, parsedDataPoint];

        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        const filtered = updated.filter(d => new Date(d.readingDate).getTime() >= oneHourAgo);
        filtered.sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());

        return filtered;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [tokenExpired]);

  useEffect(() => {
    if (tokenExpired) {
      if (location.pathname !== '/login' && location.pathname !== '/signup') {
        navigate('/login');
      }
      return;
    }

    const initializeDeviceData = async () => {
      const deviceDataPromises = Array.from({ length: DEVICE_COUNT }, (_, id) => fetchDeviceData(id));
      const results = await Promise.all(deviceDataPromises);

      setDevices((prevDevices) =>
        prevDevices.map((device, i) => ({
          ...device,
          dataPoints: results[i].sort(
            (a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime()
          ),
        }))
      );
    };

    initializeDeviceData();
  }, [tokenExpired, navigate, location.pathname]);

  const fetchDeviceData = async (deviceId: number): Promise<DeviceDataPoint[]> => {
    if (tokenExpired) return [];
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/data/${deviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch data for device ${deviceId}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const fetchCombinedPastHourData = async () => {
    if (tokenExpired) return;
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const dataPromises = Array.from({ length: DEVICE_COUNT }, (_, id) =>
        fetch(`${config.apiBaseUrl}/api/data/${id}/latest?period=1h`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(async (res) => {
          if (!res.ok) return [];
          return res.json();
        })
      );

      const results = await Promise.all(dataPromises);

      let combined: DeviceDataPoint[] = [];
      results.forEach((deviceData: DeviceDataPoint[]) => {
        combined = combined.concat(deviceData);
      });

      combined = combined.filter(
        (d) => new Date(d.readingDate).getTime() >= oneHourAgo.getTime()
      );

      combined.sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());

      setCombinedPastHourData(combined);

      setSelectedDeviceId(null);
    } catch (error) {
      console.error('Failed to fetch combined past hour data', error);
    }
  };

  const handleViewPastHour = () => {
    fetchCombinedPastHourData();
  };

  const handleSelectDevice = (id: number) => {
    setSelectedDeviceId(id);
    setCombinedPastHourData(null);
  };

  const dashboard = (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#00bcd4', color: 'white', height: '100%' }}>
            <CardContent>
              {combinedPastHourData ? (
                <>
                  <Typography variant="h6">Combined Devices Past Hour</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Showing combined data from all devices over the past hour.
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      setCombinedPastHourData(null);
                      setSelectedDeviceId(0);
                    }}
                  >
                    Back to Device View
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="h6">Device No. {selectedDeviceId}</Typography>
                  {selectedDevice?.dataPoints.length ? (
                    <>
                      <Typography variant="body1">
                        <DeviceThermostatIcon />{' '}
                        {selectedDevice.dataPoints[selectedDevice.dataPoints.length - 1].temperature} °C
                      </Typography>
                      <Typography variant="body1">
                        <CloudUploadIcon />{' '}
                        {selectedDevice.dataPoints[selectedDevice.dataPoints.length - 1].pressure} hPa
                      </Typography>
                      <Typography variant="body1">
                        <OpacityIcon /> {selectedDevice.dataPoints[selectedDevice.dataPoints.length - 1].humidity}%
                      </Typography>
                    </>
                  ) : (
                    <Typography>No data</Typography>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={9.6}>
          <Paper sx={{ backgroundColor: '#111', p: 2 }}>
            <Typography variant="h6" color="white" gutterBottom>
              {combinedPastHourData
                ? 'Combined Devices Past Hour'
                : `Device No. ${selectedDeviceId}`}
            </Typography>
            <Box mt={2}>
              <Charts dataPoints={combinedPastHourData || selectedDevice?.dataPoints || []} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {!combinedPastHourData && (
        <Box mt={3} sx={{ overflowX: 'auto', whiteSpace: 'nowrap', pb: 1 }}>
          <Box sx={{ display: 'flex', gap: 2, minHeight: 200, pr: 2 }}>
            {devices.map((device) => {
              const dataPoints = device.dataPoints;
              const latest = dataPoints[dataPoints.length - 1];
              const previous = dataPoints[dataPoints.length - 2];
              const isSignificantChange = (latestVal: number, prevVal: number) => {
                if (prevVal === 0) return false;
                const diff = Math.abs(latestVal - prevVal);
                return diff / prevVal >= 0.2;
              };
              let isAlert = false;
              if (latest && previous) {
                if (
                  isSignificantChange(latest.temperature, previous.temperature) ||
                  isSignificantChange(latest.pressure, previous.pressure) ||
                  isSignificantChange(latest.humidity, previous.humidity)
                ) {
                  isAlert = true;
                }
              }

              return (
                <Card
                  key={device.id}
                  sx={{
                    backgroundColor:
                      device.id === selectedDeviceId
                        ? isAlert
                          ? '#d32f2f'
                          : '#00bcd4'
                        : isAlert
                        ? '#b71c1c'
                        : '#1e1e1e',
                    color: 'white',
                    width: 230,
                    flex: '0 0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardActionArea
                    onClick={() => handleSelectDevice(device.id)}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">Device No. {device.id}</Typography>
                      {dataPoints.length ? (
                        <>
                          <Typography variant="body1">
                            <DeviceThermostatIcon /> {latest.temperature} °C
                          </Typography>
                          <Typography variant="body1">
                            <CloudUploadIcon /> {latest.pressure} hPa
                          </Typography>
                          <Typography variant="body1">
                            <OpacityIcon /> {latest.humidity}%
                          </Typography>
                        </>
                      ) : (
                        <Typography>No data</Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <Navbar onViewPastHour={handleViewPastHour} />
      <Routes>
        <Route path="/" element={dashboard} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
