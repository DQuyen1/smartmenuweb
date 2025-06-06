import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { AddCircleOutlined, Visibility, Delete } from '@mui/icons-material';

const UtilitiesShadow = () => {
  const [storeData, setStoreData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage] = useState('');
  const [showAddStoreDialog, setShowAddStoreDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const [newStoreData, setNewStoreData] = useState({
    brandId: '',
    storeName: '',
    storeLocation: '',
    storeContactEmail: '',
    storeContactNumber: '',
    storeStatus: true
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const validateNewStoreData = () => {
    const errors = {};
    if (!newStoreData.brandId) {
      errors.brandId = 'Brand is required';
    }
    if (!newStoreData.storeName.trim()) {
      errors.storeName = 'Store name is required';
    }
    if (!newStoreData.storeLocation.trim()) {
      errors.storeLocation = 'Store location is required';
    }
    if (!newStoreData.storeContactEmail.trim()) {
      errors.storeContactEmail = 'Store contact email is required';
    }
    if (!newStoreData.storeContactNumber.trim()) {
      errors.storeContactNumber = 'Store contact number is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddStore = async () => {
    if (!validateNewStoreData()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores', newStoreData);
      if (response.status === 201) {
        setNewStoreData({
          brandId: '',
          storeName: '',
          storeLocation: '',
          storeContactEmail: '',
          storeContactNumber: '',
          storeStatus: true
        });
        setShowAddStoreDialog(false);
        fetchStoreData();
        Toastify({
          text: 'Store created successfully!',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
        }).showToast();
      } else {
        console.error('Error creating store:', response);
        setError(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating store:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewStoreData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleCloseAddStoreDialog = () => {
    setShowAddStoreDialog(false);
    setValidationErrors({});
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchStoreData = async () => {
    setIsLoading(true);
    try {
      const [storeResponse, brandResponse] = await Promise.all([
        axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores', {
          params: {
            pageNumber: page,
            pageSize: rowsPerPage
          }
        }),
        axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Brands?pageNumber=1&pageSize=100')
      ]);

      const storeDataWithBrandNames = storeResponse.data.map((store) => ({
        ...store,
        brandName: brandResponse.data.find((brand) => brand.brandId === store.brandId)?.brandName || 'Unknown Brand'
      }));
      setStoreData(storeDataWithBrandNames);
      setBrandData(brandResponse.data);
      setPage(0);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores/${storeToDelete.storeId}`);

      if (response.status === 200) {
        setStoreData(storeData.filter((store) => store.storeId !== storeToDelete.storeId));
        setShowDeleteConfirmDialog(false);
        Toastify({
          text: 'Store deleted successfully!',
          duration: 3000,
          close: true,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
        }).showToast();
      } else {
        console.error('Error deleting store:', response);
        setError(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (store) => {
    navigate(`/store-details`, { state: { storeId: store.storeId } });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleBrandFilterChange = (event) => {
    setSelectedBrand(event.target.value);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const filteredStoreData = storeData
    .filter((store) => {
      const lowercasedQuery = searchQuery.toLowerCase();
      const matchesQuery =
        store.brandName.toLowerCase().includes(lowercasedQuery) ||
        store.storeCode.toLowerCase().includes(lowercasedQuery) ||
        store.storeName.toLowerCase().includes(lowercasedQuery) ||
        store.storeLocation.toLowerCase().includes(lowercasedQuery);

      const matchesBrandFilter = selectedBrand ? store.brandId === selectedBrand : true;

      const matchesStatus =
        statusFilter === '' || (statusFilter === 'active' && store.storeStatus) || (statusFilter === 'inactive' && !store.storeStatus);

      return matchesQuery && matchesStatus && matchesBrandFilter;
    })
    .sort((a, b) => {
      if (a.storeId > b.storeId) {
        return -1;
      }
      if (a.storeId < b.storeId) {
        return 1;
      }
      return 0;
    });

  return (
    <div>
      <MainCard title="Stores">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: '16px' }}>
            <TextField
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ marginBottom: '16px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <FormControl sx={{ mb: 2, width: '200px' }}>
              <InputLabel id="brand-filter-label">Brand</InputLabel>
              <Select labelId="brand-filter-label" value={selectedBrand} onChange={handleBrandFilterChange} label="Brand">
                <MenuItem value="">All Brands</MenuItem>
                {brandData.map((brand) => (
                  <MenuItem key={brand.brandId} value={brand.brandId}>
                    {brand.brandName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ mb: 2, width: '200px' }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select labelId="status-filter-label" value={statusFilter} onChange={handleStatusFilterChange} label="Status">
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            onClick={() => setShowAddStoreDialog(true)}
            sx={{ mb: 2, color: 'white' }}
            startIcon={<AddCircleOutlined />}
            color="success"
          >
            Add Store
          </Button>
        </Box>
        {isLoading ? (
          <Typography variant="h6" color="textSecondary" sx={{ textAlign: 'center' }}>
            <CircularProgress />
          </Typography>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Store Code</TableCell>
                  <TableCell>Store Name</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStoreData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((store) => (
                  <TableRow key={store.storeId}>
                    <TableCell>{store.storeCode}</TableCell>
                    <TableCell>{store.storeName}</TableCell>
                    <TableCell>{store.brandName}</TableCell>
                    <TableCell>
                      <Typography style={{ color: store.storeStatus ? 'green' : 'red' }}>
                        {store.storeStatus ? 'Active' : 'Inactive'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="contained" onClick={() => handleViewDetails(store)}>
                        <Visibility />
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          setStoreToDelete(store);
                          setShowDeleteConfirmDialog(true);
                        }}
                      >
                        <Delete />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredStoreData.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[3, 5, 10]}
            />
          </TableContainer>
        )}
        <Dialog
          open={showAddStoreDialog}
          onClose={handleCloseAddStoreDialog}
          aria-labelledby="add-store-dialog-title"
          aria-describedby="add-store-dialog-description"
        >
          <DialogTitle id="add-store-dialog-title">Add New Store</DialogTitle>
          <DialogContent>
            <DialogContentText id="add-store-dialog-description">Please enter the details of the new store.</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              name="brandId"
              label="Brand"
              type="text"
              fullWidth
              variant="outlined"
              value={newStoreData.brandId}
              onChange={handleChange}
              select
              SelectProps={{ native: true }}
              required
              error={!!validationErrors.brandId}
              helperText={validationErrors.brandId}
            >
              <option value="" disabled></option>
              {brandData.map((brand) => (
                <option key={brand.brandId} value={brand.brandId}>
                  {brand.brandName}
                </option>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="storeName"
              label="Store Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newStoreData.storeName}
              onChange={handleChange}
              required
              error={!!validationErrors.storeName}
              helperText={validationErrors.storeName}
            />
            <TextField
              margin="dense"
              name="storeLocation"
              label="Store Location"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={newStoreData.storeLocation}
              onChange={handleChange}
              required
              error={!!validationErrors.storeLocation}
              helperText={validationErrors.storeLocation}
            />
            <TextField
              margin="dense"
              name="storeContactEmail"
              label="Store Contact Email"
              type="email"
              fullWidth
              variant="outlined"
              value={newStoreData.storeContactEmail}
              onChange={handleChange}
              required
              error={!!validationErrors.storeContactEmail}
              helperText={validationErrors.storeContactEmail}
            />
            <TextField
              margin="dense"
              name="storeContactNumber"
              label="Store Contact Number"
              type="text"
              fullWidth
              variant="outlined"
              value={newStoreData.storeContactNumber}
              onChange={handleChange}
              required
              error={!!validationErrors.storeContactNumber}
              helperText={validationErrors.storeContactNumber}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddStoreDialog} color="secondary">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddStore} disabled={isLoading} color="success">
              <Typography color={'white'}>{isLoading ? 'Adding...' : 'Add'}</Typography>
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showDeleteConfirmDialog}
          onClose={() => setShowDeleteConfirmDialog(false)}
          aria-labelledby="delete-confirm-dialog-title"
          aria-describedby="delete-confirm-dialog-description"
        >
          <DialogTitle id="delete-confirm-dialog-title">Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-confirm-dialog-description">
              Are you sure you want to delete this store? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteConfirmDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </MainCard>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarMessage ? 'success' : 'error'}>{snackbarMessage}</Alert>
      </Snackbar>
    </div>
  );
};

export default UtilitiesShadow;
