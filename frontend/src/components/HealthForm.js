import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Slider,
  Switch,
  FormControlLabel,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Rating,
  TextareaAutosize,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Snackbar
} from '@mui/material';
import { Favorite, FavoriteBorder, SentimentVeryDissatisfied, SentimentDissatisfied, SentimentNeutral, SentimentSatisfied, SentimentVerySatisfied } from '@mui/icons-material';

const HealthForm = ({ userId, onSubmit }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    heartRate: '',
    bloodPressure: '',
    oxygenLevel: '',
    temperature: '',
    glucoseLevel: '',
    sleepHours: 7,
    activityLevel: 'Moderate',
    tookMedication: true,
    painLevel: 3,
    mood: 3,
    notes: ''
  });

  const activityLevels = [
    'Sedentary',
    'Light',
    'Moderate',
    'Active',
    'Very Active'
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (name) => (event, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (event) => {
    setFormData(prev => ({
      ...prev,
      tookMedication: event.target.checked
    }));
  };

  const validateForm = () => {
    if (!formData.heartRate || !formData.bloodPressure || !formData.oxygenLevel || !formData.temperature || !formData.glucoseLevel) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Store data in localStorage
      const healthData = {
        ...formData,
        userId,
        timestamp: new Date().toISOString()
      };
      
      const existingData = JSON.parse(localStorage.getItem('healthData') || '[]');
      existingData.push(healthData);
      localStorage.setItem('healthData', JSON.stringify(existingData));

      setSuccess(true);
      onSubmit();
      
      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to save health data');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Daily Health Check
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Vital Signs
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="heartRate"
                  label="Heart Rate (BPM)"
                  value={formData.heartRate}
                  onChange={handleChange}
                  helperText="Normal range: 60-100 BPM"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="bloodPressure"
                  label="Blood Pressure"
                  value={formData.bloodPressure}
                  onChange={handleChange}
                  helperText="Format: Systolic/Diastolic (e.g., 120/80)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="oxygenLevel"
                  label="Oxygen Level (%)"
                  value={formData.oxygenLevel}
                  onChange={handleChange}
                  helperText="Normal range: 95-100%"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="temperature"
                  label="Temperature (°F)"
                  value={formData.temperature}
                  onChange={handleChange}
                  helperText="Normal range: 97.0-99.0°F"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Additional Health Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="glucoseLevel"
                  label="Glucose Level (mg/dL)"
                  value={formData.glucoseLevel}
                  onChange={handleChange}
                  helperText="Normal range: 70-140 mg/dL"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography gutterBottom>Sleep Hours: {formData.sleepHours}</Typography>
                  <Slider
                    name="sleepHours"
                    value={formData.sleepHours}
                    onChange={handleSliderChange('sleepHours')}
                    min={0}
                    max={24}
                    step={0.5}
                    marks={[
                      { value: 0, label: '0h' },
                      { value: 12, label: '12h' },
                      { value: 24, label: '24h' }
                    ]}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Activity Level</InputLabel>
                  <Select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleChange}
                    label="Activity Level"
                  >
                    {activityLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.tookMedication}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label="Took All Medications Today"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Wellbeing Assessment
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Pain Level</Typography>
                <Rating
                  name="painLevel"
                  value={formData.painLevel}
                  onChange={(event, newValue) => {
                    handleChange({ target: { name: 'painLevel', value: newValue } });
                  }}
                  icon={<Favorite color="error" />}
                  emptyIcon={<FavoriteBorder />}
                  max={10}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom>Mood Today</Typography>
                <Rating
                  name="mood"
                  value={formData.mood}
                  onChange={(event, newValue) => {
                    handleChange({ target: { name: 'mood', value: newValue } });
                  }}
                  max={5}
                  icon={<SentimentVerySatisfied color="primary" />}
                  emptyIcon={<SentimentDissatisfied />}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="notes"
                  label="Additional Notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any health concerns or observations..."
                />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'SUBMIT HEALTH DATA'}
            </Button>
          </Box>
        </form>

        <Snackbar
          open={success}
          autoHideDuration={2000}
          onClose={handleCloseSuccess}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
            Health data submitted successfully! Redirecting to dashboard...
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default HealthForm; 