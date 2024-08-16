import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainCard from 'ui-component/cards/MainCard';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  InputAdornment,
  Snackbar,
  MenuItem,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AddCircleOutlined, Edit, Delete } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';

const EntityMenu = () => {
  const [menuData, setMenuData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState(null);
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showAddMenuDialog, setShowAddMenuDialog] = useState(false);
  const [newMenuData, setNewMenuData] = useState({
    brandId: '',
    menuName: '',
    menuDescription: ''
  });
  const [filter, setFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const open = Boolean(anchorEl); // To track the menu to delete
  const [showEditMenuDialog, setShowEditMenuDialog] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const filteredMenus = menuData.filter((menu) => menu.menuName.toLowerCase().includes(filter.toLowerCase()));

  const validateNewMenuData = () => {
    const errors = {};
    if (!newMenuData.brandId) {
      errors.brandId = 'Brand is required';
    }
    if (!newMenuData.menuName.trim()) {
      errors.menuName = 'Menu name is required';
    }
    if (!newMenuData.menuDescription.trim()) {
      errors.menuDescription = 'Menu description is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    setShowEditMenuDialog(true);
  };

  const handleCloseEditMenuDialog = () => {
    setShowEditMenuDialog(false);
    setEditingMenu(null); // Reset editingMenu when dialog closes
    handleClose(); // Close menu
    setValidationErrors({});
  };

  // handleSaveEdit
  const handleSaveEdit = async (menuId) => {
    if (!validateNewMenuData()) {
      return;
    }

    try {
      const updatedMenu = {
        menuName: editingMenu.menuName,
        menuDescription: editingMenu.menuDescription
      };

      const response = await axios.put(`https://3.1.81.96/api/Menus/${menuId}`, updatedMenu, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200) {
        // Successfully updated the menu
        setMenuData((prevData) => prevData.map((menu) => (menu.menuId === menuId ? response.data : menu)));
        setOpenSnackbar(true);
        setSnackbarMessage('Menu updated successfully!');
      } else {
        console.error('Error updating menu:', response);
        setError(response.data?.error || response.statusText); // Show error message from the backend
      }
    } catch (error) {
      console.error('Error updating menu:', error);
      setError('An error occurred while updating the menu.');
    } finally {
      handleCloseEditMenuDialog();
    }
  };

  const handleAddMenuChange = (event) => {
    const { name, value } = event.target;
    setNewMenuData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '' // Clear error for the field being updated
    }));
  };

  const handleAddMenu = async () => {
    if (!validateNewMenuData()) {
      return;
    }

    try {
      const response = await axios.post('https://3.1.81.96/api/Menus', newMenuData);
      if (response.status === 201) {
        // Successfully created new menu
        setNewMenuData({ brandId: '', menuName: '', menuDescription: '' });
        setShowAddMenuDialog(false);

        // Fetch the updated brand data after adding
        const updatedResponse = await axios.get('https://3.1.81.96/api/Menus/ProductGroup');
        setMenuData(updatedResponse.data);

        setOpenSnackbar(true);
        setSnackbarMessage('Menu added successfully!');
      } else {
        console.error('Error creating menu:', response);
        setError(response.data?.error || response.statusText); // Show error message from the backend
      }
    } catch (error) {
      console.error('Error creating menu:', error);
      setError('An error occurred while creating the menu.');
    }
  };

  const handleCloseAddMenuDialog = () => {
    setShowAddMenuDialog(false);
    setValidationErrors({});
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [menuResponse, brandResponse] = await Promise.all([
          axios.get('https://3.1.81.96/api/Menus/ProductGroup'),
          axios.get('https://3.1.81.96/api/Brands?pageNumber=1&pageSize=10')
        ]);
        setMenuData(menuResponse.data);
        setBrandData(brandResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'An error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewDetails = (menu) => {
    navigate('/menu-details', { state: { menuData: menu } });
  };

  const handleClick = (event, menu) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedMenu(menu);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`https://3.1.81.96/api/Menus/${selectedMenu.menuId}`);
      if (response.status === 200) {
        setMenuData((prevData) => prevData.filter((menu) => menu.menuId !== selectedMenu.menuId));
        setOpenSnackbar(true);
        setSnackbarMessage('Menu deleted successfully!');
      } else {
        console.error('Error deleting menu:', response);
        setError(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      setError(`Error: ${error.message}`);
    } finally {
      handleClose();
    }
  };

  return (
    <>
      <MainCard title="Menus">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextField
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            variant="outlined"
            sx={{ marginBottom: '16px' }} // Add flexGrow to take up available space
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }} // Add flexGrow to take up available space
          />
          <Button
            variant="contained"
            color="success"
            onClick={() => setShowAddMenuDialog(true)}
            startIcon={<AddCircleOutlined />}
            sx={{
              mb: 2, // Add margin bottom
              color: 'white'
            }}
          >
            Add Menu
          </Button>
        </Box>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredMenus.map((menu) => (
              <Grid item xs={12} sm={6} md={4} key={menu.menuId}>
                <Card
                  elevation={4} // Add elevation for a raised effect
                  sx={{
                    borderRadius: 2, // Slightly rounded corners
                    transition: 'box-shadow 0.3s ease', // Add a smooth transition
                    '&:hover': {
                      boxShadow: 6 // Increase the elevation on hover
                    }
                  }}
                >
                  <CardContent>
                    {editingMenu === menu.menuId ? (
                      <>
                        <TextField
                          label="Menu Name"
                          name="menuName"
                          value={menu.menuName}
                          onChange={(e) => handleChange(e, menu.menuId)}
                          fullWidth
                          margin="normal"
                        />
                        <TextField
                          label="Menu Description"
                          name="menuDescription"
                          value={menu.menuDescription}
                          onChange={(e) => handleChange(e, menu.menuId)}
                          fullWidth
                          margin="normal"
                        />
                      </>
                    ) : (
                      <>
                        <Typography gutterBottom variant="h5" component="div">
                          {menu.menuName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {menu.menuDescription}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    {/* Three Dots Menu Button */}
                    <IconButton aria-label="settings" onClick={(event) => handleClick(event, menu)}>
                      <MoreVertIcon />
                    </IconButton>
                    {/* View Details Button */}
                    <Button size="small" color="primary" onClick={() => handleViewDetails(menu)}>
                      View Details
                    </Button>
                    {/* Conditional buttons for Edit/Save/Cancel */}
                    {editingMenu === menu.menuId ? (
                      <>
                        <Button variant="outlined" color="primary" onClick={handleCloseEditMenuDialog} startIcon={<CancelIcon />}>
                          Cancel
                        </Button>
                        <Button variant="contained" color="primary" onClick={() => handleSaveEdit(menu.menuId)} startIcon={<SaveIcon />}>
                          Save
                        </Button>
                      </>
                    ) : (
                      <div></div> // Empty div to maintain spacing when not editing
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        {/* <MenuDetails menuData={menuData} handleSaveClick={handleEditMenu} setMenuData={setMenuData} /> */}
        <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)} message={snackbarMessage} />
        <Dialog open={showAddMenuDialog} onClose={handleCloseAddMenuDialog}>
          <DialogTitle>Add New Menu</DialogTitle>
          <DialogContent>
            <DialogContentText>Please enter the details of the new menu.</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="brand-select"
              name="brandId"
              type="text"
              label="Brand Name"
              fullWidth
              variant="outlined"
              value={newMenuData.brandId}
              onChange={handleAddMenuChange}
              select
              SelectProps={{ native: true }}
              required
              error={!!validationErrors.brandId}
              helperText={validationErrors.brandId}
            >
              <option value="" disabled></option>
              {brandData.map((brand) => (
                <option key={brand.brandId} value={brand.brandId}>
                  {brand.brandName}
                </option>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="menuName"
              label="Menu Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newMenuData.menuName}
              onChange={handleAddMenuChange} // Use handleAddMenuChange
              required
              error={!!validationErrors.menuName}
              helperText={validationErrors.menuName}
            />
            <TextField
              margin="dense"
              name="menuDescription"
              label="Menu Description"
              type="text"
              fullWidth
              variant="outlined"
              value={newMenuData.menuDescription}
              onChange={handleAddMenuChange} // Use handleAddMenuChange
              required
              error={!!validationErrors.menuDescription}
              helperText={validationErrors.menuDescription}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddMenuDialog}>Cancel</Button>
            <Button onClick={handleAddMenu} variant="contained">
              Add Menu
            </Button>
          </DialogActions>
        </Dialog>

        <Menu id="menu-actions" anchorEl={anchorEl} open={open} onClose={handleClose} MenuListProps={{ 'aria-labelledby': 'basic-button' }}>
          <MenuItem onClick={() => handleEditMenu(selectedMenu)}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary={<Typography color="error">Delete</Typography>} />
          </MenuItem>
        </Menu>
        <Dialog open={showEditMenuDialog} onClose={handleCloseEditMenuDialog}>
          <DialogTitle>Edit Menu</DialogTitle>
          <DialogContent>
            <DialogContentText>Make changes to the menu details:</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              name="menuName"
              label="Menu Name"
              type="text"
              fullWidth
              variant="outlined"
              value={editingMenu?.menuName || ''} // Use optional chaining
              onChange={(e) => setEditingMenu((prevMenu) => ({ ...prevMenu, menuName: e.target.value }))}
              error={!!validationErrors.menuName}
              helperText={validationErrors.menuName}
            />
            <TextField
              margin="dense"
              name="menuDescription"
              label="Menu Description"
              type="text"
              fullWidth
              variant="outlined"
              value={editingMenu?.menuDescription || ''} // Use optional chaining
              onChange={(e) => setEditingMenu((prevMenu) => ({ ...prevMenu, menuDescription: e.target.value }))}
              error={!!validationErrors.menuDescription}
              helperText={validationErrors.menuDescription}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditMenuDialog}>Cancel</Button>
            <Button onClick={() => handleSaveEdit(editingMenu?.menuId)} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </MainCard>
    </>
  );
};

export default EntityMenu;
