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
  TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { AddCircleOutlined } from '@mui/icons-material';

const MyStore = () => {
  const [storeData, setStoreData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage] = useState('');
  const [showAddStoreDialog, setShowAddStoreDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const brandId = localStorage.getItem('brandId');
  const [newStoreData, setNewStoreData] = useState({
    brandId: brandId,
    storeName: '',
    storeLocation: '',
    storeContactEmail: '',
    storeContactNumber: '',
    storeStatus: true
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validateNewStoreData = () => {
    const errors = {};
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
      const response = await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores', newStoreData);
      if (response.status === 201) {
        setNewStoreData({
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
      const brandId = localStorage.getItem('brandId');
      const storeResponse = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Stores', {
        params: {
          brandId: brandId,
          pageNumber: 1,
          pageSize: 1000
        }
      });
      setStoreData(storeResponse.data);
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
    }
  };

  const handleViewDetails = (store) => {
    navigate(`/my-store-details`, { state: { storeId: store.storeId } });
  };

  // Pagination

  const [page, setPage] = useState(0); // State for current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // State for rows per page

  // Function to handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Function to handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page after changing rows per page
  };

  // Searching
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStoreData, setFilteredStoreData] = useState([]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  useEffect(() => {
    const results = storeData.filter(
      (store) =>
        store.storeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.storeLocation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStoreData(results);
  }, [searchTerm, storeData]);

  return (
    <div>
      <MainCard title="Stores">
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <TextField
            variant="outlined"
            value={searchTerm}
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
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Store Code</TableCell>
                    <TableCell>Store Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStoreData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((store) => (
                    <TableRow key={store.storeId}>
                      <TableCell>{store.storeCode}</TableCell>
                      <TableCell>{store.storeName}</TableCell>
                      <TableCell>{store.storeLocation}</TableCell>
                      <TableCell>
                        <Typography style={{ color: store.storeStatus ? 'green' : 'red' }}>
                          {store.storeStatus ? 'Active' : 'Inactive'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="contained" size="small" onClick={() => handleViewDetails(store)}>
                          View Details
                        </Button>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredStoreData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
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
            <Button onClick={handleCloseAddStoreDialog} color="secondary">
              Cancel
            </Button>
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
            <Button onClick={() => setShowDeleteConfirmDialog(false)} color="secondary">
              Cancel
            </Button>
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

export default MyStore;
