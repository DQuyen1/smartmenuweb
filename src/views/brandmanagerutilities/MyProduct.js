import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import MainCard from 'ui-component/cards/MainCard';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Input,
  FormHelperText,
  InputAdornment
} from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const MyProduct = () => {
  const location = useLocation();
  const { state } = location;
  const categoryId = state?.categoryId; // Get categoryId from location state
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [newProduct, setNewProduct] = useState({
    categoryId: categoryId,
    productName: '',
    productDescription: '',
    productPriceCurrency: '',
    productImgPath: '',
    productLogoPath: ''
  });
  const [productToEdit, setProductToEdit] = useState({
    categoryId: categoryId,
    productName: '',
    productDescription: '',
    productPriceCurrency: '',
    productImgPath: '',
    productLogoPath: ''
  });
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState({});
  const [productImgPath, setProductImgPath] = useState(false);
  const [productLogoPath, setProductLogoPath] = useState(false);

  const validateNewProductData = () => {
    const errors = {};
    if (!newProduct.categoryId) {
      errors.categoryId = 'Category is required';
    }
    if (!newProduct.productName.trim()) {
      errors.productName = 'Product name is required';
    } else if (newProduct.productName.trim().length > 100) {
      errors.productName = 'Product name must be 100 characters or less';
    }
    if (!newProduct.productDescription.trim()) {
      errors.productDescription = 'Product description is required';
    } else if (newProduct.productDescription.trim().length > 200) {
      errors.productDescription = 'Product description must be 200 characters or less';
    }
    if (!newProduct.productPriceCurrency && newProduct.productPriceCurrency !== 0) {
      errors.productPriceCurrency = 'Product price currency is required';
    }
    if (!newProduct.productImgPath) {
      errors.productImgPath = 'Product image path is required';
    }
    if (!newProduct.productLogoPath) {
      errors.productLogoPath = 'Product logo path is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditProductData = () => {
    const errors = {};
    if (!productToEdit.productName.trim()) {
      errors.productName = 'Product name is required';
    } else if (productToEdit.productName.trim().length > 100) {
      errors.productName = 'Product name must be 100 characters or less';
    }
    if (!productToEdit.productDescription.trim()) {
      errors.productDescription = 'Product description is required';
    } else if (productToEdit.productDescription.trim().length > 200) {
      errors.productDescription = 'Product description must be 200 characters or less';
    }
    if (!productToEdit.productPriceCurrency && productToEdit.productPriceCurrency !== 0) {
      errors.productPriceCurrency = 'Product price currency is required';
    }
    if (!productToEdit.productImgPath) {
      errors.productImgPath = 'Product image path is required';
    }
    if (!productToEdit.productLogoPath) {
      errors.productLogoPath = 'Product logo path is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (categoryId) {
      const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Products', {
            params: {
              pageNumber: 1,
              pageSize: 100, // Adjust pageSize as needed
              categoryId: categoryId // Use categoryId for filtering
            }
          });

          if (!response.data) {
            throw new Error('Missing data from API response');
          }

          setProducts(response.data);
        } catch (error) {
          console.error('Error fetching products:', error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProducts();
    }
  }, [categoryId]);

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewProduct({
      categoryId: categoryId,
      productName: '',
      productDescription: '',
      productPriceCurrency: '',
      productImgPath: null,
      productLogoPath: null
    });
    setValidationErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value
    }));
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const handleAddProduct = async () => {
    if (!validateNewProductData()) {
      return;
    }
    try {
      const payload = {
        ...newProduct,
        productPriceCurrency: parseFloat(newProduct.productPriceCurrency),
        productImgPath: productImgPath,
        productLogoPath: productLogoPath
      };
      console.log('payload:', payload);
      await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Products', payload);
      const response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Products', {
        params: {
          pageNumber: 1,
          pageSize: 100,
          categoryId
        }
      });
      setProducts(response.data);
      handleCloseAddDialog();
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.message);
    }
  };

  const handleOpenEditDialog = (product) => {
    setProductToEdit(product);
    setProductImgPath(product.productImgPath);
    setProductLogoPath(product.productLogoPath);
    setOpenEditDialog(true);
    console.log('productToEdit:', product);
  };

  const handleCloseEditDialog = () => {
    setProductToEdit(null);
    setOpenEditDialog(false);
    setValidationErrors({});
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setProductToEdit((prev) => ({
      ...prev,
      [name]: name === 'productPriceCurrency' ? Number(value) : value
    }));
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const handleUpdateProduct = async () => {
    if (!validateEditProductData()) {
      return;
    }
    try {
      const payload = {
        ...productToEdit,
        productPriceCurrency: parseFloat(productToEdit.productPriceCurrency),
        productImgPath: productImgPath,
        productLogoPath: productLogoPath
      };
      await axios.put(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Products/${productToEdit.productId}`, payload);
      const response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Products', {
        params: {
          pageNumber: 1,
          pageSize: 100,
          categoryId
        }
      });
      setProducts(response.data);
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.message);
    }
  };

  const handleOpenConfirmDialog = (productId) => {
    setProductToDelete(productId);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setProductToDelete(null);
    setOpenConfirmDialog(false);
  };

  const handleViewDetails = (product) => {
    navigate('/my-product-details', { state: { productData: product } });
  };

  const handleDeleteProduct = async () => {
    try {
      await axios.delete(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Products/${productToDelete}`);
      // Fetch the updated list of products
      const response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Products', {
        params: {
          pageNumber: 1,
          pageSize: 100,
          categoryId
        }
      });
      setProducts(response.data);
      handleCloseConfirmDialog();
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.message);
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
        setNewProduct((prevProduct) => ({
          ...prevProduct,
          productImgPath: imageUrl
        }));
        setProductToEdit((prevProduct) => ({
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
        setNewProduct((prevProduct) => ({
          ...prevProduct,
          productLogoPath: imageUrl
        }));
        setProductToEdit((prevProduct) => ({
          ...prevProduct,
          productLogoPath: imageUrl
        }));
      });
    }
  };

  return (
    <>
      <MainCard title="My Products">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpenAddDialog} sx={{ mb: 2 }}>
            Add Product
          </Button>
        </Box>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Price Currency</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Logo</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products
                  .filter((product) => product.productName.toLowerCase().includes(filter.toLowerCase()))
                  .map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell>{product.productDescription}</TableCell>
                      <TableCell>
                        {(product.productPriceCurrency === 0 ? 'USD' : product.productPriceCurrency === 1 ? 'VND' : null) ?? 'Unknown'}
                      </TableCell>
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
                      <TableCell sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetails(product)}
                          sx={{
                            color: 'primary.main',
                            borderColor: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.light'
                            }
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleOpenEditDialog(product)}
                          sx={{
                            color: 'primary.main',
                            borderColor: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.light'
                            }
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Delete />}
                          onClick={() => handleOpenConfirmDialog(product.productId)}
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
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>

      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="productName"
            label="Product Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newProduct.productName}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            required
            error={!!validationErrors.productName}
            helperText={validationErrors.productName}
          />
          <TextField
            margin="dense"
            name="productDescription"
            label="Product Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newProduct.productDescription}
            onChange={handleInputChange}
            required
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
            value={newProduct.productPriceCurrency}
            onChange={handleInputChange}
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
          <Button onClick={handleCloseAddDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddProduct}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="productName"
            label="Product Name"
            type="text"
            fullWidth
            variant="outlined"
            value={productToEdit?.productName || ''}
            onChange={handleEditInputChange}
            required
            error={!!validationErrors.productName}
            helperText={validationErrors.productName}
          />
          <TextField
            margin="dense"
            name="productDescription"
            label="Product Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={productToEdit?.productDescription || ''}
            onChange={handleEditInputChange}
            required
            error={!!validationErrors.productDescription}
            helperText={validationErrors.productDescription}
          />
          <TextField
            margin="dense"
            name="productPriceCurrency"
            label="Product Price Currency"
            select
            fullWidth
            variant="outlined"
            value={productToEdit?.productPriceCurrency || ''}
            onChange={handleEditInputChange}
            required
            error={!!validationErrors.productPriceCurrency}
            helperText={validationErrors.productPriceCurrency}
          >
            <MenuItem value={0}>USD</MenuItem>
            <MenuItem value={1}>VND</MenuItem>
          </TextField>
          <Input
            type="file"
            name="productImgFile"
            accept="image/*"
            onChange={handleImageUpload}
            error={!!validationErrors.productImgPath}
            fullWidth
            margin="dense"
          />
          <FormHelperText error={!!validationErrors.productImgPath}>{validationErrors.productImgPath}</FormHelperText>
          <Input
            type="file"
            name="productLogoFile"
            accept="image/*"
            onChange={handleImageUploadLogo}
            error={!!validationErrors.productLogoPath}
            fullWidth
            margin="dense"
          />
          <FormHelperText error={!!validationErrors.productLogoPath}>{validationErrors.productLogoPath}</FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUpdateProduct}>Update</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this product?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteProduct} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyProduct;
