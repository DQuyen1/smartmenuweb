import React, { useState } from 'react';

import { useLocation } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { Typography, Box, Snackbar, Alert, Grid, TextField } from '@mui/material';
import MyCollectionProductGroupDetails from './MyCollectionProductGroupDetails';

const MyCollectionDetails = () => {
  const location = useLocation();
  const { collectionData } = location.state || {}; // Get menu data from location state
  // const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage] = useState('');

  return (
    <MainCard title={<Typography variant="h2">Collection Details</Typography>}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Collection Name"
                value={collectionData.collectionName}
                variant="outlined"
                fullWidth
                margin="normal"
                disabled
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'black', // Dùng cho Chrome và Safari
                    color: 'black' // Dùng cho các trình duyệt khác
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Collection Description"
                value={collectionData.collectionDescription}
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                disabled
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'black', // Dùng cho Chrome và Safari
                    color: 'black' // Dùng cho các trình duyệt khác
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <br />
      <hr />
      <MyCollectionProductGroupDetails collectionDataId={collectionData.collectionId} />
    </MainCard>
  );
};

export default MyCollectionDetails;
