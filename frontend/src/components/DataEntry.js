import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DataEntry = () => {
  const [formData, setFormData] = useState({
    device_id: '',
    heart_rate: '',
    blood_pressure: '',
    glucose_levels: '',
    oxygen_saturation: '',
    movement_activity: 'Normal',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const movementOptions = [
    'Normal',
    'Walking',
    'Sitting',
    'Lying',
    'No Movement'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.device_id) return 'Device ID is required';
    if (formData.heart_rate && (formData.heart_rate < 40 || formData.heart_rate > 200)) {
      return 'Heart rate should be between 40 and 200';
    }
    if (formData.oxygen_saturation && (formData.oxygen_saturation < 70 || formData.oxygen_saturation > 100)) {
      return 'Oxygen saturation should be between 70 and 100';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Add timestamp to the data
      const dataWithTimestamp = {
        ...formData,
        timestamp: new Date().toISOString(),
      };

      await axios.post('http://localhost:5000/api/health/add', dataWithTimestamp);
      setSuccess('Health data recorded successfully!');
      
      // Clear form after successful submission
      setFormData({
        device_id: formData.device_id, // Keep device ID
        heart_rate: '',
        blood_pressure: '',
        glucose_levels: '',
        oxygen_saturation: '',
        movement_activity: 'Normal',
        location: '',
      });

      // Navigate to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Health Data Entry
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Device ID"
                name="device_id"
                value={formData.device_id}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Heart Rate (BPM)"
                name="heart_rate"
                type="number"
                value={formData.heart_rate}
                onChange={handleChange}
                disabled={loading}
                InputProps={{ inputProps: { min: 40, max: 200 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Blood Pressure (mmHg)"
                name="blood_pressure"
                value={formData.blood_pressure}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., 120/80"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Glucose Levels (mg/dL)"
                name="glucose_levels"
                type="number"
                value={formData.glucose_levels}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Oxygen Saturation (%)"
                name="oxygen_saturation"
                type="number"
                value={formData.oxygen_saturation}
                onChange={handleChange}
                disabled={loading}
                InputProps={{ inputProps: { min: 70, max: 100 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Movement Activity"
                name="movement_activity"
                value={formData.movement_activity}
                onChange={handleChange}
                disabled={loading}
              >
                {movementOptions.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., Bedroom, Living Room"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Health Data'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default DataEntry; 