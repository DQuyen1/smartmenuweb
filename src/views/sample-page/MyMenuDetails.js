import React, { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { Typography, Box, Snackbar, Alert, Divider, Button } from '@mui/material';
import MyMenuProductGroupDetails from './MyMenuProductGroupDetails';

const MenuDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { menuData } = location.state || {}; // Get menu data from location state
  // const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage] = useState('');

  return (
    <MainCard>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ textAlign: 'left', zIndex: 1, position: 'absolute' }}>
          Go Back
        </Button>
        <Typography
          variant="h1"
          sx={{
            textAlign: 'center',
            width: '100%',
            position: 'relative'
          }}
        >
          Menu Details
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ padding: 2, borderRadius: 2, border: '1px solid lightgrey' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
          Menu Name:
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 'normal', color: 'primary.main', ml: 1 }}>
          {menuData.menuName}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
          Description:
        </Typography>
        <Typography sx={{ fontWeight: 'normal', fontSize: '1rem', color: 'text.secondary', ml: 1, minHeight: '2rem', maxHeight: '4rem' }}>
          {menuData.menuDescription?.trim()
            ? menuData.menuDescription
            : 'Lorem ipsum dolor sit amet ipsum. Accusam nobis molestie et dolore sit sed. No et kasd blandit eirmod vero sed amet justo ipsum sadipscing invidunt consectetuer gubergren eos. Luptatum erat ipsum.'}
        </Typography>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <br />

      <Box sx={{ padding: 2, borderRadius: 2, border: '1px solid lightgrey' }}>
        <MyMenuProductGroupDetails menuDataId={menuData.menuId} />
      </Box>
    </MainCard>
  );
};

export default MenuDetails;
