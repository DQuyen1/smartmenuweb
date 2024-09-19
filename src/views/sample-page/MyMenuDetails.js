import React, { useState } from 'react';

import { useLocation } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { Typography, Box, Snackbar, Alert, Grid, TextField } from '@mui/material';
import MyMenuProductGroupDetails from './MyMenuProductGroupDetails';

const MenuDetails = () => {
  const location = useLocation();
  const { menuData } = location.state || {}; // Get menu data from location state
  // const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage] = useState('');

  return (
    <MainCard title="Menu Details">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box component="form" noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Menu Name"
                value={menuData.menuName}
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
                label="Menu Description"
                value={menuData.menuDescription}
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
      <MyMenuProductGroupDetails menuDataId={menuData.menuId} />
    </MainCard>
  );
};

export default MenuDetails;
