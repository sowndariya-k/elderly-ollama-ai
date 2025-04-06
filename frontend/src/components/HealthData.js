import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HealthData = ({ data }) => {
  // Prepare data for charts
  const timestamps = data.map(item => new Date(item.timestamp).toLocaleTimeString());
  const heartRates = data.map(item => item.heart_rate);
  const oxygenLevels = data.map(item => item.oxygen_saturation);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const heartRateData = {
    labels: timestamps,
    datasets: [
      {
        label: 'Heart Rate',
        data: heartRates,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const oxygenData = {
    labels: timestamps,
    datasets: [
      {
        label: 'Oxygen Saturation (%)',
        data: oxygenLevels,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const getLatestReadings = () => {
    if (data.length === 0) return null;
    const latest = data[0];
    return (
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Heart Rate
            </Typography>
            <Typography variant="h4" color="primary">
              {latest.heart_rate}
            </Typography>
            <Typography variant="caption">BPM</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Oxygen Saturation
            </Typography>
            <Typography variant="h4" color="info.main">
              {latest.oxygen_saturation}
            </Typography>
            <Typography variant="caption">%</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Blood Pressure
            </Typography>
            <Typography variant="h4" color="error.main">
              {latest.blood_pressure}
            </Typography>
            <Typography variant="caption">mmHg</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Glucose Level
            </Typography>
            <Typography variant="h4" color="warning.main">
              {latest.glucose_levels}
            </Typography>
            <Typography variant="caption">mg/dL</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Health Monitoring
      </Typography>
      
      {getLatestReadings()}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Line options={chartOptions} data={heartRateData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Line options={chartOptions} data={oxygenData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HealthData; 