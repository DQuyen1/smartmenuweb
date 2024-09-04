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
  Typography,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AddCircleOutlined, Visibility, Delete, Edit } from '@mui/icons-material';

const MyCategory = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false);
  const navigate = useNavigate();
  const [newCategoryData, setNewCategoryData] = useState({
    categoryName: '',
    isDeleted: false
  });
  const [filter, setFilter] = useState('');
  const [editCategoryData, setEditCategoryData] = useState({
    categoryId: '',
    brandId: '',
    categoryName: '',
    isDeleted: false
  });
  const [validationErrors, setValidationErrors] = useState({});

  const validateNewCategoryData = () => {
    const errors = {};
    if (!newCategoryData.categoryName.trim()) {
      errors.categoryName = 'Category name is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditCategoryData = () => {
    const errors = {};
    if (!editCategoryData.categoryName.trim()) {
      errors.categoryName = 'Category name is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCategory = async () => {
    if (!validateNewCategoryData()) {
      return;
    }
    try {
      // Retrieve brandId from localStorage
      const brandId = localStorage.getItem('brandId');
      const response = await axios.post('http://3.1.81.96/api/Categories', {
        ...newCategoryData,
        brandId: brandId // Set brandId fetched from localStorage
      });
      if (response.status === 201) {
        // Successfully created new category
        setNewCategoryData({
          categoryName: '',
          isDeleted: false
        });
        setShowAddCategoryDialog(false);
        fetchCategoryData(); // Refresh category list
        setOpenSnackbar(true);
        setSnackbarMessage('Category added successfully!');
      } else {
        console.error('Error creating category:', response);
        setError(response.statusText);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError(error.message);
    }
  };

  const handleEditCategory = async () => {
    if (!validateEditCategoryData()) {
      return;
    }
    try {
      // Retrieve brandId from localStorage
      const brandId = localStorage.getItem('brandId');
      const response = await axios.put(`http://3.1.81.96/api/Categories/${editCategoryData.categoryId}`, {
        ...editCategoryData,
        brandId: brandId // Ensure brandId is included in the update payload
      });
      if (response.status === 200) {
        // Successfully updated category
        setShowEditCategoryDialog(false);
        fetchCategoryData();
        setOpenSnackbar(true);
        setSnackbarMessage('Category updated successfully!');
      } else {
        console.error('Error updating category:', response);
        setError(response.statusText);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError(error.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewCategoryData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditCategoryData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleCloseAddCategoryDialog = () => {
    setShowAddCategoryDialog(false);
    setValidationErrors({});
  };

  const handleCloseEditCategoryDialog = () => {
    setShowEditCategoryDialog(false);
    setValidationErrors({});
  };

  const handleEditClick = (category) => {
    setEditCategoryData(category);
    setShowEditCategoryDialog(true);
  };

  const fetchCategoryData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const brandId = localStorage.getItem('brandId');
      const response = await axios.get('http://3.1.81.96/api/Categories', {
        params: {
          brandId: brandId,
          pageNumber: 1,
          pageSize: 100
        }
      });
      if (!response.data) {
        throw new Error('Missing data from API response');
      }
      setCategoryData(response.data);
    } catch (error) {
      console.error('Error fetching category data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const brandId = localStorage.getItem('brandId');

        const response = await axios.get('http://3.1.81.96/api/Categories', {
          params: {
            brandId: brandId,
            pageNumber: 1,
            pageSize: 100 // Adjust pageSize as needed
          }
        });

        if (!response.data) {
          throw new Error('Missing data from API response');
        }

        // Update state with fetched category data
        setCategoryData(response.data);
      } catch (error) {
        console.error('Error fetching category data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, []); // Empty dependency array ensures useEffect runs only once on component mount

  const handleDelete = async (categoryId) => {
    try {
      const response = await axios.delete(`http://3.1.81.96/api/Categories/${categoryId}`);
      if (response.status === 200) {
        // Successfully deleted category
        setCategoryData(categoryData.filter((category) => category.categoryId !== categoryId));
        setOpenSnackbar(true);
        setSnackbarMessage('Category deleted successfully!');
      } else {
        console.error('Error deleting category:', response);
        setError(response.statusText);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(error.message);
    }
  };
  const handleProductPage = (categoryId) => {
    navigate('/utils/util-myproduct', { state: { categoryId } });
  };

  const filteredCategoryData = categoryData.filter((category) => {
    const categoryNameMatch = category.categoryName?.toLowerCase().includes(filter.toLowerCase());
    const brandIdMatch = category.brandId?.toString().includes(filter.toLowerCase());
    return categoryNameMatch || brandIdMatch;
  });

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard title={<Typography variant="h5">Category Table</Typography>}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{
                  width: '500px',
                  mr: 60, // Set a fixed width (adjust as needed)
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    paddingRight: 1
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowAddCategoryDialog(true)}
                startIcon={<AddCircleOutlined />}
                sx={{
                  borderRadius: 2,
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2, // Increase horizontal padding further
                  py: 1.5,
                  whiteSpace: 'nowrap' // Prevent text from wrapping
                }}
                size="small"
              >
                Add Category
              </Button>
            </Box>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
              </div>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 450, overflowY: 'auto' }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category Name</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCategoryData.map((category) => (
                      <TableRow key={category.categoryId}>
                        <TableCell>{category.categoryName}</TableCell>
                        <TableCell sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleProductPage(category.categoryId)}
                            startIcon={<Visibility />}
                            sx={{
                              color: 'primary.main',
                              borderColor: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.light'
                              }
                            }}
                          >
                            View List Product
                          </Button>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleEditClick(category)}
                            startIcon={<Edit />}
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
                            onClick={() => handleDelete(category.categoryId)}
                            startIcon={<Delete />}
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
        </Grid>
      </Grid>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarMessage ? 'success' : 'error'}>{snackbarMessage}</Alert>
      </Snackbar>
      <Dialog
        open={showAddCategoryDialog}
        onClose={handleCloseAddCategoryDialog}
        aria-labelledby="add-category-dialog-title"
        aria-describedby="add-category-dialog-description"
      >
        <DialogTitle id="add-category-dialog-title">Add New Category</DialogTitle>
        <DialogContent>
          <DialogContentText id="add-category-dialog-description">Please enter the details of the new category.</DialogContentText>
          <TextField
            margin="dense"
            name="categoryName"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCategoryData.categoryName}
            onChange={handleChange}
            required
            error={!!validationErrors.categoryName}
            helperText={validationErrors.categoryName}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCategoryDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCategory}>
            Add Category
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showEditCategoryDialog}
        onClose={handleCloseEditCategoryDialog}
        aria-labelledby="edit-category-dialog-title"
        aria-describedby="edit-category-dialog-description"
      >
        <DialogTitle id="edit-category-dialog-title">Edit Category</DialogTitle>
        <DialogContent>
          <DialogContentText id="edit-category-dialog-description">Please update the details of the category.</DialogContentText>

          <TextField
            margin="dense"
            name="categoryName"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editCategoryData.categoryName}
            onChange={handleEditChange}
            required
            error={!!validationErrors.categoryName}
            helperText={validationErrors.categoryName}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditCategoryDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleEditCategory}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCategory;
