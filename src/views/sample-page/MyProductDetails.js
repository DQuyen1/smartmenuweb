import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import axios from 'axios';
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  Stack,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlined from '@mui/icons-material/AddCircleOutlined';

const MyProductDetails = () => {
  const location = useLocation();
  const { productData } = location.state || {};
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [productSizePrices, setProductSizePrices] = useState([]); // Initialize as an array
  const [editingSizePrice, setEditingSizePrice] = useState(null);
  const [showAddSizePriceDialog, setShowAddSizePriceDialog] = useState(false);
  const [newSizePriceData, setNewSizePriceData] = useState({
    productSizeType: '',
    price: ''
  });
  const [categories, setCategories] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const validateNewSizePriceData = () => {
    const errors = {};
    if (!newSizePriceData.productSizeType) {
      errors.productSizeType = 'Size is required';
    }
    if (!newSizePriceData.price.trim()) {
      errors.price = 'Price is required';
    } else if (parseFloat(newSizePriceData.price) < 0) {
      errors.price = 'Price cannot be negative';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Categories'); // Adjust the URL as needed
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.categoryId === categoryId);
    return category ? category.categoryName : 'Unknown Category';
  };

  const handleAddSizePrice = async () => {
    if (!validateNewSizePriceData()) {
      return;
    }

    const existingSizeTypes = productSizePrices.map((sizePrice) => sizePrice.productSizeType);
    const newSizeType = parseInt(newSizePriceData.productSizeType, 10);

    if (newSizeType === 3 && existingSizeTypes.some((type) => type !== 3)) {
      setSnackbarMessage('Cannot add Normal size when "S", "M", or "L" sizes exist.');
      setOpenSnackbar(true);
      return;
    } else if (newSizeType !== 3 && existingSizeTypes.includes(3)) {
      setSnackbarMessage(`Cannot add "${getProductSizeType(newSizeType)}" size when Normal size exists.`);
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices', {
        productId: productData.productId,
        productSizeType: newSizeType,
        price: parseFloat(newSizePriceData.price)
      });

      if (response.status === 201) {
        setProductSizePrices((prevData) => [...prevData, response.data]);
        setOpenSnackbar(true);
        setSnackbarMessage('Size price added successfully!');
        setShowAddSizePriceDialog(false);
      } else {
        console.error('Error adding size price:', response);
        setSnackbarMessage('Error adding size price.');
      }
    } catch (error) {
      console.error('Error adding product group item:', error);
      setSnackbarMessage('An error occurred while creating the size price.');
    }
  };

  const handleAddSizePriceChange = (event) => {
    const { name, value } = event.target;
    setNewSizePriceData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  useEffect(() => {
    if (productData?.productId) {
      const fetchProductSizePrices = async () => {
        try {
          const response = await axios.get(
            `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices?productId=${productData.productId}`
          );
          setProductSizePrices(response.data);
        } catch (error) {
          console.error('Error fetching product size prices:', error);
        }
      };

      fetchProductSizePrices();
    }
  }, [productData]);

  const getProductSizeType = (sizeType) => {
    switch (sizeType) {
      case 0:
        return 'S';
      case 1:
        return 'M';
      case 2:
        return 'L';
      case 3:
        return 'N';
      default:
        return 'Unknown';
    }
  };

  const filteredProductSizePrices = productSizePrices.filter((sizePrice) => sizePrice.productId === productData.productId);

  if (!productData) return <p>Product data not found.</p>;

  const handleDeleteSizePrice = async (sizePriceId) => {
    try {
      const response = await axios.delete(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices/${sizePriceId}`
      );
      if (response.status === 200) {
        setProductSizePrices((prevPrices) => prevPrices.filter((p) => p.productSizePriceId !== sizePriceId));
        setOpenSnackbar(true);
        setSnackbarMessage('Size price deleted successfully!');
      } else {
        console.error('Error deleting size price:', response);
      }
    } catch (error) {
      console.error('Error deleting size price:', error);
    }
  };

  const handleEditSizePrice = (sizePrice) => {
    setEditingSizePrice(sizePrice);
  };

  const handleCancelEdit = () => {
    setEditingSizePrice(null);
  };

  const handleSaveSizePrice = async () => {
    try {
      const response = await axios.put(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices/${editingSizePrice.productSizePriceId}`,
        {
          productSizeType: editingSizePrice.productSizeType,
          price: editingSizePrice.price
        }
      );

      if (response.status === 200) {
        setProductSizePrices((prevPrices) =>
          prevPrices.map((sizePrice) => (sizePrice.productSizePriceId === editingSizePrice.productSizePriceId ? response.data : sizePrice))
        );
        setOpenSnackbar(true);
        setSnackbarMessage('Size price updated successfully!');
      } else {
        console.error('Error updating size price:', response);
      }
    } catch (error) {
      console.error('Error updating size price:', error);
    } finally {
      setEditingSizePrice(null);
    }
  };

  return (
    <MainCard title="Product Details">
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Category:
            </Typography>
            <Typography variant="body1">{getCategoryName(productData.categoryId)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Product Name:
            </Typography>
            <Typography variant="body1">{productData.productName}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Product Description:
            </Typography>
            <Typography variant="body1">{productData.productDescription}</Typography>
          </Box>
          <Typography variant="subtitle1">Size Prices:</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button variant="contained" color="primary" onClick={() => setShowAddSizePriceDialog(true)} startIcon={<AddCircleOutlined />}>
              Add Size Price
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table aria-label="size prices table">
              <TableHead>
                <TableRow>
                  <TableCell>Size</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProductSizePrices
                  .sort((a, b) => a.productSizeType - b.productSizeType)
                  .map((sizePrice) => (
                    <TableRow key={sizePrice.productSizePriceId}>
                      <TableCell>{getProductSizeType(sizePrice.productSizeType)}</TableCell>
                      <TableCell align="right">
                        {editingSizePrice?.productSizePriceId === sizePrice.productSizePriceId ? (
                          <TextField
                            type="number"
                            InputProps={{ inputProps: { min: 1 } }}
                            value={editingSizePrice.price}
                            onChange={(e) => setEditingSizePrice({ ...editingSizePrice, price: e.target.value })}
                            autoFocus
                            onBlur={handleSaveSizePrice}
                          />
                        ) : (
                          `$${sizePrice.price}`
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {editingSizePrice?.productSizePriceId === sizePrice.productSizePriceId ? (
                          <IconButton onClick={handleCancelEdit} color="primary">
                            <CloseIcon />
                          </IconButton>
                        ) : (
                          <IconButton onClick={() => handleEditSizePrice(sizePrice)} color="primary">
                            <EditIcon />
                          </IconButton>
                        )}
                        <IconButton onClick={() => handleDeleteSizePrice(sizePrice.productSizePriceId)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          {filteredProductSizePrices.length === 0 && <p>No size prices found</p>}
        </Box>

        <Dialog open={showAddSizePriceDialog} onClose={() => setShowAddSizePriceDialog(false)}>
          <DialogTitle>Add New Size Price</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter the size and price details:</DialogContentText>
            <TextField
              margin="dense"
              id="size-select"
              name="productSizeType"
              label="Size"
              type="number"
              fullWidth
              variant="outlined"
              value={newSizePriceData.productSizeType}
              onChange={handleAddSizePriceChange}
              select
              SelectProps={{ native: true }}
              required
              error={!!validationErrors.productSizeType}
              helperText={validationErrors.productSizeType}
            >
              <option value="" disabled></option>
              <option value={0}>S</option>
              <option value={1}>M</option>
              <option value={2}>L</option>
              <option value={3}>Normal</option>
            </TextField>
            <TextField
              margin="dense"
              name="price"
              label="Price"
              type="number"
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
              variant="outlined"
              value={newSizePriceData.price}
              onChange={handleAddSizePriceChange}
              required
              error={!!validationErrors.price}
              helperText={validationErrors.price}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowAddSizePriceDialog(false);
                setValidationErrors({});
              }}
              color="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleAddSizePrice} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarMessage ? 'success' : 'error'}>{snackbarMessage}</Alert>
      </Snackbar>
    </MainCard>
  );
};

export default MyProductDetails;
