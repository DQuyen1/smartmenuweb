import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import MainCard from 'ui-component/cards/MainCard';
import { Typography, Box, TextField, Button, Snackbar, Alert, Grid, CardMedia } from '@mui/material';

const TemplateDetails = () => {
  const location = useLocation();
  const { templateData } = location.state || {};
  const [updatedTemplateData, setUpdatedTemplateData] = useState(templateData || {});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Update local state when storeData changes (after a successful update)
    setUpdatedTemplateData(templateData);
  }, [templateData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUpdatedTemplateData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdateTemplate = async () => {
    try {
      const response = await axios.put(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates?templateId=${updatedTemplateData.templateId}`,
        updatedTemplateData
      );
      if (response.status === 200) {
        // Update storeData in location state (optional, but recommended)
        location.state.templateData = response.data;
        setUpdatedTemplateData(response.data);
        setOpenSnackbar(true);
        setSnackbarMessage('Template updated successfully!');
        setIsEditing(false); // Update local state
      } else {
        console.error('Error updating template:', response);
      }
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  return (
    <MainCard title="Template Details">
      {!isEditing ? (
        <Grid container spacing={2}>
          {' '}
          {/* Add Grid for better layout */}
          <Grid item xs={12} sm={4}>
            {/* Image Display */}
            <CardMedia
              component="img"
              sx={{
                maxWidth: 345, // Set a maximum width for the image
                height: 'auto', // Maintain aspect ratio
                borderRadius: 2 // Add rounded corners to the image
              }}
              image={templateData.templateImgPath}
              alt={templateData.templateName}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            {/* Template Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1">Template ID: {templateData.templateId}</Typography>
              <Typography variant="subtitle1">Brand ID: {templateData.brandId}</Typography>
              <Typography variant="subtitle1">Name: {templateData.templateName}</Typography>
              <Typography variant="subtitle1">Description: {templateData.templateDescription}</Typography>
              <Typography variant="subtitle1">
                Dimensions: {templateData.templateWidth} x {templateData.templateHeight}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="ID" name="templateId" value={updatedTemplateData.templateId} onChange={handleChange} fullWidth disabled />
          <TextField label="Name" name="templateName" value={updatedTemplateData.templateName} onChange={handleChange} fullWidth />
          <TextField
            label="Description"
            name="templateDescription"
            value={updatedTemplateData.templateDescription}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />
          {/* Add more details as needed (width, height, image, etc.) */}
          <Button variant="contained" onClick={handleUpdateTemplate}>
            Update
          </Button>
        </Box>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default TemplateDetails;
