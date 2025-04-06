import React, { useEffect } from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AlertNotification = ({ alerts, onClose }) => {
  useEffect(() => {
    // Play sound for critical alerts
    if (alerts.length > 0) {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [alerts]);

  if (alerts.length === 0) return null;

  return (
    <div>
      {alerts.map((alert, index) => (
        <Snackbar
          key={alert.timestamp}
          open={true}
          autoHideDuration={10000}
          onClose={() => onClose(alert.timestamp)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ top: `${(index * 80) + 24}px` }}
        >
          <Alert
            onClose={() => onClose(alert.timestamp)}
            severity="error"
            sx={{ width: '100%' }}
          >
            <strong>{alert.event}</strong>
            <br />
            {new Date(alert.timestamp).toLocaleString()}
          </Alert>
        </Snackbar>
      ))}
    </div>
  );
};

export default AlertNotification; 