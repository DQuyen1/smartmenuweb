import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';

import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AddCircleOutlined, Edit, Delete } from '@mui/icons-material';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

const ManageSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState(null);
  const [showAddSubscriptionDialog, setShowAddSubscriptionDialog] = useState(false);
  const [showUpdateSubscriptionDialog, setShowUpdateSubscriptionDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [newSubscriptionData, setNewSubscriptionData] = useState({
    name: '',
    description: '',
    price: '',
    dayDuration: '',
    isActive: true,
    isDeleted: false
  });
  const [updateSubscriptionData, setUpdateSubscriptionData] = useState({
    name: '',
    description: '',
    price: '',
    dayDuration: '',
    isActive: true,
    isDeleted: false
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [filter, setFilter] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const validateNewSubscriptionData = () => {
    const errors = {};
    if (!newSubscriptionData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!newSubscriptionData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!newSubscriptionData.price) {
      errors.price = 'Price is required';
    } else if (isNaN(newSubscriptionData.price) || newSubscriptionData.price <= 0) {
      errors.price = 'Price must be a positive number';
    }
    if (!newSubscriptionData.dayDuration) {
      errors.dayDuration = 'Day duration is required';
    } else if (isNaN(newSubscriptionData.dayDuration) || newSubscriptionData.dayDuration <= 0) {
      errors.dayDuration = 'Day duration must be a positive number';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUpdateSubscriptionData = () => {
    const errors = {};
    if (!updateSubscriptionData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!updateSubscriptionData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!updateSubscriptionData.price) {
      errors.price = 'Price is required';
    } else if (isNaN(updateSubscriptionData.price) || updateSubscriptionData.price <= 0) {
      errors.price = 'Price must be a positive number';
    }
    if (!updateSubscriptionData.dayDuration) {
      errors.dayDuration = 'Day duration is required';
    } else if (isNaN(updateSubscriptionData.dayDuration) || updateSubscriptionData.dayDuration <= 0) {
      errors.dayDuration = 'Day duration must be a positive number';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubscription = async () => {
    if (!validateNewSubscriptionData()) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Subscriptions', {
        ...newSubscriptionData
      });
      if (response.status === 201) {
        setNewSubscriptionData({
          name: '',
          description: '',
          price: '',
          dayDuration: '',
          isActive: true,
          isDeleted: false
        });
        setShowAddSubscriptionDialog(false);
        fetchSubscriptionData();
        Toastify({
          text: 'Subscription added successfully!',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
        }).showToast();
      } else {
        console.error('Error creating subscription:', response);
        setError(`Error: ${response.statusText}`);
        Toastify({
          text: `Error: ${response.statusText}`,
          duration: 3000,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
        }).showToast();
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError(`Error: ${error.message}`);
      Toastify({
        text: `Error: ${error.message}`,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
      }).showToast();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!validateUpdateSubscriptionData()) {
      return;
    }
    if (!selectedSubscription) return;
    setIsLoading(true);
    try {
      const response = await axios.put(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Subscriptions/${selectedSubscription.subscriptionId}`, {
        ...updateSubscriptionData
      });
      if (response.status === 200) {
        fetchSubscriptionData();
        Toastify({
          text: 'Subscription updated successfully!',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
        }).showToast();
        setShowUpdateSubscriptionDialog(false);
      } else {
        console.error('Error updating subscription:', response);
        setError(response.data?.error || response.statusText);
        Toastify({
          text: response.data?.error || response.statusText,
          duration: 3000,
          close: true,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
        }).showToast();
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('An error occurred while updating the subscription.');
      Toastify({
        text: 'An error occurred while updating the subscription.',
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
      }).showToast();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!selectedSubscription) return;
    try {
      const response = await axios.delete(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Subscriptions/${selectedSubscription.subscriptionId}`);
      if (response.status === 200) {
        setSubscriptionData(subscriptionData.filter((sub) => sub.subscriptionId !== selectedSubscription.subscriptionId));
        Toastify({
          text: 'Subscription deleted successfully!',
          duration: 3000,
          close: true,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
        }).showToast();
        setShowDeleteConfirmDialog(false);
      } else {
        console.error('Error deleting subscription:', response);
        setError(response.data?.error || response.statusText);
        Toastify({
          text: response.data?.error || response.statusText,
          duration: 3000,
          close: true,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
        }).showToast();
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      setError('An error occurred while deleting the subscription.');
      Toastify({
        text: 'An error occurred while deleting the subscription.',
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
      }).showToast();
    }
  };
  const max = 2147483647;
  const min = 50000;

  const handleChange = (event) => {
    const { name, value } = event.target;
  
    if (name === 'price') {
      let priceValue = parseInt(value, 10);
  
      if (isNaN(priceValue)) {
        priceValue = ''; // Handle invalid input (e.g., non-numeric)
      } else if (priceValue > max) {
        priceValue = max; // Automatically set to max if value exceeds max
      }
  
      // Set the price value to state (without enforcing min)
      setNewSubscriptionData((prevState) => ({ ...prevState, [name]: priceValue }));
  
      // Set an error if the price is below the minimum
      if (priceValue < min && priceValue !== '') {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: `Price must be at least ${min}`,
        }));
      } else {
        setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
      }
    } else {
      setNewSubscriptionData((prevState) => ({ ...prevState, [name]: value }));
      setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };
  
  const handleUpdateChange = (event) => {
    const { name, value } = event.target;
  
    if (name === 'price') {
      let priceValue = parseInt(value, 10);
  
      if (isNaN(priceValue)) {
        priceValue = '';
      } else if (priceValue > max) {
        priceValue = max; // Automatically set to max if value exceeds max
      }
  
      // Set the price value to state (without enforcing min)
      setUpdateSubscriptionData((prevState) => ({ ...prevState, [name]: priceValue }));
  
      // Set an error if the price is below the minimum
      if (priceValue < min && priceValue !== '') {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: `Price must be at least ${min}`,
        }));
      } else {
        setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
      }
    } else {
      setUpdateSubscriptionData((prevState) => ({ ...prevState, [name]: value }));
      setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleCloseAddSubscriptionDialog = () => {
    setShowAddSubscriptionDialog(false);
    setValidationErrors({});
  };

  const handleCloseUpdateSubscriptionDialog = () => {
    setShowUpdateSubscriptionDialog(false);
    setValidationErrors({});
  };

  const handleOpenUpdateDialog = (subscription) => {
    setSelectedSubscription(subscription);
    setUpdateSubscriptionData({
      name: subscription.name,
      description: subscription.description,
      price: subscription.price,
      dayDuration: subscription.dayDuration,
      isActive: subscription.isActive,
      isDeleted: subscription.isDeleted
    });
    setShowUpdateSubscriptionDialog(true);
  };

  const handleOpenDeleteConfirmDialog = (subscription) => {
    setSelectedSubscription(subscription);
    setShowDeleteConfirmDialog(true);
  };

  const handleCloseDeleteConfirmDialog = () => {
    setShowDeleteConfirmDialog(false);
    setSelectedSubscription(null);
  };

  const fetchSubscriptionData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Subscriptions', {
        params: {
          pageSize: 10,
          pageNumber: 1
        }
      });
      const sortedData = response.data.sort((a, b) => b.subscriptionId - a.subscriptionId);
      setSubscriptionData(sortedData);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  return (
    <>
      <MainCard title="Manage Subscriptions">
  <Box display="flex" justifyContent="space-between" mb={2}>
    <TextField
      label="Search"
      variant="outlined"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddCircleOutlined />}
      onClick={() => setShowAddSubscriptionDialog(true)}
    >
      Add Subscription
    </Button>
  </Box>
  {isLoading ? (
    <CircularProgress />
  ) : (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subscriptionData.filter(sub => sub.name.includes(filter)).map(subscription => (
            <TableRow key={subscription.subscriptionId} hover>
              <TableCell>{subscription.name}</TableCell>
              <TableCell>{subscription.description}</TableCell>
              <TableCell>{formatPrice(subscription.price)}</TableCell>
              <TableCell>{subscription.dayDuration}</TableCell>
              <TableCell>
                <Chip label={subscription.isActive ? "Active" : "Inactive"} color={subscription.isActive ? "success" : "default"} />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleOpenUpdateDialog(subscription)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleOpenDeleteConfirmDialog(subscription)}>
                  <Delete color="error" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )}
</MainCard>

      {/* Add Subscription Dialog */}
      <Dialog open={showAddSubscriptionDialog} onClose={handleCloseAddSubscriptionDialog}>
        <DialogTitle>Add New Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter the details for the new subscription.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            name="name"
            fullWidth
            variant="outlined"
            value={newSubscriptionData.name}
            onChange={handleChange}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newSubscriptionData.description}
            onChange={handleChange}
            error={!!validationErrors.description}
            helperText={validationErrors.description}
          />
          <TextField
            margin="dense"
            label="Price"
            name="price"
            fullWidth
            variant="outlined"
            type="number"
            value={newSubscriptionData.price}
            onChange={handleChange}
            error={!!validationErrors.price}
            helperText={validationErrors.price}
          />
          <TextField
            margin="dense"
            label="Day Duration"
            name="dayDuration"
            fullWidth
            variant="outlined"
            type="number"
            value={newSubscriptionData.dayDuration}
            onChange={handleChange}
            error={!!validationErrors.dayDuration}
            helperText={validationErrors.dayDuration}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddSubscriptionDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddSubscription} disabled={isLoading} variant="contained" color="success">
            <Typography color={'white'}>{isLoading ? 'Adding...' : 'Add'}</Typography>
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Subscription Dialog */}
      <Dialog open={showUpdateSubscriptionDialog} onClose={handleCloseUpdateSubscriptionDialog}>
        <DialogTitle>Update Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText>Update the details for the selected subscription.</DialogContentText>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            fullWidth
            variant="outlined"
            value={updateSubscriptionData.name}
            onChange={handleUpdateChange}
            error={!!validationErrors.name}
            helperText={validationErrors.name}
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={updateSubscriptionData.description}
            onChange={handleUpdateChange}
            error={!!validationErrors.description}
            helperText={validationErrors.description}
          />
          <TextField
            margin="dense"
            label="Price"
            name="price"
            fullWidth
            variant="outlined"
            type="number"
            value={updateSubscriptionData.price}
            onChange={handleUpdateChange}
            error={!!validationErrors.price}
            helperText={validationErrors.price}
          />
          <TextField
            margin="dense"
            label="Day Duration"
            name="dayDuration"
            fullWidth
            variant="outlined"
            type="number"
            value={updateSubscriptionData.dayDuration}
            onChange={handleUpdateChange}
            error={!!validationErrors.dayDuration}
            helperText={validationErrors.dayDuration}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateSubscriptionDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateSubscription} variant="contained" disabled={isLoading}>
            <Typography color={'white'}>{isLoading ? 'Updating...' : 'Update'}</Typography>
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onClose={handleCloseDeleteConfirmDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this subscription?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSubscription} variant="contained" color="error">
            <Typography sx={{ fontWeight: 'bold' }}>Delete</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageSubscription;
