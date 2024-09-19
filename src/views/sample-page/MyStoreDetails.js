import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import axios from 'axios';
import {
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

const StoreDetails = () => {
  const location = useLocation();
  const { storeId } = location.state;
  const navigate = useNavigate();
  const [storeData, setStoreData] = useState(null);
  const [editingStoreData, setEditingStoreData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const validateUpdatedStoreData = () => {
    const errors = {};
    if (!editingStoreData.storeName.trim()) {
      errors.storeName = 'Store name is required';
    }
    if (!editingStoreData.storeLocation.trim()) {
      errors.storeLocation = 'Store location is required';
    }
    if (!editingStoreData.storeContactEmail.trim()) {
      errors.storeContactEmail = 'Store contact email is required';
    }
    if (!editingStoreData.storeContactNumber.trim()) {
      errors.storeContactNumber = 'Store contact number is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        const storeResponse = await axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores?storeId=${storeId}`);
        setStoreData(storeResponse.data[0]);
        setEditingStoreData(storeResponse.data[0]);
      } catch (error) {
        console.error('Error fetching store details:', error);
        Toastify({
          text: `Error: ${error.message}`,
          duration: 3000,
          close: true,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
        }).showToast();
      }
    };

    fetchStoreDetails();
  }, [storeId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    setEditingStoreData((prevData) => ({ ...prevData, [name]: newValue }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleUpdateStore = async () => {
    if (!validateUpdatedStoreData()) {
      return;
    }
    try {
      const response = await axios.put(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores/${editingStoreData.storeId}`,
        editingStoreData
      );

      if (response.status === 200) {
        setStoreData(editingStoreData); // Update display state only after successful save
        Toastify({
          text: 'Store updated successfully!',
          duration: 3000,
          close: true,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
        }).showToast();
        setOpenEditDialog(false);
      } else {
        console.error('Error updating store:', response);
      }
    } catch (error) {
      console.error('Error updating store:', error);
      Toastify({
        text: `Error: ${error.message}`,
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
      }).showToast();
    }
  };

  if (!storeData)
    return (
      <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
        <CircularProgress />
      </Typography>
    );

  return (
    <MainCard title="Store Details">
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Box component="form" noValidate autoComplete="off">
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Store Code"
                      value={storeData.storeCode}
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
                  <Grid item xs={6}>
                    <TextField
                      label="Store Name"
                      value={storeData.storeName}
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
                  <Grid item xs={6}>
                    <TextField
                      label="Location"
                      value={storeData.storeLocation}
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
                  <Grid item xs={6}>
                    <TextField
                      label="Contact Email"
                      value={storeData.storeContactEmail}
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
                  <Grid item xs={6}>
                    <TextField
                      label="Contact Number"
                      value={storeData.storeContactNumber}
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
                  <Grid item xs={6}>
                    <TextField
                      label="Status"
                      value={storeData.storeStatus ? 'Active' : 'Inactive'}
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
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="contained" color="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button variant="contained" color="primary" onClick={() => setOpenEditDialog(true)}>
            Edit
          </Button>
        </Box>

        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>Edit Store Details</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Store Name"
                  name="storeName"
                  value={editingStoreData.storeName}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                  error={!!validationErrors.storeName}
                  helperText={validationErrors.storeName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Location"
                  name="storeLocation"
                  value={editingStoreData.storeLocation}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                  error={!!validationErrors.storeLocation}
                  helperText={validationErrors.storeLocation}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Contact Email"
                  name="storeContactEmail"
                  value={editingStoreData.storeContactEmail}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                  error={!!validationErrors.storeContactEmail}
                  helperText={validationErrors.storeContactEmail}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Contact Number"
                  name="storeContactNumber"
                  value={editingStoreData.storeContactNumber}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                  error={!!validationErrors.storeContactNumber}
                  helperText={validationErrors.storeContactNumber}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch checked={editingStoreData.storeStatus} onChange={handleChange} name="storeStatus" color="primary" />}
                  label="Status"
                  labelPlacement="start"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenEditDialog(false);
                setValidationErrors({});
              }}
              color="secondary"
            >
              Cancel
            </Button>
            <Button variant="contained" color="success" onClick={handleUpdateStore}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainCard>
  );
};

export default StoreDetails;
