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
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import AddCircleOutlined from '@mui/icons-material/AddCircleOutlined';

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

    try {
      const response = await axios.post('https://3.1.81.96/api/Stores', newStoreData);
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

  const fetchStoreData = async () => {
    setIsLoading(true);
    try {
      const [storeResponse, brandResponse] = await Promise.all([
        axios.get('https://3.1.81.96/api/Stores?pageNumber=1&pageSize=1000'),
        axios.get('https://3.1.81.96/api/Brands?pageNumber=1&pageSize=100')
      ]);

      const storeDataWithBrandNames = storeResponse.data.map((store) => ({
        ...store,
        brandName: brandResponse.data.find((brand) => brand.brandId === store.brandId)?.brandName || 'Unknown Brand'
      }));
      setStoreData(storeDataWithBrandNames);
      setBrandData(brandResponse.data);
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
    try {
      const response = await axios.delete(`https://3.1.81.96/api/Stores/${storeToDelete.storeId}`);

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
    }
  };

  const handleViewDetails = (store) => {
    navigate(`/store-details`, { state: { storeId: store.storeId } });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredStoreData = storeData.filter((store) => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return (
      store.brandName.toLowerCase().includes(lowercasedQuery) ||
      store.storeCode.toLowerCase().includes(lowercasedQuery) ||
      store.storeName.toLowerCase().includes(lowercasedQuery) ||
      store.storeLocation.toLowerCase().includes(lowercasedQuery)
    );
  });

  return (
    <div>
      <MainCard title="Store Table">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  <TableCell>Brand Name</TableCell>
                  <TableCell>Store Code</TableCell>
                  <TableCell>Store Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStoreData.map((store) => (
                  <TableRow key={store.storeId}>
                    <TableCell>{store.brandName}</TableCell>
                    <TableCell>{store.storeCode}</TableCell>
                    <TableCell>{store.storeName}</TableCell>
                    <TableCell>{store.storeLocation}</TableCell>
                    <TableCell>
                      <Typography style={{ color: store.storeStatus ? 'green' : 'red' }}>{store.storeStatus ? 'True' : 'False'}</Typography>
                    </TableCell>
                    <TableCell sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => {
                          setStoreToDelete(store);
                          setShowDeleteConfirmDialog(true);
                        }}
                      >
                        Delete
                      </Button>
                      <Button variant="contained" size="small" onClick={() => handleViewDetails(store)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
            <Button onClick={handleCloseAddStoreDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleAddStore}>
              Add Store
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
            <Button onClick={() => setShowDeleteConfirmDialog(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Delete
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
