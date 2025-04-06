import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  ListItemIcon,
  Pagination,
  Chip
} from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const ITEMS_PER_PAGE = 5;

const Reminders = ({ data }) => {
  const [page, setPage] = useState(1);
  const [upcomingReminders, setUpcomingReminders] = useState([]);

  useEffect(() => {
    // Filter and sort upcoming reminders
    const now = new Date();
    const upcoming = data
      .filter(item => {
        const reminderTime = new Date();
        const [hours, minutes] = item.time.split(':');
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0);
        return reminderTime > now;
      })
      .sort((a, b) => {
        const timeA = new Date();
        const timeB = new Date();
        const [hoursA, minutesA] = a.time.split(':');
        const [hoursB, minutesB] = b.time.split(':');
        timeA.setHours(parseInt(hoursA), parseInt(minutesA), 0);
        timeB.setHours(parseInt(hoursB), parseInt(minutesB), 0);
        return timeA - timeB;
      });
    
    setUpcomingReminders(upcoming);
  }, [data]);

  const getReminderIcon = (message) => {
    if (message.toLowerCase().includes('medication')) return <MedicationIcon color="primary" />;
    if (message.toLowerCase().includes('exercise')) return <FitnessCenterIcon color="success" />;
    if (message.toLowerCase().includes('hydration')) return <WaterDropIcon color="info" />;
    if (message.toLowerCase().includes('appointment')) return <EventIcon color="secondary" />;
    return <EventIcon />;
  };

  const getReminderColor = (message) => {
    if (message.toLowerCase().includes('medication')) {
      return '#e8f4fd'; // Light blue
    }
    if (message.toLowerCase().includes('exercise')) {
      return '#e8f5e9'; // Light green
    }
    if (message.toLowerCase().includes('hydration')) {
      return '#e3f2fd'; // Very light blue
    }
    if (message.toLowerCase().includes('appointment')) {
      return '#fce4ec'; // Light pink
    }
    return '#f5f5f5'; // Light grey
  };

  const getTimeUntil = (time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const reminderTime = new Date();
    reminderTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const diff = reminderTime - now;
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntil === 0) {
      return `In ${minutesUntil} minutes`;
    }
    return `In ${hoursUntil}h ${minutesUntil}m`;
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedData = upcomingReminders.slice(startIndex, endIndex);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <AccessTimeIcon sx={{ mr: 1 }} />
        Upcoming Reminders
      </Typography>
      <List>
        {displayedData.map((item, index) => (
          <ListItem
            key={index}
            sx={{
              backgroundColor: getReminderColor(item.message),
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: getReminderColor(item.message).replace('e8', 'd5'),
              }
            }}
          >
            <ListItemIcon>
              {getReminderIcon(item.message)}
            </ListItemIcon>
            <ListItemText
              primary={item.message}
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>Scheduled for: {item.time}</span>
                  <Chip 
                    label={getTimeUntil(item.time)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              }
              primaryTypographyProps={{
                fontWeight: 'medium',
                color: 'text.primary'
              }}
              secondaryTypographyProps={{
                color: 'text.secondary'
              }}
            />
          </ListItem>
        ))}
      </List>
      
      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(upcomingReminders.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default Reminders; 