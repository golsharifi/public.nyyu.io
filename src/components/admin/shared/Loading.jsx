import * as React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function CircularIndeterminate() {
  return (
    <Box m={3} sx={{textAlign: 'center'}}>
      <CircularProgress sx={{color: '#23c865'}} />
      <p style={{color: '#23c865'}}>Loading . . .</p>
    </Box>
  );
}