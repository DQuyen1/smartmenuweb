import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
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
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Input,
  FormHelperText,
  TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AddCircleOutlined, Edit, Delete } from '@mui/icons-material';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

const UtilitiesBrand = () => {
  const [brandData, setBrandData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState(null);
  const [showAddBrandDialog, setShowAddBrandDialog] = useState(false);
  const [showUpdateBrandDialog, setShowUpdateBrandDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [newBrandData, setNewBrandData] = useState({
    brandName: '',
    brandDescription: '',
    brandImage: '',
    brandContactEmail: ''
  });
  const [updateBrandData, setUpdateBrandData] = useState({
    brandDescription: '',
    brandImage: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [filter, setFilter] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandImage, setBrandImage] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const validateNewBrandData = () => {
    const errors = {};
    if (!newBrandData.brandName.trim()) {
      errors.brandName = 'Brand name is required';
    }
    if (!newBrandData.brandContactEmail.trim()) {
      errors.brandContactEmail = 'Brand contact email is required';
    }
    if (!newBrandData.brandImage.trim()) {
      errors.brandImage = 'Brand image is required';
    }
    if (!newBrandData.brandDescription.trim()) {
      errors.brandDescription = 'Brand description is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUpdateBrandData = () => {
    const errors = {};
    if (!updateBrandData.brandDescription.trim()) {
      errors.brandDescription = 'Brand description is required';
    }
    if (!updateBrandData.brandImage.trim()) {
      errors.brandImage = 'Brand image is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const checkBrandNameExists = async (brandName) => {
    try {
      const response = await axios.get(`https://3.1.81.96/api/Brands?searchString=${brandName}`);
      return response.data.length > 0; // Assuming the API returns a list of matching brands
    } catch (error) {
      console.error('Error checking brand name:', error);
      setError('Error checking brand name.');
      Toastify({
        text: 'Error checking brand name.',
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
      }).showToast();
      return false;
    }
  };

  const handleAddBrand = async () => {
    if (!validateNewBrandData()) {
      return;
    }

    const brandNameExists = await checkBrandNameExists(newBrandData.brandName);
    if (brandNameExists) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        brandName: 'Brand name already exists.'
      }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('https://3.1.81.96/api/Brands', { ...newBrandData, brandImage: brandImage });
      if (response.status === 201) {
        setNewBrandData({
          brandName: '',
          brandDescription: '',
          brandImage: '',
          brandContactEmail: ''
        });
        setShowAddBrandDialog(false);
        fetchBrandData();
        Toastify({
          text: 'Brand added successfully!',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
        }).showToast();
      } else {
        console.error('Error creating brand:', response);
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
      console.error('Error creating brand:', error);
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

  const handleUpdateBrand = async () => {
    if (!validateUpdateBrandData()) {
      return;
    }
    if (!selectedBrand) return;
    try {
      const response = await axios.put(`https://3.1.81.96/api/Brands/${selectedBrand.brandId}`, {
        ...updateBrandData,
        brandImage: brandImage
      });
      if (response.status === 200) {
        fetchBrandData();
        Toastify({
          text: 'Brand updated successfully!',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
        }).showToast();
        setShowUpdateBrandDialog(false);
      } else {
        console.error('Error updating brand:', response);
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
      console.error('Error updating brand:', error);
      setError('An error occurred while updating the brand.');
      Toastify({
        text: 'An error occurred while updating the brand.',
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
      }).showToast();
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewBrandData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleUpdateChange = (event) => {
    const { name, value } = event.target;
    setUpdateBrandData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleCloseAddBrandDialog = () => {
    setShowAddBrandDialog(false);
    setValidationErrors({});
  };

  const handleCloseUpdateBrandDialog = () => {
    setShowUpdateBrandDialog(false);
    setValidationErrors({});
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;
    try {
      const response = await axios.delete(`https://3.1.81.96/api/Brands/${selectedBrand.brandId}`);
      if (response.status === 200) {
        setBrandData(brandData.filter((brand) => brand.brandId !== selectedBrand.brandId));
        Toastify({
          text: 'Brand deleted successfully!',
          duration: 3000,
          close: true,
          gravity: 'top',
          position: 'right',
          backgroundColor: 'linear-gradient(to right, #00b09b, #96c93d)'
        }).showToast();
        setShowDeleteConfirmDialog(false);
      } else {
        console.error('Error deleting brand:', response);
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
      console.error('Error deleting brand:', error);
      setError('An error occurred while deleting the brand.');
      Toastify({
        text: 'An error occurred while deleting the brand.',
        duration: 3000,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
      }).showToast();
    }
  };

  const handleOpenDeleteConfirmDialog = (brand) => {
    setSelectedBrand(brand);
    setShowDeleteConfirmDialog(true);
  };

  const handleCloseDeleteConfirmDialog = () => {
    setShowDeleteConfirmDialog(false);
    setSelectedBrand(null);
  };

  const handleOpenUpdateDialog = (brand) => {
    setSelectedBrand(brand);
    setUpdateBrandData({
      brandDescription: brand.brandDescription,
      brandImage: brand.brandImage
    });
    setShowUpdateBrandDialog(true);
    setBrandImage(brand.brandImage);
  };

  const fetchBrandData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://3.1.81.96/api/Brands', {
        params: {
          pageSize: rowsPerPage,
          pageNumber: page
        }
      });
      const sortedData = response.data.sort((a, b) => new Date(b.brandId) - new Date(a.brandId));
      setBrandData(sortedData);
      setPage(0);
    } catch (error) {
      console.error('Error fetching brand data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandData();
  }, []);

  const handleImageUpload = async (event) => {
    const userId = 469;
    const file = event.target.files[0];
    const formData = new FormData();
    const preset_key = 'xdm798lx';
    const folder = `users/${userId}`;
    const tags = `${userId}`;
    if (file) {
      // const url = URL.createObjectURL(file);
      formData.append('file', file);
      formData.append('upload_preset', preset_key);
      formData.append('tags', tags);
      formData.append('folder', folder);
      axios.post('https://api.cloudinary.com/v1_1/dchov8fes/image/upload', formData).then(async (result) => {
        const imageUrl = result.data.secure_url;
        setBrandImage(imageUrl);
        setNewBrandData((prevBrandData) => ({
          ...prevBrandData,
          brandImage: imageUrl
        }));
        setUpdateBrandData((prevBrandData) => ({
          ...prevBrandData,
          brandImage: imageUrl
        }));
        console.log('Result hihi: ', result.data.secure_url);
      });
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <MainCard title="Brand Table">
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
          <Button
            variant="contained"
            color="success"
            startIcon={<AddCircleOutlined />}
            onClick={() => setShowAddBrandDialog(true)}
            sx={{ mb: 2, color: 'white' }}
          >
            Add Brand
          </Button>
        </Box>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Brand Image</TableCell>
                  <TableCell>Brand Name</TableCell>
                  <TableCell>Contact Email</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brandData
                  .filter(
                    (brand) =>
                      brand.brandName.toLowerCase().includes(filter.toLowerCase()) ||
                      brand.brandContactEmail.toLowerCase().includes(filter.toLowerCase())
                  )
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((brand) => (
                    <TableRow key={brand.brandId}>
                      <TableCell>
                        <Avatar src={brand.brandImage} sx={{ width: 56, height: 56 }} />
                      </TableCell>
                      <TableCell>{brand.brandName}</TableCell>
                      <TableCell>{brand.brandContactEmail}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button variant="contained" color="info" size="small" onClick={() => handleOpenUpdateDialog(brand)}>
                            <Edit />
                          </Button>
                          <Button variant="contained" color="error" size="small" onClick={() => handleOpenDeleteConfirmDialog(brand)}>
                            <Delete />
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={brandData.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[3, 5, 10]}
            />
          </TableContainer>
        )}
      </MainCard>

      <Dialog open={showAddBrandDialog} onClose={handleCloseAddBrandDialog}>
        <DialogTitle>Add New Brand</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter the details for the new brand.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Brand Name"
            name="brandName"
            fullWidth
            variant="outlined"
            value={newBrandData.brandName}
            onChange={handleChange}
            error={!!validationErrors.brandName}
            helperText={validationErrors.brandName}
          />
          <TextField
            margin="dense"
            label="Brand Description"
            name="brandDescription"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newBrandData.brandDescription}
            onChange={handleChange}
            error={!!validationErrors.brandDescription}
            helperText={validationErrors.brandDescription}
          />
          <Input
            type="file"
            name="brandImage"
            accept="image/*"
            onChange={handleImageUpload}
            fullWidth
            margin="dense"
            error={!!validationErrors.brandImage}
            required
          />
          <FormHelperText error={!!validationErrors.brandImage}>{validationErrors.brandImage}</FormHelperText>
          <TextField
            margin="dense"
            label="Brand Contact Email"
            name="brandContactEmail"
            fullWidth
            variant="outlined"
            value={newBrandData.brandContactEmail}
            onChange={handleChange}
            error={!!validationErrors.brandContactEmail}
            helperText={validationErrors.brandContactEmail}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddBrandDialog}>Cancel</Button>
          <Button onClick={handleAddBrand} disabled={isLoading} variant="contained" color="success">
            <Typography color={'white'}>{isLoading ? 'Adding...' : 'Add'}</Typography>
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showUpdateBrandDialog} onClose={handleCloseUpdateBrandDialog}>
        <DialogTitle>Update Brand</DialogTitle>
        <DialogContent>
          <DialogContentText>Update the details for the selected brand.</DialogContentText>
          <TextField
            margin="dense"
            label="Brand Description"
            name="brandDescription"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={updateBrandData.brandDescription}
            onChange={handleUpdateChange}
            required
            error={!!validationErrors.brandDescription}
            helperText={validationErrors.brandDescription}
          />
          <Input
            type="file"
            name="brandImage"
            accept="image/*"
            onChange={handleImageUpload}
            fullWidth
            margin="dense"
            error={!!validationErrors.brandImage}
            required
          />
          <FormHelperText error={!!validationErrors.brandImage}>{validationErrors.brandImage}</FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateBrandDialog}>Cancel</Button>
          <Button onClick={handleUpdateBrand} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteConfirmDialog} onClose={handleCloseDeleteConfirmDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this brand?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmDialog}>Cancel</Button>
          <Button onClick={handleDeleteBrand} variant="contained" color="error">
            <Typography sx={{ fontWeight: 'bold' }}>Delete</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UtilitiesBrand;
