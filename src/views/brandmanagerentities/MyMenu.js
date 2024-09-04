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

const MyMenu = () => {
  const [menuData, setMenuData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
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

  const handleAddMenu = async () => {
    try {
      // Retrieve brandId from localStorage
      const brandId = localStorage.getItem('brandId');

      const response = await axios.post('http://3.1.81.96/api/Menus', {
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
        setOpenSnackbar(true);
        setSnackbarMessage('Menu added successfully!');
      } else {
        console.error('Error creating menu:', response);
        setError(response.statusText);
      }
    } catch (error) {
      console.error('Error creating menu:', error);
      setError(error.message);
    }
  };

  const handleEditMenu = async () => {
    try {
      // Retrieve brandId from localStorage
      const brandId = localStorage.getItem('brandId');

      const response = await axios.put(`http://3.1.81.96/api/Menus/${editMenuData.menuId}`, {
        ...editMenuData,
        brandId: brandId // Ensure brandId is included in the update payload
      });

      if (response.status === 200) {
        // Successfully updated menu
        setShowEditMenuDialog(false);
        fetchMenuData();
        setOpenSnackbar(true);
        setSnackbarMessage('Menu updated successfully!');
      } else {
        console.error('Error updating menu:', response);
        setError(response.statusText);
      }
    } catch (error) {
      console.error('Error updating menu:', error);
      setError(error.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewMenuData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditMenuData((prevState) => ({ ...prevState, [name]: value }));
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

      const response = await axios.get('http://3.1.81.96/api/Menus', {
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
      console.error('Error fetching menu data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []); // Empty dependency array ensures useEffect runs only once on component mount

  const handleDelete = async (menuId) => {
    try {
      const response = await axios.delete(`http://3.1.81.96/api/Menus/${menuId}`);
      if (response.status === 200) {
        // Successfully deleted menu
        setMenuData(menuData.filter((menu) => menu.menuId !== menuId));
        setOpenSnackbar(true);
        setSnackbarMessage('Menu deleted successfully!');
      } else {
        console.error('Error deleting menu:', response);
        setError(response.statusText);
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      setError(error.message);
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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard title={<Typography variant="h5">Menu Table</Typography>}>
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
              >
                Add Menu
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
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMenuData.map((menu) => (
                      <TableRow key={menu.menuId}>
                        <TableCell>{menu.menuName}</TableCell>
                        <TableCell>{menu.menuDescription}</TableCell>
                        <TableCell sx={{ display: 'flex', gap: 1 }}>
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
                              }
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
            )}
          </MainCard>
        </Grid>
      </Grid>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={showAddMenuDialog} onClose={handleCloseAddMenuDialog}>
        <DialogTitle>Add Menu</DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button onClick={handleCloseAddMenuDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddMenu} color="primary">
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
        <DialogActions>
          <Button onClick={handleCloseEditMenuDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditMenu} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyMenu;
