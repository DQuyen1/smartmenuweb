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
  CircularProgress,
  InputAdornment,
  Box,
  MenuItem,
  Input,
  FormHelperText,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AddCircleOutlined, Visibility, Delete } from '@mui/icons-material';

const UtilitiesProduct = () => {
  const [productData, setProductData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();
  const [newProductData, setNewProductData] = useState({
    categoryId: '',
    productName: '',
    productDescription: '',
    productPriceCurrency: '',
    productImgPath: '',
    productLogoPath: ''
  });
  const [filter, setFilter] = useState('');
  const [categoryMap, setCategoryMap] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [productsByCategory, setProductsByCategory] = useState({});
  const [productImgPath, setProductImgPath] = useState(false);
  const [productLogoPath, setProductLogoPath] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const validateNewProductData = () => {
    const errors = {};
    if (!newProductData.categoryId) {
      errors.categoryId = 'Category is required';
    }
    if (!newProductData.productName.trim()) {
      errors.productName = 'Product name is required';
    } else if (newProductData.productName.trim().length > 100) {
      errors.productName = 'Product name must be 100 characters or less';
    }
    if (!newProductData.productDescription.trim()) {
      errors.productDescription = 'Product description is required';
    } else if (newProductData.productDescription.trim().length > 200) {
      errors.productDescription = 'Product description must be 200 characters or less';
    }
    const categoryProducts = productsByCategory[newProductData.categoryId] || [];
    const duplicateProduct = categoryProducts.find((product) => product.productName === newProductData.productName);
    if (duplicateProduct) {
      errors.productName = 'A product with this name already exists in the selected category.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleAddProduct = async () => {
    if (!validateNewProductData()) {
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        ...newProductData,
        productPriceCurrency: parseFloat(newProductData.productPriceCurrency),
        productImgPath: productImgPath,
        productLogoPath: productLogoPath
      };

      console.log('Payload being sent to API:', payload);
      const response = await axios.post('http://3.1.81.96/api/Products', payload);
      if (response.status === 201) {
        setNewProductData({
          categoryID: '',
          productName: '',
          productDescription: '',
          productPriceCurrency: '',
          productImgPath: '',
          productLogoPath: ''
        });
        setShowAddProductDialog(false);

        const [updatedProductResponse, categoryResponse] = await Promise.all([
          axios.get('http://3.1.81.96/api/Products?pageNumber=1&pageSize=100'),
          axios.get('http://3.1.81.96/api/Categories?pageNumber=1&pageSize=100')
        ]);

        if (!updatedProductResponse.data || !categoryResponse.data) {
          throw new Error('Missing data from API response');
        }

        const updatedProductData = updatedProductResponse.data.map((product) => ({
          ...product,
          categoryName: categoryResponse.data.find((c) => c.categoryId === product.categoryId)?.categoryName || 'Unknown Category'
        }));

        setProductData(updatedProductData);

        // Update productsByCategory for new validation
        const updatedProductsByCategory = updatedProductData.reduce((acc, product) => {
          if (!acc[product.categoryId]) acc[product.categoryId] = [];
          acc[product.categoryId].push(product);
          return acc;
        }, {});

        setProductsByCategory(updatedProductsByCategory);

        setNewProductData({
          categoryId: '',
          productName: '',
          productDescription: '',
          productPriceCurrency: '',
          productImgPath: '',
          productLogoPath: ''
        });
        setShowAddProductDialog(false);

        setOpenSnackbar(true);
        setSnackbarMessage('Product added successfully!');
      } else {
        console.error('Error creating product:', response);
        // Check if the backend sent a specific error message
        const errorMessage = response.data?.error || response.statusText;
        setError(errorMessage); // Set the error message for display
      }
    } catch (error) {
      console.error('Error creating product:', error.response?.data || error.message);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      setError(`An error occurred: ${error.response?.data?.error || error.message}`); // Display a generic error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewProductData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleCloseAddProductDialog = () => {
    setShowAddProductDialog(false);
    setValidationErrors({});
  };

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [productResponse, categoryResponse, brandResponse] = await Promise.all([
          axios.get('http://3.1.81.96/api/Products?pageNumber=1&pageSize=100'),
          axios.get('http://3.1.81.96/api/Categories?pageNumber=1&pageSize=100'),
          axios.get('http://3.1.81.96/api/Brands?pageNumber=1&pageSize=100')
        ]);

        if (!productResponse.data || !categoryResponse.data || !brandResponse.data) {
          throw new Error('Missing data from API response');
        }

        const categoryOptions = categoryResponse.data.map((category) => {
          const brand = brandResponse.data.find((b) => b.brandId === category.brandId);
          return {
            id: category.categoryId,
            name: `${category.categoryName} - ${brand ? brand.brandName : 'Unknown Brand'}`
          };
        });
        setCategoryOptions(categoryOptions);
        const categoryMap = {};
        categoryResponse.data.forEach((category) => {
          categoryMap[category.categoryId] = category.categoryName;
        });
        setCategoryMap(categoryMap);

        // Create a map of categoryId to products
        const productsByCategory = productResponse.data.reduce((acc, product) => {
          if (!acc[product.categoryId]) acc[product.categoryId] = [];
          acc[product.categoryId].push(product);
          return acc;
        }, {});

        setProductsByCategory(productsByCategory);
        setProductData(productResponse.data); // Don't need to map category name here anymore
      } catch (error) {
        console.error('Error fetching product data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, []);

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      const response = await axios.delete(`http://3.1.81.96/api/Products/${productToDelete.productId}`);
      if (response.status === 200) {
        setProductData((prevData) => prevData.filter((product) => product.productId !== productToDelete.productId));
        setOpenSnackbar(true);
        setSnackbarMessage('Product deleted successfully!');
      } else {
        console.error('Error deleting product:', response);
        setError(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setConfirmDeleteDialogOpen(false); // Close the dialog after the action
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteDialogOpen(false);
    setProductToDelete(null); // Clear the product to delete
  };

  const handleOpenDeleteDialog = (product) => {
    setProductToDelete(product);
    setConfirmDeleteDialogOpen(true);
  };

  const handleViewDetails = (product) => {
    navigate('/product-details', { state: { productData: product } });
  };

  const filteredProductData = productData
    .filter((product) => {
      const productNameMatch = product.productName?.toLowerCase().includes(filter.toLowerCase());
      const categoryIdMatch = product.categoryName?.toLowerCase().includes(filter.toLowerCase());
      const categoryFilterMatch = selectedCategory === '' || product.categoryId === selectedCategory;
      return (productNameMatch || categoryIdMatch) && categoryFilterMatch;
    })
    .sort((a, b) => new Date(b.productId) - new Date(a.productId));

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
        setNewProductData((prevProduct) => ({
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
        setNewProductData((prevProduct) => ({
          ...prevProduct,
          productLogoPath: imageUrl
        }));
      });
    }
  };

  return (
    <>
      <MainCard title="Product Table">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: '16px' }}>
            <TextField
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              variant="outlined"
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
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categoryOptions.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            color="success"
            onClick={() => setShowAddProductDialog(true)}
            startIcon={<AddCircleOutlined />}
            sx={{ mb: 2, color: 'white' }}
          >
            Add Product
          </Button>
        </Box>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </div>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 450, overflowY: 'auto' }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Logo</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProductData.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>
                      {product.productImgPath ? (
                        <img
                          src={product.productImgPath}
                          alt={`${product.productName}`}
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                      ) : (
                        'No Image'
                      )}
                    </TableCell>
                    <TableCell>
                      {product.productLogoPath ? (
                        <img
                          src={product.productLogoPath}
                          alt={`${product.productName} logo`}
                          style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                        />
                      ) : (
                        'No Logo'
                      )}
                    </TableCell>
                    <TableCell>{categoryMap[product.categoryId]}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button color="primary" onClick={() => handleViewDetails(product)} variant="contained">
                          <Visibility />
                        </Button>
                        <Button color="error" onClick={() => handleOpenDeleteDialog(product)} variant="contained">
                          <Delete />
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      <Dialog open={showAddProductDialog} onClose={handleCloseAddProductDialog}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter the details of the new product.</DialogContentText>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            margin="dense"
            id="categoryId"
            name="categoryId"
            type="text"
            label="Category"
            fullWidth
            variant="outlined"
            value={newProductData.categoryId}
            onChange={handleChange}
            select
            SelectProps={{ native: true }}
            error={!!validationErrors.categoryId}
            helperText={validationErrors.categoryId}
          >
            <option value="" disabled></option>
            {categoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </TextField>
          <TextField
            margin="dense"
            id="productName"
            name="productName"
            label="Product Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newProductData.productName}
            onChange={handleChange}
            error={!!validationErrors.productName}
            helperText={validationErrors.productName}
          />
          <TextField
            margin="dense"
            id="productDescription"
            name="productDescription"
            label="Product Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newProductData.productDescription}
            onChange={handleChange}
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
            value={newProductData.productPriceCurrency}
            onChange={handleChange}
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
          <Button onClick={handleCloseAddProductDialog}>Cancel</Button>
          <Button onClick={handleAddProduct} color="success" variant="contained" disabled={isLoading}>
            <Typography color={'white'}>{isLoading ? 'Adding...' : 'Add'}</Typography>
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete the product? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UtilitiesProduct;
