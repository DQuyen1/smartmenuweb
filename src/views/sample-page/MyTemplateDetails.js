import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainCard from 'ui-component/cards/MainCard';
import {
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  Grid,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

const MyTemplateDetails = () => {
  const location = useLocation();
  const { templateId } = location.state || {};
  const navigate = useNavigate();
  const [templateData, setTemplateData] = useState({});
  const [updatedTemplateData, setUpdatedTemplateData] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    const fetchTemplateDetails = async () => {
      try {
        const response = await axios.get(`http://3.1.81.96/api/Templates?templateId=${templateId}`);
        if (response.status === 200) {
          setTemplateData(response.data[0]);
          setUpdatedTemplateData(response.data[0]);
        } else {
          console.error('Error fetching template details:', response);
        }
      } catch (error) {
        console.error('Error fetching template details:', error);
      }
    };
    fetchTemplateDetails();
  }, [templateId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'dimension') {
      const [width, height] = value.split(' x ').map(Number);
      setUpdatedTemplateData((prevData) => ({
        ...prevData,
        templateWidth: width,
        templateHeight: height
      }));
    } else {
      setUpdatedTemplateData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      const response = await axios.put(`http://3.1.81.96/api/Templates/${updatedTemplateData.templateId}`, updatedTemplateData);
      if (response.status === 200) {
        setTemplateData(updatedTemplateData);
        setOpenSnackbar(true);
        setSnackbarMessage('Template updated successfully!');
        setOpenEditDialog(false); // Close dialog
      } else {
        console.error('Error updating template:', response);
        setSnackbarMessage('Failed to update template.');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      setSnackbarMessage('Error updating template.');
      setOpenSnackbar(true);
    }
  };

  return (
    <MainCard title={<Typography variant="h5">Template Details</Typography>}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          {/* Image Display */}
          <CardMedia
            component="img"
            sx={{
              maxWidth: 345,
              height: 'auto',
              borderRadius: 2
            }}
            image={templateData.templateImgPath}
            alt={templateData.templateName}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          {/* Template Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle1">Name: {templateData.templateName}</Typography>
              <Typography variant="subtitle1">Description: {templateData.templateDescription}</Typography>
              <Typography variant="subtitle1">
                Dimensions: {templateData.templateWidth} x {templateData.templateHeight}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="contained" color="secondary" onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button variant="contained" onClick={() => setOpenEditDialog(true)} color="primary">
                Edit
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} aria-labelledby="edit-template-dialog-title">
        <DialogTitle id="edit-template-dialog-title">Edit Template</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="templateName"
            value={updatedTemplateData.templateName}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            label="Description"
            name="templateDescription"
            value={updatedTemplateData.templateDescription}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            sx={{ mt: 2 }}
          />
          {/* <Select
            label="Dimensions"
            name="dimension"
            value={`${updatedTemplateData.templateWidth} x ${updatedTemplateData.templateHeight}`}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          >
            <MenuItem value="900 x 1600">Vertical (900 x 1600)</MenuItem>
            <MenuItem value="1600 x 900">Horizontal (1600 x 900)</MenuItem>
          </Select> */}
          <TextField
            label="Dimensions"
            name="dimension"
            value={`${updatedTemplateData.templateWidth} x ${updatedTemplateData.templateHeight}`}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
            select
            SelectProps={{
              native: true
            }}
          >
            <option value="900 x 1600">Vertical (900 x 1600)</option>
            <option value="1600 x 900">Horizontal (1600 x 900)</option>
          </TextField>
          <TextField
            label="Image Path"
            name="templateImgPath"
            value={updatedTemplateData.templateImgPath}
            onChange={handleChange}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateTemplate} color="success">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbarMessage.includes('Error') ? 'error' : 'success'} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default MyTemplateDetails;
