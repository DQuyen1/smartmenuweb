import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
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
  Grid,
  Input,
  FormHelperText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AddCircleOutlined, Visibility, Delete, Edit } from '@mui/icons-material';

const MyCollection = () => {
  const [collectionData, setCollectionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showAddCollectionDialog, setShowAddCollectionDialog] = useState(false);
  const [showEditCollectionDialog, setShowEditCollectionDialog] = useState(false);
  const navigate = useNavigate();
  const [newCollectionData, setNewCollectionData] = useState({
    brandId: '',
    collectionName: '',
    collectionDescription: '',
    collectionBackgroundImgPath: ''
  });
  const [filter, setFilter] = useState('');
  const [editCollectionData, setEditCollectionData] = useState({
    collectionId: '',
    brandId: '',
    collectionName: '',
    collectionDescription: '',
    collectionBackgroundImgPath: ''
  });
  const [collectionBackgroundImgPath, setCollectionBackgroundImgPath] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateNewCollectionData = () => {
    const errors = {};
    if (!newCollectionData.collectionName.trim()) {
      errors.collectionName = 'Collection name is required';
    }
    if (!newCollectionData.collectionDescription.trim()) {
      errors.collectionDescription = 'Collection description is required';
    }
    if (!newCollectionData.collectionBackgroundImgPath) {
      errors.collectionBackgroundImgPath = 'Collection background image is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditCollectionData = () => {
    const errors = {};
    if (!editCollectionData.collectionName.trim()) {
      errors.collectionName = 'Collection name is required';
    }
    if (!editCollectionData.collectionDescription.trim()) {
      errors.collectionDescription = 'Collection description is required';
    }
    if (!editCollectionData.collectionBackgroundImgPath) {
      errors.collectionBackgroundImgPath = 'Collection background image is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCollection = async () => {
    if (!validateNewCollectionData()) {
      return;
    }
    try {
      const brandId = localStorage.getItem('brandId');
      const response = await axios.post('http://3.1.81.96/api/Collections', {
        ...newCollectionData,
        brandId: brandId,
        collectionBackgroundImgPath: collectionBackgroundImgPath
      });

      if (response.status === 201) {
        setNewCollectionData({
          brandId: '',
          collectionName: '',
          collectionDescription: '',
          collectionBackgroundImgPath: ''
        });
        setShowAddCollectionDialog(false);
        fetchCollectionData();
        setOpenSnackbar(true);
        setSnackbarMessage('Collection added successfully!');
      } else {
        console.error('Error creating collection:', response);
        setError(response.statusText);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      setError(error.message);
    }
  };

  const handleEditCollection = async () => {
    if (!validateEditCollectionData()) {
      return;
    }
    try {
      const brandId = localStorage.getItem('brandId');
      const response = await axios.put(`http://3.1.81.96/api/Collections/${editCollectionData.collectionId}`, {
        ...editCollectionData,
        brandId: brandId,
        collectionBackgroundImgPath: collectionBackgroundImgPath
      });

      if (response.status === 200) {
        setShowEditCollectionDialog(false);
        fetchCollectionData();
        setOpenSnackbar(true);
        setSnackbarMessage('Collection updated successfully!');
      } else {
        console.error('Error updating collection:', response);
        setError(response.statusText);
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      setError(error.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewCollectionData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditCollectionData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleCloseAddCollectionDialog = () => {
    setShowAddCollectionDialog(false);
    setValidationErrors({});
  };

  const handleCloseEditCollectionDialog = () => {
    setShowEditCollectionDialog(false);
    setValidationErrors({});
  };

  const handleEditClick = (collection) => {
    setEditCollectionData(collection);
    setShowEditCollectionDialog(true);
    setCollectionBackgroundImgPath(collection.collectionBackgroundImgPath);
  };

  const fetchCollectionData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const brandId = localStorage.getItem('brandId');
      const response = await axios.get('http://3.1.81.96/api/Collections', {
        params: {
          brandId: brandId,
          pageNumber: 1,
          pageSize: 100
        }
      });

      if (!response.data) {
        throw new Error('Missing data from API response');
      }
      setCollectionData(response.data);
    } catch (error) {
      console.error('Error fetching collection data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionData();
  }, []);

  const handleDelete = async (collectionId) => {
    try {
      const response = await axios.delete(`http://3.1.81.96/api/Collections/${collectionId}`);
      if (response.status === 200) {
        setCollectionData(collectionData.filter((collection) => collection.collectionId !== collectionId));
        setOpenSnackbar(true);
        setSnackbarMessage('Collection deleted successfully!');
      } else {
        console.error('Error deleting collection:', response);
        setError(response.statusText);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      setError(error.message);
    }
  };

  const handleViewDetails = (collection) => {
    navigate('/my-collection-details', { state: { collectionData: collection } });
  };

  const filteredCollectionData = collectionData.filter((collection) => {
    const collectionNameMatch = collection.collectionName?.toLowerCase().includes(filter.toLowerCase());
    const brandIdMatch = collection.brandId?.toString().includes(filter.toLowerCase());
    return collectionNameMatch || brandIdMatch;
  });

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
        setCollectionBackgroundImgPath(imageUrl);
        setNewCollectionData((prevCollectionData) => ({
          ...prevCollectionData,
          collectionBackgroundImgPath: imageUrl
        }));
        setEditCollectionData((prevCollectionData) => ({
          ...prevCollectionData,
          collectionBackgroundImgPath: imageUrl
        }));
        console.log('Result hihi: ', result.data.secure_url);
      });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard title="Collections">
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
                  mr: 60,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    paddingRight: 1
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowAddCollectionDialog(true)}
                startIcon={<AddCircleOutlined />}
                sx={{
                  borderRadius: 2,
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  py: 1.5,
                  whiteSpace: 'nowrap'
                }}
                size="small"
              >
                Add Collection
              </Button>
            </Box>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
              </div>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <Grid container spacing={3}>
                {filteredCollectionData.map((collection) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={collection.collectionId}>
                    <Card sx={{ border: '1px solid #ccc', borderRadius: 2, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={collection.collectionBackgroundImgPath}
                        alt={collection.collectionName}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                          {collection.collectionName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {collection.collectionDescription}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="info" onClick={() => handleViewDetails(collection)} startIcon={<Visibility />}>
                          View
                        </Button>
                        <Button size="small" color="success" onClick={() => handleEditClick(collection)} startIcon={<Edit />}>
                          Edit
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDelete(collection.collectionId)} startIcon={<Delete />}>
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </MainCard>
        </Grid>
      </Grid>

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={showAddCollectionDialog} onClose={handleCloseAddCollectionDialog}>
        <DialogTitle>Add Collection</DialogTitle>
        <DialogContent>
          <DialogContentText>To add a new collection, please fill out the form below.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="collectionName"
            label="Collection Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCollectionData.collectionName}
            onChange={handleChange}
            required
            error={!!validationErrors.collectionName}
            helperText={validationErrors.collectionName}
          />
          <TextField
            margin="dense"
            name="collectionDescription"
            label="Collection Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newCollectionData.collectionDescription}
            onChange={handleChange}
            required
            error={!!validationErrors.collectionDescription}
            helperText={validationErrors.collectionDescription}
          />
          <Input
            type="file"
            name="collectionBackgroundImgPath"
            accept="image/*"
            onChange={handleImageUpload}
            fullWidth
            margin="dense"
            error={!!validationErrors.collectionBackgroundImgPath}
          />
          <FormHelperText error>{validationErrors.collectionBackgroundImgPath}</FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCollectionDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddCollection} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditCollectionDialog} onClose={handleCloseEditCollectionDialog}>
        <DialogTitle>Edit Collection</DialogTitle>
        <DialogContent>
          <DialogContentText>To edit this collection, please modify the fields below.</DialogContentText>
          <TextField
            margin="dense"
            name="collectionName"
            label="Collection Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editCollectionData.collectionName}
            onChange={handleEditChange}
            required
            error={!!validationErrors.collectionName}
            helperText={validationErrors.collectionName}
          />
          <TextField
            margin="dense"
            name="collectionDescription"
            label="Collection Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editCollectionData.collectionDescription}
            onChange={handleEditChange}
            required
            error={!!validationErrors.collectionDescription}
            helperText={validationErrors.collectionDescription}
          />
          <Input
            type="file"
            name="collectionBackgroundImgPath"
            accept="image/*"
            onChange={handleImageUpload}
            fullWidth
            margin="dense"
            error={!!validationErrors.collectionBackgroundImgPath}
          />
          <FormHelperText error>{validationErrors.collectionBackgroundImgPath}</FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditCollectionDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEditCollection} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCollection;
