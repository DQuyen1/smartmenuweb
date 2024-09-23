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
  Grid,
  TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AddCircleOutlined, Visibility, Delete, Edit } from '@mui/icons-material';

const MyMenu = () => {
  const [menuData, setMenuData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorInput, setErrorInput] = useState(null);
  const [showAddMenuDialog, setShowAddMenuDialog] = useState(false);
  const [showEditMenuDialog, setShowEditMenuDialog] = useState(false);
  const navigate = useNavigate();
  const [newMenuData, setNewMenuData] = useState({
    brandId: '',
    menuName: '',
    menuDescription: '',
    isDeleted: false
  });
  const [filter, setFilter] = useState('');
  const [editMenuData, setEditMenuData] = useState({
    menuId: '',
    brandId: '',
    menuName: '',
    menuDescription: '',
    isDeleted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Snackbar
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [openSnackBar, setOpenSnackBar] = React.useState(false);

  const handleAddMenu = async () => {
    try {
      // Retrieve brandId from localStorage
      setIsSubmitting(false);
      setErrorMessage('');
      setSuccessMessage('');
      const brandId = localStorage.getItem('brandId');

      const response = await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Menus', {
        ...newMenuData,
        brandId: brandId // Set brandId fetched from localStorage
      });

      if (response.status === 201) {
        // Successfully created new menu
        setNewMenuData({
          brandId: '',
          menuName: '',
          menuDescription: '',
          isDeleted: false
        });
        setShowAddMenuDialog(false);
        fetchMenuData(); // Refresh menu list
        setSuccessMessage('Menu added successfully');
        setOpenSnackBar(true);
      } else {
        const errorResponse = await response.json();
        setErrorMessage(errorResponse.error);
        setOpenSnackBar(true);
        setIsSubmitting(true);
      }
    } catch (error) {
      console.error('Error creating menu:', error);
      setError(error.message);
    }
  };

  const handleEditMenu = async () => {
    try {
      setIsSubmitting(false);
      // Retrieve brandId from localStorage
      const brandId = parseInt(localStorage.getItem('brandId'));

      const response = await axios.put(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Menus/${editMenuData.menuId}`, {
        ...editMenuData,
        brandId: brandId // Ensure brandId is included in the update payload
      });

      if (response.status === 200) {
        // Successfully updated menu
        setShowEditMenuDialog(false);
        fetchMenuData();
        setSuccessMessage('Menu updated successfully');
        setOpenSnackBar(true);
        setIsSubmitting(true);
      } else {
        const errorResponse = await response.json();
        console.log(errorResponse);
        setErrorMessage(errorResponse.error);
        setOpenSnackBar(true);
        setIsSubmitting(true);
      }
    } catch (error) {
      console.error('Error updating menu:', error);
      setError(error.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewMenuData((prevState) => ({ ...prevState, [name]: value }));

    // Validate menuName length
    if (name === 'menuName') {
      if (value.length < 5 || value.length > 50) {
        setErrorInput('Menu name must be between 5 and 50 characters.');
        setIsSubmitting(false);
        return;
      }
    }

    // Validate menuDescription length
    if (name === 'menuDescription') {
      if (value.length < 5 || value.length > 200) {
        setErrorInput('Menu description must be between 5 and 200 characters.');
        setIsSubmitting(false);
        return;
      }
    }

    // If no errors, clear the error and allow submitting
    setErrorInput('');
    setIsSubmitting(true);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditMenuData((prevState) => ({ ...prevState, [name]: value }));

    // Validate menuName length
    if (name === 'menuName') {
      if (value.length < 5 || value.length > 50) {
        setErrorInput('Menu name must be between 5 and 50 characters.');
        setIsSubmitting(false);
        return;
      }
    }

    // Validate menuDescription length
    if (name === 'menuDescription') {
      if (value.length < 5 || value.length > 200) {
        setErrorInput('Menu description must be between 5 and 200 characters.');
        setIsSubmitting(false);
        return;
      }
    }

    // If no errors, clear the error and allow submitting
    setErrorInput('');
    setIsSubmitting(true);
  };

  const handleCloseAddMenuDialog = () => {
    setShowAddMenuDialog(false);
  };

  const handleCloseEditMenuDialog = () => {
    setShowEditMenuDialog(false);
  };

  const handleEditClick = (menu) => {
    setEditMenuData(menu);
    setShowEditMenuDialog(true);
  };

  const fetchMenuData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Retrieve brandId from localStorage
      const brandId = localStorage.getItem('brandId');

      const response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Menus', {
        params: {
          brandId: brandId,
          pageNumber: 1,
          pageSize: 100
        }
      });

      if (!response.data) {
        throw new Error('Missing data from API response');
      }
      setMenuData(response.data);
    } catch (error) {
      // console.error('Error fetching menu data:', error);
      setError(error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []); // Empty dependency array ensures useEffect runs only once on component mount

  const handleDelete = async (menuId) => {
    try {
      const response = await axios.delete(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Menus/${menuId}`);
      if (response.status === 200) {
        // Successfully deleted menu
        setMenuData(menuData.filter((menu) => menu.menuId !== menuId));
        setSuccessMessage('Menu deleted successfully!');
        setOpenSnackBar(true);
      } else {
        console.error('Error deleting menu:', response);
        setError(error.response.data.error);
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      setError(error.response.data.error);
    }
  };

  const handleViewDetails = (menu) => {
    navigate('/my-menu-details', { state: { menuData: menu } });
  };

  const filteredMenuData = menuData.filter((menu) => {
    const menuNameMatch = menu.menuName?.toLowerCase().includes(filter.toLowerCase());
    const brandIdMatch = menu.brandId?.toString().includes(filter.toLowerCase());
    return menuNameMatch || brandIdMatch;
  });

  // Paginated
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when changing rows per page
  };

  // Calculate the data to be displayed based on pagination
  const paginatedData = filteredMenuData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard title="Menus">
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
                onClick={() => setShowAddMenuDialog(true)}
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
                disabled={error || isLoading}
              >
                Add Menu
              </Button>
            </Box>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
              </div>
            ) : error ? (
              <p style={{ color: 'red' }}>{error}</p>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ maxHeight: 450, overflowY: 'auto' }}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredMenuData.map((menu) => (
                        <TableRow key={menu.menuId}>
                          <TableCell sx={{ minWidth: '16rem', maxWidth: '16rem' }}>{menu.menuName}</TableCell>
                          <TableCell sx={{ minWidth: '32rem', maxWidth: '32rem' }}>{menu.menuDescription}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="info"
                              size="small"
                              onClick={() => handleViewDetails(menu)}
                              startIcon={<Visibility />}
                              sx={{
                                color: 'info.main',
                                borderColor: 'info.main',
                                '&:hover': {
                                  backgroundColor: 'info.light'
                                }
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="outlined"
                              color="success"
                              size="small"
                              onClick={() => handleEditClick(menu)}
                              startIcon={<Edit />}
                              sx={{
                                color: 'success.main',
                                borderColor: 'success.main',
                                '&:hover': {
                                  backgroundColor: 'success.light'
                                },
                                margin: '0.5rem'
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleDelete(menu.menuId)}
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

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredMenuData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </MainCard>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Box sx={{ width: 500 }}>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          autoHideDuration={4000}
          open={openSnackBar}
          onClose={() => setOpenSnackBar(!openSnackBar)}
          // message={errorMessage}
          // key={groupItem.productId}
        >
          <Alert
            onClose={() => setOpenSnackBar(!openSnackBar)}
            severity={errorMessage === '' ? 'success' : 'error'}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {errorMessage === '' ? successMessage : errorMessage}
          </Alert>
        </Snackbar>
      </Box>

      <Dialog open={showAddMenuDialog} onClose={handleCloseAddMenuDialog}>
        <DialogTitle>Add Menu</DialogTitle>
        <DialogContent sx={{ padding: '0px 24px' }}>
          <DialogContentText>To add a new menu, please fill out the form below.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="menuName"
            label="Menu Name"
            type="text"
            fullWidth
            variant="standard"
            value={newMenuData.menuName}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="menuDescription"
            label="Menu Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={newMenuData.menuDescription}
            onChange={handleChange}
          />
        </DialogContent>
        
        <DialogContent sx={{ minHeight: '46.67px', minWidth: '432px', padding: '0px 24px' }}>
          <DialogContentText>{errorInput && <p style={{ color: 'red' }}>{errorInput}</p>}</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseAddMenuDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddMenu} color="primary" disabled={!isSubmitting}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditMenuDialog} onClose={handleCloseEditMenuDialog}>
        <DialogTitle>Edit Menu</DialogTitle>
        <DialogContent>
          <DialogContentText>To edit this menu, please modify the fields below.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="menuName"
            label="Menu Name"
            type="text"
            fullWidth
            variant="standard"
            value={editMenuData.menuName}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="menuDescription"
            label="Menu Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={editMenuData.menuDescription}
            onChange={handleEditChange}
          />
        </DialogContent>

        <DialogContent sx={{ minHeight: '46.67px', minWidth: '432px', padding: '0px 24px' }}>
          <DialogContentText>{errorInput && <p style={{ color: 'red' }}>{errorInput}</p>}</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseEditMenuDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditMenu} color="primary" disabled={!isSubmitting}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyMenu;
