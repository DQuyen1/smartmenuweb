import React, { useState } from 'react';

import { useLocation } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { Typography, Box, Snackbar, Alert } from '@mui/material';
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
        <Typography variant="h4" style={{ fontWeight: 'normal' }}>
          Menu Name: {menuData.menuName}
        </Typography>
        <Typography variant="h4" style={{ fontWeight: 'normal' }}>
          Description: {menuData.menuDescription}
        </Typography>
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
