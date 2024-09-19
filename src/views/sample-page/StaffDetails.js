import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import MainCard from 'ui-component/cards/MainCard';

const BrandStaffDetails = () => {
  const location = useLocation();
  const { staffId } = location.state;
  const [userData, setUserData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [, setStores] = useState([]);
  const [brandStaffId, setBrandStaffId] = useState(null);
  const [assignData, setAssignData] = useState({
    brandId: '',
    userId: staffId,
    storeId: 0
  });
  const [filteredStores, setFilteredStores] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Users?userId=${staffId}`);
      setUserData(response.data[0]);
      const existingBrandStaff = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BrandStaffs?userId=${staffId}`
      );
      if (existingBrandStaff.data.length > 0) {
        const brandId = existingBrandStaff.data[0].brandId;
        const brandResponse = await axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Brands?brandId=${brandId}`);
        setBrandStaffId(existingBrandStaff.data[0].brandStaffId);
        if (existingBrandStaff.data[0].storeId !== null) {
          const storeId = existingBrandStaff.data[0].storeId;
          const storeResponse = await axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores?storeId=${storeId}`);
          setUserData((prevUserData) => ({
            ...prevUserData,
            brandName: brandResponse.data[0].brandName,
            storeName: storeResponse.data[0].storeName
          }));
        }
        setUserData((prevUserData) => ({
          ...prevUserData,
          brandName: brandResponse.data[0].brandName
        }));
      } else {
        setUserData((prevUserData) => ({
          ...prevUserData,
          brandName: 'Unassigned',
          storeName: 'Unassigned'
        }));
      }
      const allBrandsResponse = await axios.get(
        'https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Brands?pageNumber=1&pageSize=1000'
      );
      setBrands(allBrandsResponse.data);
      const allStoresResponse = await axios.get(
        'https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores?pageNumber=1&pageSize=1000'
      );
      setStores(allStoresResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, [staffId]);

  const handleClickShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleAssignOpen = () => {
    setAssignOpen(true);
  };

  const handleAssignClose = () => {
    setAssignOpen(false);
    setValidationErrors({});
    setError(null);
  };

  const handleAssignChange = async (e) => {
    const { name, value } = e.target;
    setAssignData({ ...assignData, [name]: value });
    setValidationErrors({ ...validationErrors, [name]: '' });

    if (name === 'brandId') {
      try {
        const response = await axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores?brandId=${value}`);
        setFilteredStores(response.data);
      } catch (err) {
        setError('Error fetching stores for selected brand');
      }
    }
  };

  const handleDeleteOpen = () => {
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const validateAssignData = () => {
    const errors = {};
    if (!assignData.brandId) {
      errors.brandId = 'Brand is required';
    }
    if (userData?.role === 2 && !assignData.storeId) {
      errors.storeId = 'Store is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkExistingAssignment = async () => {
    try {
      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BrandStaffs?brandId=${assignData.brandId}`
      );
      const existingStoreManagers = response.data.filter((staff) => staff.storeId !== null && staff.storeId === assignData.storeId);
      return existingStoreManagers.length > 0; // If there are any store managers, it means an assignment exists
    } catch (err) {
      setError('Error checking existing assignments');
      return false;
    }
  };

  const handleAssignSubmit = async () => {
    if (!validateAssignData()) {
      return;
    }
    if (userData?.role === 2) {
      const existingAssignment = await checkExistingAssignment();
      if (existingAssignment) {
        setError('This store already has a Store Manager assigned');
        return;
      }
    }
    try {
      await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BrandStaffs', assignData);
      Toastify({
        text: 'Assigned successfully!',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
      }).showToast();
      setIsLoading(true);
      fetchUserData(); // Navigate back to the brand staff list page
    } catch (err) {
      setError('Error assigning user to brand');
    } finally {
      setIsLoading(false);
      handleAssignClose();
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await axios.delete(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BrandStaffs/${brandStaffId}`);
      Toastify({
        text: 'Brand Staff deleted successfully!',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
      }).showToast();
      setIsLoading(true);
      navigate(-1);
    } catch (err) {
      setError('Error deleting Brand Staff');
    } finally {
      setIsLoading(false);
      handleDeleteClose();
    }
  };

  return (
    <MainCard title="User Details">
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ padding: 2 }}>
                <Box component="form" noValidate autoComplete="off">
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      {userData?.role === 2 && (
                        <TextField
                          label="Store Name"
                          value={userData?.storeName}
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
                      )}
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Brand"
                        value={userData?.userName}
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
                        label="Password"
                        value={showPassword ? userData?.password : '********'}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        disabled
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
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
                        label="Email"
                        value={userData?.email}
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                    Back
                  </Button>
                  {userData?.brandName === 'Unassigned' && (
                    <Button variant="contained" color="primary" onClick={handleAssignOpen}>
                      Assign Brand
                    </Button>
                  )}
                  {userData?.brandName !== 'Unassigned' && (
                    <Button variant="contained" color="error" onClick={handleDeleteOpen}>
                      Delete Brand Staff
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      <Dialog open={assignOpen} onClose={handleAssignClose}>
        <DialogTitle>Assign Brand to User</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="brand-label">Brand</InputLabel>
            <Select
              labelId="brand-label"
              name="brandId"
              value={assignData.brandId}
              onChange={handleAssignChange}
              error={!!validationErrors.brandId}
            >
              {brands.map((brand) => (
                <MenuItem key={brand.brandId} value={brand.brandId}>
                  {brand.brandName}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.brandId && (
              <Typography variant="caption" color="error">
                {validationErrors.brandId}
              </Typography>
            )}
          </FormControl>
          {userData?.role === 2 && (
            <FormControl fullWidth margin="dense">
              <InputLabel id="store-label">Store</InputLabel>
              <Select
                labelId="store-label"
                name="storeId"
                value={assignData.storeId}
                onChange={handleAssignChange}
                error={!!validationErrors.storeId}
              >
                {filteredStores.map((store) => (
                  <MenuItem key={store.storeId} value={store.storeId}>
                    {store.storeName}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.storeId && (
                <Typography variant="caption" color="error">
                  {validationErrors.storeId}
                </Typography>
              )}
            </FormControl>
          )}
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAssignSubmit} color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Delete Brand Staff</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to delete this Brand Staff?</Typography>
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSubmit} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default BrandStaffDetails;
