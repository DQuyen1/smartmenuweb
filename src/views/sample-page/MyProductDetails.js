import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Paper,
  Grid,
  NativeSelect,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlined from '@mui/icons-material/AddCircleOutlined';
import { set } from 'lodash';

const MyProductDetails = () => {
  const location = useLocation();
  const { productData } = location.state || {};
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [productSizePrices, setProductSizePrices] = useState([]); // Initialize as an array
  const [editingSizePrice, setEditingSizePrice] = useState(null);
  const [showAddSizePriceDialog, setShowAddSizePriceDialog] = useState(false);
  const [newSizePriceData, setNewSizePriceData] = useState({
    productSizeType: '',
    price: ''
  });
  const [categories, setCategories] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(false);

    const existingSizeTypes = productSizePrices.map((sizePrice) => sizePrice.productSizeType);
    const newSizeType = parseInt(newSizePriceData.productSizeType, 10);

    if (newSizeType === 3 && existingSizeTypes.some((type) => type !== 3)) {
      setErrorMessage('Cannot add Normal size when "S", "M", or "L" sizes exist.');
      setOpenSnackBar(true);
      return;
    } else if (newSizeType !== 3 && existingSizeTypes.includes(3)) {
      setErrorMessage(`Cannot add "${getProductSizeType(newSizeType)}" size when Normal size exists.`);
      setOpenSnackBar(true);
      return;
    }

    try {
      const response = await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices', {
        productId: productData.productId,
        productSizeType: newSizeType,
        price: parseFloat(newSizePriceData.price)
      });

      setProductSizePrices((prevData) => [...prevData, response.data]);
      setSuccessMessage('Size price added successfully!');
      setOpenSnackBar(true);
      setShowAddSizePriceDialog(false);
    } catch (error) {
      console.error('Error adding product group item:', error);
      setErrorMessage(error.response.data.error);
      setOpenSnackBar(true);
      setIsSubmitting(true);
    }
  };

  const handleAddSizePriceChange = (event) => {
    const { name, value } = event.target;
    setNewSizePriceData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  useEffect(() => {
    if (newSizePriceData.productSizeType !== '' && newSizePriceData.price !== '') {
      setIsSubmitting(true);
    } else {
      setIsSubmitting(false);
    }
  }, [newSizePriceData]);

  useEffect(() => {
    if (productData?.productId) {
      const fetchProductSizePrices = async () => {
        try {
          const response = await axios.get(
            `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices?productId=${productData.productId}`
          );
          setProductSizePrices(response.data);
          console.log(response.data);
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
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await axios.delete(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices/${sizePriceId}`);

      setProductSizePrices((prevPrices) => prevPrices.filter((p) => p.productSizePriceId !== sizePriceId));
      setOpenSnackBar(true);
      setSuccessMessage('Size price deleted successfully!');
    } catch (error) {
      console.error('Error deleting size price:', error);
      setErrorMessage(error.response.data.error);
      setOpenSnackBar(true);
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
      setErrorMessage('');
      setSuccessMessage('');

      const response = await axios.put(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices/${editingSizePrice.productSizePriceId}`,
        {
          productSizeType: editingSizePrice.productSizeType,
          price: editingSizePrice.price
        }
      );

      setProductSizePrices((prevPrices) =>
        prevPrices.map((sizePrice) => (sizePrice.productSizePriceId === editingSizePrice.productSizePriceId ? response.data : sizePrice))
      );
      setSuccessMessage('Size price updated successfully!');
      setOpenSnackBar(true);
      setEditingSizePrice(null);
    } catch (error) {
      console.error('Error updating size price:', error);
      setErrorMessage(error.response.data.error);
      setOpenSnackBar(true);
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
          Product Details
        </Typography>
      </Box>
      <Divider />
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box component="form" noValidate autoComplete="off">
            <Grid container spacing={2}>
              {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Category:
                </Typography>
                <Typography variant="body1">{getCategoryName(productData.categoryId)}</Typography>
              </Box> */}
              <Grid item xs={6}>
                <TextField
                  label="Product Name"
                  value={productData.productName}
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
                  label="Category"
                  value={getCategoryName(productData.categoryId)}
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
              {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Product Description:
                </Typography>
                <Typography variant="body1">{productData.productDescription}</Typography>
              </Box> */}
              <Grid item xs={12}>
                <TextField
                  label="Product Description"
                  value={productData.productDescription}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
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

          <Box sx={{ padding: 2, borderRadius: 2, border: '1px solid lightgrey' }}>
            <Typography variant="h1" sx={{ textAlign: 'center' }}>
              Size Prices
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" color="primary" onClick={() => setShowAddSizePriceDialog(true)} startIcon={<AddCircleOutlined />}>
                Add Size Price
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table aria-label="size prices table">
                <TableHead>
                  <TableRow>
                    <TableCell>Size</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProductSizePrices
                    .sort((a, b) => a.productSizeType - b.productSizeType)
                    .map((sizePrice) => (
                      <TableRow key={sizePrice.productSizePriceId} >
                        <TableCell sx={{ minWidth: '100px' }}>{getProductSizeType(sizePrice.productSizeType)}</TableCell>
                        <TableCell sx={{maxWidth: '100px'}}>
                          {editingSizePrice?.productSizePriceId === sizePrice.productSizePriceId ? (
                            <TextField 
                              type="number"
                              sx={{padding: 0}}
                              InputProps={{ inputProps: { min: 1 } }}
                              value={editingSizePrice.price}
                              onChange={(e) => setEditingSizePrice({ ...editingSizePrice, price: e.target.value })}
                              autoFocus
                              onBlur={handleSaveSizePrice}
                            />
                          ) : (
                            `${
                              productData.productPriceCurrency === 1
                                ? sizePrice.price.toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                  })
                                : sizePrice.price.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                  })
                            }`
                          )}
                        </TableCell>
                        <TableCell>
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
        </Box>

        <Dialog open={showAddSizePriceDialog} onClose={() => setShowAddSizePriceDialog(false)}>
          <DialogTitle>Add New Size Price</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter the size and price details:</DialogContentText>
            <FormControl>
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
                defaultValue={''}
              >
                <option value="" hidden disabled></option>
                <option value={0}>S</option>
                <option value={1}>M</option>
                <option value={2}>L</option>
                <option value={3}>Normal</option>
              </TextField>
            </FormControl>
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
            <Button onClick={handleAddSizePrice} variant="contained" disabled={!isSubmitting}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
      {/* Snackbar  message */}
      <Box sx={{ width: 500 }}>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          autoHideDuration={4000}
          open={openSnackBar}
          onClose={() => setOpenSnackBar(false)}
          // message={errorMessage}
          // key={groupItem.productId}
        >
          <Alert
            onClose={() => setOpenSnackBar(false)}
            severity={errorMessage === '' ? 'success' : 'error'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {errorMessage === '' ? successMessage : errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </MainCard>
  );
};

export default MyProductDetails;
