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
  InputLabel,
  TablePagination,
  DialogContentText
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { Delete, DisabledByDefault, DisabledByDefaultRounded, Visibility } from '@mui/icons-material';
import { set } from 'lodash';

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
  const [stores, setStores] = useState([]); // State for stores
  const [assignData, setAssignData] = useState({
    brandStaffId: 0,
    userId: 0,
    storeId: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState({});
  const [filteredStores, setFilteredStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorInput, setErrorInput] = useState('');

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
        axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Users?pageNumber=1&pageSize=1000'),
        axios.get(
          `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BrandStaffs?brandId=${brandId}&pageNumber=1&pageSize=1000`
        ),
        axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores?brandId=${brandId}&pageNumber=1&pageSize=1000`) // Fetch stores
      ]);

      console.log(brandResponse.data);
      setBrandData(brandResponse.data);

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
      setStores(allStoresResponse.data); // Set stores data

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
      const filteredStores = allStoresResponse.data.filter((store) => store.brandId === brandId);
      setFilteredStores(filteredStores);
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
    navigate('/staff-details', { state: { store: staff } });
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

  useEffect(() => {
    // Email validation using regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (newUser.userName.length < 6 || newUser.password.length > 20) {
      setErrorInput('User name must be between 6 and 20 characters');
      setIsSubmitting(false);
    } else if (newUser.password.length < 6 || newUser.password.length > 20) {
      setErrorInput('Password must be between 6 and 20 characters');
      setIsSubmitting(false);
    }     else if (!emailRegex.test(newUser.email)) {
      setErrorInput('Invalid email format');
      setIsSubmitting(false);
    } else if (newUser.email.length < 6 || newUser.email.length > 50) {
      setErrorInput('Email must be between 6 and 50 characters');
      setIsSubmitting(false);
    } else {
      setErrorInput('');
      setIsSubmitting(true);
    }


  }, [newUser]);

  // useEffect(() => {
  //   if (newUser.userName === '' || newUser.password === '' || newUser.email === '' || assignData.storeId === 0) {
  //     setIsSubmitting(true);
  //   } else {
  //     setIsSubmitting(false);
  //   }
  // }, [newUser, assignData]);

  const handleAssignChange = async (e) => {
    const { name, value } = e.target;
    console.log(value);
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
      setIsSubmitting(true);
      return;
    }

    setIsSubmitting(false);

    try {
      // Create the new user
      const response = await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Auth/Register', newUser);

      const userId = response.data.userId;
      setAssignData({ ...assignData, userId });
      setAssignOpen(true);
      setIsSubmitting(true);
    } catch (err) {
      setError('Error adding user');
      setIsSubmitting(true);
    } finally {
      setIsSubmitting(true);
      setIsLoading(false);
      handleClose();
    }
  };

  const checkExistingAssignment = async () => {
    try {
      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BrandStaffs?brandStaffId=${assignData.brandStaffId}`
      );
      const existingStoreManagers = response.data.filter((staff) => staff.storeId !== null && staff.storeId === assignData.storeId);
      return existingStoreManagers.length > 0; // If there are any store managers, it means an assignment exists
    } catch (err) {
      setError('Error checking existing assignments');
      return false;
    }
  };

  const handleAssignSubmit = async () => {
    // if (!validateAssignData()) {
    //   return;
    // }
    setIsSubmitting(true);

    const existingAssignment = await checkExistingAssignment();
    if (existingAssignment) {
      setError('This store already has a Store Manager assigned');
      setIsSubmitting(false);
      return;
    }

    const brandId = localStorage.getItem('brandId');
    const data = {
      brandId: brandId,
      userId: assignData.userId,
      storeId: assignData.storeId
    };

    axios
      .post(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BrandStaffs`, data)
      .then((response) => {
        Toastify({
          text: 'Assigned staff successfully!',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
        }).showToast();
        fetchData();
        console.log('Response:', response.data);
        handleAssignClose();
        setIsSubmitting(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsSubmitting(false);
        setError('Error assigning user to brand');
      });

    // try {
    //   axios.put(, data);

    //   console.log(data);
    //   setIsLoading(true);

    //   fetchData();
    // } catch (err) {
    //   setError('Error assigning user to brand');
    // } finally {
    //   setIsLoading(false);
    //   handleAssignClose();
    // }
  };

  const handleAssignOpen = (brand) => {
    setAssignData({ ...assignData, userId: brand.userId, brandStaffId: brand.brandStaffId });
    setAssignOpen(true);
  };

  // const handleSearchChange = (e) => {
  //   setSearchQuery(e.target.value);
  // };

  // Paginated
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when changing rows per page
  };

  // Searching
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBrandData, setFilteredBrandData] = useState([]);

  useEffect(() => {
    const results = brandData.filter(
      (brand) =>
        brand.user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBrandData(results);
  }, [searchTerm, brandData]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleChangeRoleSelect = (e) => {
    const { value } = e.target;

    switch (value) {
      case 0:
        setFilteredBrandData(brandData);
        break;
      case 1:
        setFilteredBrandData(brandData.filter((brand) => brand.user.role === 1));
        break;
      case 2:
        setFilteredBrandData(brandData.filter((brand) => brand.user.role === 2));
        break;
    }
  };

  const handleChangeStoreSelect = (e) => {
    const { value } = e.target;
    if (value === 0) {
      setFilteredBrandData(brandData);
    } else {
      setFilteredBrandData(brandData.filter((brand) => brand.storeId === value));
    }
  };

  const [deleteData, setDeleteData] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState([]);

  const handleDeleteOpen = (brand) => {
    setDeleteData(brand.brandStaffId);
    setOpenDeleteDialog({
      ...openDeleteDialog,
      [brand.brandStaffId]: true
    });
  };

  const handleSubmitDeleteBrandStaff = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    axios
      .delete(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BrandStaffs/${deleteData}`)
      .then((response) => {
        Toastify({
          text: 'Deleted staff successfully!',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          color: 'white',
          backgroundColor: '#00E676'
        }).showToast();
        fetchData();
        console.log('Response:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsSubmitting(false);
        setError('Error deleting staff');
      });
  };

  return (
    <MainCard title="Brand Staffs">
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Box justifyContent="space-between" alignItems="center">
            <TextField label="Search" variant="outlined" value={searchTerm} onChange={handleSearchChange} sx={{ marginBottom: '16px' }} />
            {/* <FormControl sx={{ marginLeft: '1rem' }}>
              <InputLabel id="roleSelect">Role</InputLabel>
              <Select
                labelId="roleSelect"
                id="roleSelect"
                sx={{ minWidth: '150px' }}
                defaultValue={0}
                label="Age"
                onChange={handleChangeRoleSelect}
              >
                <MenuItem value={0}>All</MenuItem>
                <MenuItem value={1}>Brand Manager</MenuItem>
                <MenuItem value={2}>Store Manager</MenuItem>
              </Select>
            </FormControl> */}
            <FormControl sx={{ marginLeft: '1rem' }}>
              <InputLabel id="storeSelect">Store</InputLabel>
              <Select labelId="storeSelect" sx={{ minWidth: '210px' }} id="storeSelect" defaultValue={0} onChange={handleChangeStoreSelect}>
                <MenuItem value={0}>All</MenuItem>
                {stores.map((store) => (
                  <MenuItem key={store.storeId} value={store.storeId}>
                    {store.storeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" color="primary" sx={{ float: 'right' }} onClick={handleOpen}>
              Add Staff
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress />
            </Box>
          ) : brandData.length > 0 ? (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell>User Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Store</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBrandData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .filter((brand) => brand.user.role !== 1)
                      .map((brand) => (
                        <TableRow key={brand.user.userId} hover>
                          <TableCell>{brand.user.role === 1 ? 'Brand Manager' : 'Store Manager'}</TableCell>
                          <TableCell>{brand.user.userName}</TableCell>
                          <TableCell>{brand.user.email}</TableCell>
                          {brand.storeId === null && brand.user.isDeleted === false ? (
                            <TableCell>
                              <Button
                                size="small"
                                sx={{ color: 'white' }}
                                color="success"
                                onClick={() => handleAssignOpen(brand)}
                                variant="contained"
                              >
                                Assign
                              </Button>
                            </TableCell>
                          ) : (
                            <TableCell>
                              {stores.filter((store) => store.storeId === brand.storeId).map((store) => store.storeName) || 'N/A'}
                            </TableCell>
                          )}
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="info"
                              size="small"
                              onClick={() => handleViewDetails(brand)}
                              startIcon={<Visibility />}
                              sx={{
                                color: 'info.main',
                                borderColor: 'info.main',
                                '&:hover': {
                                  backgroundColor: 'info.light'
                                },
                                marginRight: '0.5rem'
                              }}
                            >
                              View Details
                            </Button>
                            {/* <Button size="small" color="error" onClick={() => handleDeleteOpen(staff)} variant="contained">
                            Disable
                          </Button> */}
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleDeleteOpen(brand)}
                              startIcon={<Delete />}
                              sx={{
                                color: 'error.main',
                                borderColor: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'error.light'
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </TableCell>

                          <Dialog
                            open={openDeleteDialog[brand.brandStaffId] || false}
                            onClose={() => {
                              setOpenDeleteDialog({ ...openDeleteDialog, [brand.brandStaffId]: false }), setIsSubmitting(false);
                            }}
                          >
                            <DialogTitle sx={{ minWidth: '15rem' }} variant="h3">
                              Delete
                            </DialogTitle>
                            <DialogContent>
                              Delete brand staff <b>{brand.user.userName}</b>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">
                                Cancel
                              </Button>

                              <Button onClick={(e) => handleSubmitDeleteBrandStaff(e)} disabled={isSubmitting}>
                                OK
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={brandData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />

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
                <DialogContent sx={{ minHeight: '46.67px', minWidth: '432px', padding: '0px 24px' }}>
                  <DialogContentText>{errorInput && <p style={{ color: 'red' }}>{errorInput}</p>}</DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} color="primary" disabled={!isSubmitting}>
                    Submit
                  </Button>
                </DialogActions>
              </Dialog>

              <Dialog open={assignOpen} onClose={handleAssignClose}>
                <DialogTitle>Assign Store to User</DialogTitle>
                <DialogContent>
                  <FormControl fullWidth margin="dense">
                    <InputLabel id="store-label">Store</InputLabel>
                    <Select
                      labelId="store-label"
                      name="storeId"
                      defaultValue="0"
                      value={assignData.storeId}
                      onChange={handleAssignChange}
                      error={!!validationErrors.storeId}
                    >
                      <MenuItem value="0" disabled>
                        Choose store
                      </MenuItem>
                      {stores.map((store) => (
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
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleAssignClose} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={handleAssignSubmit} color="primary" disabled={!isSubmitting}>
                    Assign
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <Typography>No staff data found.</Typography>
          )}
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Staff;
