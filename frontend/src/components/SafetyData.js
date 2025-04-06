import React, { useState, useEffect } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  ListItemIcon,
  Pagination,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const ITEMS_PER_PAGE = 5;

const SafetyData = ({ data }) => {
  const [page, setPage] = useState(1);
  const [alerts, setAlerts] = useState([]);
  const [openAlerts, setOpenAlerts] = useState({});

  useEffect(() => {
    // Filter critical events (e.g., falls or no movement)
    const criticalEvents = data.filter(item => 
      item.event.toLowerCase().includes('fall: yes') ||
      item.event.toLowerCase().includes('no movement')
    );
    setAlerts(criticalEvents);
  }, [data]);

  const getEventIcon = (event) => {
    if (event.toLowerCase().includes('fall')) return <WarningIcon color="error" />;
    if (event.toLowerCase().includes('medication')) return <MedicalServicesIcon color="primary" />;
    if (event.toLowerCase().includes('movement')) return <DirectionsWalkIcon color="action" />;
    return <CheckCircleIcon color="success" />;
  };

  const getEventColor = (event) => {
    if (event.toLowerCase().includes('fall: yes') || event.toLowerCase().includes('no movement')) {
      return '#ffebee'; // Bright red background for critical events
    }
    if (event.toLowerCase().includes('fall: no')) {
      return '#f5f5f5'; // Light grey for normal events
    }
    if (event.toLowerCase().includes('movement')) {
      return '#e8f5e9'; // Light green for movement events
    }
    return '#fff3e0';
  };

  const handleAlertClose = (timestamp) => {
    setOpenAlerts(prev => ({ ...prev, [timestamp]: false }));
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedData = data.slice(startIndex, endIndex);

  return (
    <Box>
      {/* Critical Alerts Section */}
      {alerts.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom color="error" sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsActiveIcon sx={{ mr: 1 }} />
            Critical Alerts
          </Typography>
          {alerts.map((alert) => (
            <Collapse key={alert.timestamp} in={openAlerts[alert.timestamp] !== false}>
              <Alert
                severity="error"
                sx={{ mb: 1 }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => handleAlertClose(alert.timestamp)}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                <Typography variant="subtitle2">
                  {alert.event}
                </Typography>
                <Typography variant="caption">
                  {new Date(alert.timestamp).toLocaleString()}
                </Typography>
              </Alert>
            </Collapse>
          ))}
        </Box>
      )}

      {/* Recent Events Section */}
      <Typography variant="h6" gutterBottom>
        Recent Safety Events
      </Typography>
      <List>
        {displayedData.map((item) => (
          <ListItem
            key={item.timestamp}
            sx={{
              backgroundColor: getEventColor(item.event),
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: getEventColor(item.event).replace('e8', 'd5'),
              }
            }}
          >
            <ListItemIcon>
              {getEventIcon(item.event)}
            </ListItemIcon>
            <ListItemText
              primary={item.event}
              secondary={new Date(item.timestamp).toLocaleString()}
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
          count={Math.ceil(data.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={(e, newPage) => setPage(newPage)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default SafetyData; 