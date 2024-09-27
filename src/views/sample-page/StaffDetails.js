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
  InputAdornment,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import MainCard from 'ui-component/cards/MainCard';

const BrandStaffDetails = () => {
  const location = useLocation();
  const { store } = location.state;
  console.log(store);
  const [userData, setUserData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [, setStores] = useState([]);
  const [brandStaffId, setBrandStaffId] = useState(null);
  // const [assignData, setAssignData] = useState({
  //   brandId: '',
  //   userId: staffId,
  //   storeId: 0
  // });
  const [filteredStores, setFilteredStores] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores/StoreStaffs/${store.storeId}?userId=${store.userId}`
      );
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [store]);

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

  const getRole = (role) => {
    switch (role) {
      case 1:
        return 'Brand Manager';
      case 2:
        return 'Store Manager';
      default:
        return 'User';
    }
  };

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
          Staff Details
        </Typography>
      </Box>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {/* User info */}
                <Paper elevation={3} sx={{ padding: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', paddingBottom: '1rem', color: 'gray' }}>
                    User Info
                  </Typography>
                  <Box component="form" noValidate autoComplete="off">
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Username"
                          value={store.user.userName}
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
                          label="Store"
                          value={getRole(store.user.role)}
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
                      {/* <Grid item xs={6}>
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
                    </Grid> */}
                      <Grid item xs={6}>
                        <TextField
                          label="Email"
                          value={store.user.email}
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

                  <Divider />

                  {/* Store info */}
                  <Typography variant="h3" sx={{ fontWeight: 'bold', paddingTop: '1rem', color: 'gray' }}>
                    Store Info
                  </Typography>
                  <Box component="form" noValidate autoComplete="off">
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Store Code"
                          value={userData?.storeCode}
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
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Email Contact"
                          value={userData?.storeContactEmail}
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
                          value={userData?.storeContactNumber}
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
                          label="Email Contact"
                          value={userData?.storeLocation}
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
                  {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
                </Box> */}
                </Paper>

                {/* Store info */}
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </MainCard>
  );
};

export default BrandStaffDetails;
