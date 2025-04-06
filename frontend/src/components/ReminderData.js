import React from 'react';
import { List, ListItem, ListItemText, Typography, Box, ListItemIcon } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const ReminderData = ({ data }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Daily Reminders
      </Typography>
      <List>
        {data.map((item) => (
          <ListItem
            key={item.id}
            sx={{
              backgroundColor: '#e8f4fd',
              borderRadius: 1,
              mb: 1,
              '&:hover': {
                backgroundColor: '#d0e8f7',
              }
            }}
          >
            <ListItemIcon>
              <AccessTimeIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={item.message}
              secondary={item.time}
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
    </Box>
  );
};

export default ReminderData; 