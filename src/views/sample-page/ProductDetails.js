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
  Divider,
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
  MenuItem,
  Input,
  FormHelperText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlined from '@mui/icons-material/AddCircleOutlined';

const ProductDetails = () => {
  const location = useLocation();
  const { productData } = location.state || {};
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProductData, setUpdatedProductData] = useState({
    categoryId: productData.categoryId,
    productName: '',
    productDescription: '',
    productPriceCurrency: '',
    productImgPath: '',
    productLogoPath: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [productSizePrices, setProductSizePrices] = useState([]);
  const [editingSizePrice, setEditingSizePrice] = useState(null);
  const [categories, setCategories] = useState({});
  const [brands, setBrands] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [productImgPath, setProductImgPath] = useState(false);
  const [productLogoPath, setProductLogoPath] = useState(false);
  const [showAddSizePriceDialog, setShowAddSizePriceDialog] = useState(false);
  const [newSizePriceData, setNewSizePriceData] = useState({
    productSizeType: '',
    price: ''
  });

  const validateUpdatedProductData = () => {
    const errors = {};
    if (!updatedProductData.productName.trim()) {
      errors.productName = 'Name is required';
    } else if (updatedProductData.productName.trim().length > 100) {
      errors.productName = 'Name must be less than 100 characters';
    }
    if (!updatedProductData.productDescription.trim()) {
      errors.productDescription = 'Description is required';
    } else if (updatedProductData.productDescription.trim().length > 200) {
      errors.productDescription = 'Description must be less than 200 characters';
    }
    if (!updatedProductData.productPriceCurrency && updatedProductData.productPriceCurrency !== 0) {
      errors.productPriceCurrency = 'Currency is required';
    }
    if (!updatedProductData.productImgPath) {
      errors.productImgPath = 'Image is required';
    }
    if (!updatedProductData.productLogoPath) {
      errors.productLogoPath = 'Logo is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    // Fetch categories data
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://3.1.81.96/api/Categories?pageSize=1000');
        const categoryMap = response.data.reduce((acc, category) => {
          acc[category.categoryId] = {
            name: category.categoryName,
            brandId: category.brandId
          };
          return acc;
        }, {});
        setCategories(categoryMap);
        fetchBrands(); // Fetch brands after categories
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    // Fetch brands data
    const fetchBrands = async () => {
      try {
        const response = await axios.get('http://3.1.81.96/api/Brands'); // Adjust URL if needed
        const brandMap = response.data.reduce((acc, brand) => {
          acc[brand.brandId] = brand.brandName;
          return acc;
        }, {});
        setBrands(brandMap);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    // Fetch product size prices if productData exists
    const fetchProductSizePrices = async () => {
      try {
        const response = await axios.get(`http://3.1.81.96/api/ProductSizePrices?productId=${productData.productId}`);
        setProductSizePrices(response.data);
      } catch (error) {
        console.error('Error fetching product size prices:', error);
      }
    };

    if (productData?.productId) {
      fetchCategories();
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUpdatedProductData((prevData) => ({ ...prevData, [name]: name === 'productPriceCurrency' ? Number(value) : value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const validateSizePrices = () => {
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

  const handleAddSizePrice = async () => {
    if (!validateSizePrices()) {
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
      const response = await axios.post('http://3.1.81.96/api/ProductSizePrices', {
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

  const handleUpdateProduct = async () => {
    if (!validateUpdatedProductData()) {
      return;
    }

    try {
      const payload = {
        ...updatedProductData,
        productPriceCurrency: parseFloat(updatedProductData.productPriceCurrency),
        productImgPath: productImgPath,
        productLogoPath: productLogoPath
      };
      const response = await axios.put(`http://3.1.81.96/api/Products/${updatedProductData.productId}`, payload);
      if (response.status === 200) {
        location.state.productData = response.data;
        setUpdatedProductData(response.data);
        setOpenSnackbar(true);
        setSnackbarMessage('Product updated successfully!');
        setIsEditing(false);
        setValidationErrors({}); // Clear validation errors
      } else {
        console.error('Error updating product:', response);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (!productData) return <p>Product data not found.</p>;

  const handleDeleteSizePrice = async (sizePriceId) => {
    try {
      const response = await axios.delete(`http://3.1.81.96/api/ProductSizePrices/${sizePriceId}`);
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
      const response = await axios.put(`http://3.1.81.96/api/ProductSizePrices/${editingSizePrice.productSizePriceId}`, {
        productSizeType: editingSizePrice.productSizeType,
        price: editingSizePrice.price
      });

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

  const handleImageUpload = async (event) => {
    const userId = 469;
    const file = event.target.files[0];
    const formData = new FormData();
    const preset_key = 'xdm798lx';
    const folder = `users/${userId}`;
    const tags = `${userId}`;
    if (file) {
      formData.append('file', file);
      formData.append('upload_preset', preset_key);
      formData.append('tags', tags);
      formData.append('folder', folder);
      axios.post('https://api.cloudinary.com/v1_1/dchov8fes/image/upload', formData).then(async (result) => {
        const imageUrl = result.data.secure_url;
        setProductImgPath(imageUrl);
        setUpdatedProductData((prevProduct) => ({
          ...prevProduct,
          productImgPath: imageUrl
        }));
        console.log('Result hihi: ', result.data.secure_url);
      });
    }
  };

  const handleImageUploadLogo = async (event) => {
    const userId = 469;
    const file = event.target.files[0];
    const formData = new FormData();
    const preset_key = 'xdm798lx';
    const folder = `users/${userId}`;
    const tags = `${userId}`;
    if (file) {
      formData.append('file', file);
      formData.append('upload_preset', preset_key);
      formData.append('tags', tags);
      formData.append('folder', folder);
      axios.post('https://api.cloudinary.com/v1_1/dchov8fes/image/upload', formData).then(async (result) => {
        const imageUrl = result.data.secure_url;
        setProductLogoPath(imageUrl);
        setUpdatedProductData((prevProduct) => ({
          ...prevProduct,
          productLogoPath: imageUrl
        }));
      });
    }
  };

  const handleOpenEditDialog = (productData) => {
    setUpdatedProductData(productData);
    setProductImgPath(productData.productImgPath);
    setProductLogoPath(productData.productLogoPath);
    setIsEditing(true);
    console.log('Updated product: ', productData);
  };

  return (
    <MainCard title="Product Details">
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Category Name:
            </Typography>
            <Typography variant="body1">
              {categories[productData.categoryId]
                ? `${categories[productData.categoryId].name} - ${brands[categories[productData.categoryId].brandId] || 'Unknown Brand'}`
                : 'Unknown Category'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Product Name:
            </Typography>
            <Typography variant="body1">{productData.productName}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Currency:
            </Typography>
            <Typography variant="body1">{productData.productPriceCurrency}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Product Description:
            </Typography>
            <Typography variant="body1">{productData.productDescription}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Product Price Currency:
            </Typography>
            <Typography variant="body1">
              {(productData.productPriceCurrency === 0 ? 'USD' : productData.productPriceCurrency === 1 ? 'VND' : null) ?? 'Unknown'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Product Image:
            </Typography>
            <Typography variant="body1">
              {productData.productImgPath ? (
                <img
                  src={productData.productImgPath}
                  alt={`${productData.productName}`}
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              ) : (
                'No Image'
              )}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Product Logo:
            </Typography>
            <Typography variant="body1">
              {productData.productLogoPath ? (
                <img
                  src={productData.productLogoPath}
                  alt={`${productData.productName} logo`}
                  style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                />
              ) : (
                'No Logo'
              )}
            </Typography>
          </Box>
          <Button variant="outlined" color="primary" onClick={() => handleOpenEditDialog(productData)} startIcon={<EditIcon />}>
            Update
          </Button>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Size Prices:</Typography>
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
                            value={editingSizePrice.price}
                            onChange={(e) => setEditingSizePrice({ ...editingSizePrice, price: e.target.value })}
                            autoFocus
                            onBlur={handleSaveSizePrice}
                            error={editingSizePrice.price === ''}
                            helpertext={editingSizePrice.price === '' ? 'Price is required' : ''}
                          />
                        ) : // `$${sizePrice.price}`
                        productData.productPriceCurrency === 1 ? (
                          sizePrice.price.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          })
                        ) : (
                          sizePrice.price.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          })
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
          {!isEditing && filteredProductSizePrices.length === 0 && <p>No size prices found</p>}
        </Box>

        <Dialog open={isEditing} onClose={() => setIsEditing(false)}>
          <DialogTitle>Update Product</DialogTitle>
          <DialogContent>
            <DialogContentText>Make changes to the product details:</DialogContentText>
            <TextField
              label="Product Name"
              name="productName"
              value={updatedProductData.productName}
              onChange={handleChange}
              fullWidth
              margin="dense"
              error={!!validationErrors.productName}
              helperText={validationErrors.productName}
            />
            <TextField
              label="Product Description"
              name="productDescription"
              value={updatedProductData.productDescription}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              margin="dense"
              error={!!validationErrors.productDescription}
              helperText={validationErrors.productDescription}
            />
            <TextField
              margin="dense"
              id="productPriceCurrency"
              name="productPriceCurrency"
              label="Product Price Currency"
              select
              fullWidth
              variant="outlined"
              value={updatedProductData.productPriceCurrency}
              onChange={handleChange}
              required
              error={!!validationErrors.productPriceCurrency}
              helperText={validationErrors.productPriceCurrency}
            >
              <MenuItem value={0}>USD</MenuItem>
              <MenuItem value={1}>VND</MenuItem>
            </TextField>
            <Input
              type="file"
              name="productImgPath"
              accept="image/*"
              onChange={handleImageUpload}
              error={!!validationErrors.productImgPath}
              fullWidth
              margin="dense"
            />
            <FormHelperText error={!!validationErrors.productImgPath}>{validationErrors.productImgPath}</FormHelperText>
            <Input
              type="file"
              name="productLogoPath"
              accept="image/*"
              onChange={handleImageUploadLogo}
              error={!!validationErrors.productLogoPath}
              fullWidth
              margin="dense"
            />
            <FormHelperText error={!!validationErrors.productLogoPath}>{validationErrors.productLogoPath}</FormHelperText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditing(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct} color="primary" variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
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
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarMessage.includes('successfully') ? 'success' : 'error'}>{snackbarMessage}</Alert>
      </Snackbar>
    </MainCard>
  );
};

export default ProductDetails;
