
import React, { useState } from 'react';

import { useLocation } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import {
  Typography,
  Box,
  Snackbar,
  Alert,

} from '@mui/material';
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
        <Typography variant="h4" style={{ fontWeight: 'normal' }}>Collection ID: {collectionData.collectionId}</Typography>
        <Typography variant="h4" style={{ fontWeight: 'normal' }}>Brand ID: {collectionData.brandId}</Typography>
        <Typography variant="h4" style={{ fontWeight: 'normal' }}>Name: {collectionData.collectionName}</Typography>
        <Typography variant="h4" style={{ fontWeight: 'normal' }}>Description: {collectionData.collectionDescription}</Typography>
      </Box>


      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <br/>
      <hr/>
      <MyCollectionProductGroupDetails collectionDataId={collectionData.collectionId}/>
    </MainCard>
  );
};

export default MyCollectionDetails;
