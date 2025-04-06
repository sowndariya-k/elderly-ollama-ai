import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  Favorite,
  LocalHospital,
  RemoveRedEye,
  Warning,
  Add
} from '@mui/icons-material';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [healthData, setHealthData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = localStorage.getItem('healthData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const userHealthData = parsedData.filter(data => data.userId === userId);
          setHealthData(userHealthData);
        }
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [userId]);

  const renderVitalSigns = () => {
    if (healthData.length === 0) return null;
    const latest = healthData[healthData.length - 1];

    const getStatus = () => {
      if (latest.oxygenLevel < 90) return 'DANGER';
      if (latest.oxygenLevel < 95) return 'WARNING';
      return 'NORMAL';
    };

    return (
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Latest Vital Signs</Typography>
          <Grid container spacing={4}>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Favorite color="error" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Heart Rate</Typography>
                  <Typography variant="h6">{latest.heartRate} BPM</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalHospital color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Blood Pressure</Typography>
                  <Typography variant="h6">{latest.bloodPressure}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RemoveRedEye color="info" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Oxygen Level</Typography>
                  <Typography variant="h6">{latest.oxygenLevel}%</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Typography 
                    variant="h6" 
                    color={getStatus() === 'DANGER' ? 'error' : getStatus() === 'WARNING' ? 'warning' : 'success'}
                  >
                    {getStatus()}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderHealthTrends = () => {
    if (healthData.length === 0) return null;

    const data = {
      labels: healthData.map(d => new Date(d.timestamp).toLocaleDateString()),
      datasets: [
        {
          label: 'Heart Rate',
          data: healthData.map(d => d.heartRate),
          borderColor: '#f44336',
          tension: 0.1
        },
        {
          label: 'Oxygen Level',
          data: healthData.map(d => d.oxygenLevel),
          borderColor: '#2196f3',
          tension: 0.1
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: '#f5f5f5'
          }
        },
        x: {
          grid: {
            color: '#f5f5f5'
          }
        }
      }
    };

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Health Trends</Typography>
              <Line data={data} options={options} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Reminders & Tasks</Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  sx={{ backgroundColor: '#2196f3' }}
                >
                  ADD REMINDER
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {renderVitalSigns()}
      {renderHealthTrends()}
    </Box>
  );
};

export default Dashboard; 