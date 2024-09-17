import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Input,
  FormHelperText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AddCircleOutlined, Delete, Edit } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // Import three dots icon

const MyTemplate = () => {
  const [templateData, setTemplateData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(''); // New state for search filter
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const open = Boolean(anchorEl);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showAddTemplateDialog, setShowAddTemplateDialog] = useState(false);
  const [showEditTemplateDialog, setShowEditTemplateDialog] = useState(false);
  const brandId = localStorage.getItem('brandId');
  const [newTemplateData, setNewTemplateData] = useState({
    brandId: brandId,
    templateName: '',
    templateDescription: '',
    templateOrientation: '',
    templateType: 1
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [templateImgPath, setTemplateImgPath] = useState(false);
  const [editTemplateData, setEditTemplateData] = useState({});

  const validateNewTemplateData = () => {
    const errors = {};
    if (!newTemplateData.templateName.trim()) {
      errors.templateName = 'Template name is required';
    }
    if (!newTemplateData.templateDescription.trim()) {
      errors.templateDescription = 'Template description is required';
    }
    if (!newTemplateData.templateOrientation) {
      errors.templateOrientation = 'Template orientation is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditTemplateData = () => {
    const errors = {};
    if (!editTemplateData.templateName.trim()) {
      errors.templateName = 'Template name is required';
    }
    if (!editTemplateData.templateDescription.trim()) {
      errors.templateDescription = 'Template description is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTemplate = async () => {
    if (!validateNewTemplateData()) {
      return;
    }
    const payload = {
      ...newTemplateData,
      brandId: brandId,
      templateImgPath:
        newTemplateData.templateImgPath ||
        'https://png.pngtree.com/thumb_back/fh260/background/20200821/pngtree-pure-white-minimalist-background-wallpaper-image_396581.jpg'
    };
    console.log('Payload:', payload); // Log the payload being sent
    try {
      const response = await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates', payload);
      if (response.status === 201) {
        // Update template data locally (assuming server returns the created template data)
        fetchData();
        setOpenSnackbar(true);
        setSnackbarMessage('Template added successfully!');
        setShowAddTemplateDialog(false);

        console.log('Template added successfully:', response.data);
        navigate(`/pages/template/${response.data.templateId}`, {
          state: {
            templateType: response.data.templateType,
            templateWidth: response.data.templateWidth,
            templateHeight: response.data.templateHeight
          }
        });
      } else {
        console.error('Error creating template:', response);
        setError(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      setError(`Error: ${error.message}`);
    }
  };

  const handleEditTemplate = async () => {
    if (!validateEditTemplateData()) {
      return;
    }

    try {
      const response = await axios.put(`http://3.1.81.96/api/Templates/${editTemplateData.templateId}`, {
        ...editTemplateData,
        templateImgPath:
          editTemplateData.templateImgPath ||
          'https://png.pngtree.com/thumb_back/fh260/background/20200821/pngtree-pure-white-minimalist-background-wallpaper-image_396581.jpg'
      });
      if (response.status === 200) {
        fetchData();
        setOpenSnackbar(true);
        setSnackbarMessage('Template updated successfully!');
        setShowEditTemplateDialog(false);
      } else {
        setError(`Error: ${response.statusText}`);
        console.error('Error updating template:', response);
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
      console.error('Error updating template:', error);
    }
  };

  const handleAddTemplateChange = (event) => {
    const { name, value } = event.target;

    if (name === 'templateOrientation') {
      setNewTemplateData((prevState) => ({
        ...prevState,
        templateWidth: value === 'vertical' ? 608 : 1080,
        templateHeight: value === 'vertical' ? 720 : 720,
        templateType: value === 'vertical' ? 1 : 0, // Correct the order for horizontal
        [name]: value
      }));
    } else {
      setNewTemplateData((prevState) => ({ ...prevState, [name]: value }));
    }

    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '' // Clear error for the field being updated
    }));
  };

  const handleEditTemplateChange = (event) => {
    const { name, value } = event.target;

    if (name === 'templateOrientation') {
      setEditTemplateData((prevState) => ({
        ...prevState,
        templateWidth: value === 'vertical' ? 794 : 1080,
        templateHeight: value === 'vertical' ? 1123 : 608,
        [name]: value
      }));
    } else {
      setEditTemplateData((prevState) => ({ ...prevState, [name]: value }));
    }

    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const handleCloseAddTemplateDialog = () => {
    setShowAddTemplateDialog(false);
    setValidationErrors({});
  };

  const handleCloseEditTemplateDialog = () => {
    setShowEditTemplateDialog(false);
    setValidationErrors({});
  };

  const handleViewDetails = (template) => {
    navigate('/my-template-details', { state: { templateId: template.templateId } });
  };

  const handleClick = (event, template) => {
    event.stopPropagation(); // Stop event propagation
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://3.1.81.96/api/Templates/${selectedTemplate.templateId}`);
      if (response.status === 200) {
        setTemplateData((prevData) => prevData.filter((item) => item.templateId !== selectedTemplate.templateId));
        setOpenSnackbar(true);
        setSnackbarMessage('Template deleted successfully!');
      } else {
        console.error('Error deleting template:', response);
        setError(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      setError(`Error: ${error.message}`);
    } finally {
      handleClose(); // Close menu
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    console.log('token: ', token);

    try {
      const brandId = localStorage.getItem('brandId');
      const templateResponse = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates', {
        params: {
          brandId: brandId,
          pageNumber: 1,
          pageSize: 1000
        }
        // headers: {
        //   Authorization: `Bearer ${token}`
        // }
      });
      setTemplateData(templateResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTemplates = templateData.filter((template) => template.templateName.toLowerCase().includes(filter.toLowerCase()));

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
        setTemplateImgPath(imageUrl);
        setNewTemplateData((prevTemplateData) => ({
          ...prevTemplateData,
          templateImgPath: imageUrl
        }));
        setEditTemplateData((prevTemplateData) => ({
          ...prevTemplateData,
          templateImgPath: imageUrl
        }));
        console.log('Result hihi: ', result.data.secure_url);
      });
    }
  };

  const handleOpenEditDialog = (template) => {
    setEditTemplateData({
      templateId: template.templateId,
      templateName: template.templateName,
      templateDescription: template.templateDescription,
      templateWidth: template.templateWidth,
      templateHeight: template.templateHeight,
      templateImgPath: template.templateImgPath
    });
    setShowEditTemplateDialog(true);
    setTemplateImgPath(template.templateImgPath);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard title="Templates">
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
                onClick={() => setShowAddTemplateDialog(true)}
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
                Add Template
              </Button>
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <Grid container spacing={3}>
                {filteredTemplates.map((template, index) => (
                  <Grid item xs={12} sm={6} md={4} key={template.templateId || index}>
                    <Card sx={{ border: 1, borderColor: 'divider', cursor: 'pointer' }} onClick={() => handleViewDetails(template)}>
                      {/* Optional: Display an image */}
                      {template.templateImgPath && (
                        <CardMedia component="img" height="200" image={template.templateImgPath} alt={template.templateName} />
                      )}
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography gutterBottom variant="h4" component="div">
                            {template.templateName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {template.templateWidth} x {template.templateHeight}
                          </Typography>
                        </Box>
                        {/* Three Dots Menu Button */}
                        <IconButton aria-label="settings" onClick={(event) => handleClick(event, template)}>
                          <MoreVertIcon />
                        </IconButton>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </MainCard>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarMessage ? 'success' : 'error'}>{snackbarMessage}</Alert>
      </Snackbar>

      <Menu
        id="template-menu"
        anchorEl={anchorEl}
        open={open}
        disableScrollLock
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}
      >
        <MenuItem
          onClick={() => {
            handleOpenEditDialog(selectedTemplate);
            console.log('edit', selectedTemplate);
            handleClose();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary={<Typography color="primary">Edit</Typography>} />
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary={<Typography color="error">Delete</Typography>} />
        </MenuItem>
      </Menu>

      <Dialog open={showAddTemplateDialog} onClose={handleCloseAddTemplateDialog}>
        <DialogTitle>Add New Template</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter the details of the new template.</DialogContentText>
          <TextField
            margin="dense"
            name="templateName"
            label="Template Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newTemplateData.templateName}
            onChange={handleAddTemplateChange}
            required
            error={!!validationErrors.templateName}
            helperText={validationErrors.templateName}
          />
          <TextField
            margin="dense"
            name="templateDescription"
            label="Template Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newTemplateData.templateDescription}
            onChange={handleAddTemplateChange}
            required
            error={!!validationErrors.templateDescription}
            helperText={validationErrors.templateDescription}
          />
          <TextField
            margin="dense"
            id="orientation-select"
            name="templateOrientation"
            type="text"
            label="Orientation"
            fullWidth
            variant="outlined"
            value={newTemplateData.templateOrientation}
            onChange={handleAddTemplateChange}
            select
            SelectProps={{ native: true }}
            required
            error={!!validationErrors.templateOrientation}
            helperText={validationErrors.templateOrientation}
          >
            <option value="" disabled></option>
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </TextField>
          {/* <Input
            type="file"
            name="templateImgPath"
            accept="image/*"
            onChange={handleImageUpload}
            fullWidth
            margin="dense"
            error={!!validationErrors.templateImgPath}
            required
          />
          <FormHelperText error={!!validationErrors.templateImgPath}>{validationErrors.templateImgPath}</FormHelperText> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddTemplateDialog} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddTemplate}>
            Add Template
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showEditTemplateDialog} onClose={handleCloseEditTemplateDialog}>
        <DialogTitle>Edit Template</DialogTitle>
        <DialogContent>
          <DialogContentText>Edit the details of the template.</DialogContentText>
          <TextField
            margin="dense"
            name="templateName"
            label="Template Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editTemplateData.templateName}
            onChange={handleEditTemplateChange}
            required
            error={!!validationErrors.templateName}
            helperText={validationErrors.templateName}
          />
          <TextField
            margin="dense"
            name="templateDescription"
            label="Template Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editTemplateData.templateDescription}
            onChange={handleEditTemplateChange}
            required
            error={!!validationErrors.templateDescription}
            helperText={validationErrors.templateDescription}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditTemplateDialog} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleEditTemplate}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyTemplate;
