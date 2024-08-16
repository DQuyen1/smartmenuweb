import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

const Staff = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brandData, setBrandData] = useState([]);
  const [, setUserData] = useState([]);
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    userName: '',
    password: '',
    email: '',
    role: 2
  });
  const [, setStores] = useState([]); // State for stores
  const [assignData, setAssignData] = useState({
    brandId: localStorage.getItem('brandId'),
    userId: '',
    storeId: ''
  });
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState({});
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const validateNewUserData = () => {
    const errors = {};
    if (!newUser.userName.trim()) {
      errors.userName = 'User name is required';
    } else if (newUser.userName.trim() === brandData.find((user) => user.userName === newUser.userName)?.userName) {
      errors.userName = 'User name already exists';
    }
    if (!newUser.password.trim()) {
      errors.password = 'Password is required';
    }
    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAssignData = () => {
    const errors = {};
    if (!assignData.storeId) {
      errors.storeId = 'Store is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    const brandId = localStorage.getItem('brandId');
    const numericBrandId = Number(brandId);

    // Kiểm tra nếu brandId hợp lệ
    if (isNaN(numericBrandId)) {
      throw new Error('Invalid brandId');
    }

    try {
      const [userResponse, brandResponse, allStoresResponse] = await Promise.all([
        axios.get('https://3.1.81.96/api/Users?pageNumber=1&pageSize=1000'),
        axios.get('https://3.1.81.96/api/Brands/BrandStaff?pageNumber=1&pageSize=1000'),
        axios.get('https://3.1.81.96/api/Stores?pageNumber=1&pageSize=1000') // Fetch stores
      ]);

      const filteredUsers = userResponse.data.filter((user) => user.role === 2);
      const userMap = {};
      filteredUsers.forEach((user) => {
        userMap[user.userId] = user;
      });
      setUserData(userMap);

      const storesMap = {};
      allStoresResponse.data.forEach((store) => {
        storesMap[store.storeId] = store.storeName;
      });
      setStores(storesMap); // Set stores data

      const updatedBrandData = brandResponse.data
        .filter((brand) => brand.brandId === numericBrandId)
        .map((brand) => {
          const updatedBrandStaffs = brand.brandStaffs
            .filter((staff) => userMap[staff.userId]) // Only include users with role = 2
            .map((staff) => ({
              ...staff,
              userName: userMap[staff.userId]?.userName || 'Unknown User',
              email: userMap[staff.userId]?.email || 'Unknown Email',
              role: userMap[staff.userId]?.role || 'Unknown Role',
              storeName: storesMap[staff.storeId]
            }));

          return {
            ...brand,
            brandStaffs: updatedBrandStaffs
          };
        });

      const allUsers = updatedBrandData.flatMap((brand) => brand.brandStaffs);

      const filteredStores = allStoresResponse.data.filter((store) => store.brandId === 2);
      setFilteredStores(filteredStores);

      setBrandData(allUsers);
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetails = (staff) => {
    navigate('/staff-details', { state: { staffId: staff.userId } });
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setValidationErrors({});
  };

  const handleAssignClose = () => {
    setAssignOpen(false);
    setValidationErrors({});
    setError(null);
  };

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
    setValidationErrors({ ...validationErrors, [e.target.name]: '' });
  };

  const handleAssignChange = async (e) => {
    const { name, value } = e.target;
    setAssignData({ ...assignData, storeId: value });
    setValidationErrors({ ...validationErrors, [name]: '' });
    setError(null);

    if (name === 'brandId') {
      const storesForBrand = filteredStores.filter((store) => store.brandId === parseInt(value));
      setFilteredStores(storesForBrand);
    }
  };

  const handleSubmit = async () => {
    if (!validateNewUserData()) {
      return;
    }

    try {
      // Create the new user
      await axios.post('https://3.1.81.96/api/Auth/Register', newUser);

      // Login with the newly created user
      const loginResponse = await axios.post('https://3.1.81.96/api/Auth/Login', {
        userName: newUser.userName,
        password: newUser.password
      });
      const userId = loginResponse.data.userId;
      setAssignData({ ...assignData, userId });
      setAssignOpen(true);
    } catch (err) {
      setError('Error adding user');
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  const checkExistingAssignment = async () => {
    try {
      const response = await axios.get(`https://3.1.81.96/api/BrandStaffs?brandId=${assignData.brandId}`);
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

    const existingAssignment = await checkExistingAssignment();
    if (existingAssignment) {
      setError('This store already has a Store Manager assigned');
      return;
    }

    try {
      await axios.post('https://3.1.81.96/api/BrandStaffs', assignData);
      Toastify({
        text: 'created staff successfully!',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
      }).showToast();
      setIsLoading(true);
      fetchData();
    } catch (err) {
      setError('Error assigning user to brand');
    } finally {
      setIsLoading(false);
      handleAssignClose();
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter the staff based on the search query
  const filteredStaff = brandData.filter(
    (staff) =>
      staff.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.storeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainCard title={<Typography variant="h5">Brand Staff Table</Typography>}>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <TextField label="Search" variant="outlined" value={searchQuery} onChange={handleSearchChange} sx={{ marginBottom: '16px' }} />
            <Button variant="contained" color="primary" onClick={handleOpen}>
              Add Staff
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : brandData.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Store</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.userId} hover>
                      <TableCell>{staff.userName}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>{staff.storeName}</TableCell>
                      <TableCell>
                        <Button size="small" color="primary" onClick={() => handleViewDetails(staff)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No staff data found.</Typography>
          )}
        </Grid>
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="User Name"
            name="userName"
            type="text"
            fullWidth
            value={newUser.userName}
            onChange={handleChange}
            error={!!validationErrors.userName}
            helperText={validationErrors.userName}
            required
          />
          <TextField
            margin="dense"
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={handleChange}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            required
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={handleChange}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={assignOpen} onClose={handleAssignClose}>
        <DialogTitle>Assign Brand to User</DialogTitle>
        <DialogContent>
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
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAssignSubmit} color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default Staff;
