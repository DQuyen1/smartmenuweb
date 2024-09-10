import React, { useEffect, useState } from 'react';
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
  CardMedia,
  MenuItem,
  FormHelperText,
  Input,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AddCircleOutlined, Edit, Delete, Visibility } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';

const EntityCollection = () => {
  const [collectionData, setCollectionData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [editingCollection, setEditingCollection] = useState({
    collectionId: '',
    brandId: '',
    collectionName: '',
    collectionDescription: '',
    collectionBackgroundImgPath: ''
  });
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const handleBrandChange = (event) => {
    setSelectedBrandId(event.target.value);
  };
  //  const filteredCollectionData = collectionData.filter((collection) => {
  //   const collectionNameMatch = collection.collectionName?.toLowerCase().includes(filter.toLowerCase());
  //   const brandIdMatch = selectedBrandId ? collection.brandId?.toString() === selectedBrandId : true;
  //   return collectionNameMatch && brandIdMatch;
  // });

  const filteredCollectionData = collectionData.filter(
    (collection) =>
      collection.collectionName.toLowerCase().includes(filter.toLowerCase()) &&
      (selectedBrandId === '' || collection.brandId === parseInt(selectedBrandId))
  );
  const [validationErrors, setValidationErrors] = useState({});
  const [collectionBackgroundImgPath, setCollectionBackgroundImgPath] = useState(false);

  const validateNewCollectionData = () => {
    const errors = {};
    if (!newCollectionData.brandId) {
      errors.brandId = 'Brand is required';
    }
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
    if (!editingCollection.collectionName.trim()) {
      errors.collectionName = 'Collection name is required';
    }
    if (!editingCollection.collectionDescription.trim()) {
      errors.collectionDescription = 'Collection description is required';
    }
    if (!editingCollection.collectionBackgroundImgPath) {
      errors.collectionBackgroundImgPath = 'Collection background image is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCloseEditCollectionDialog = () => {
    setEditingCollection(null);
    setShowEditCollectionDialog(false);
    setValidationErrors({});
  };

  const handleSaveEdit = async () => {
    if (!validateEditCollectionData()) {
      return;
    }
    try {
      const response = await axios.put(`http://3.1.81.96/api/Collections/${editingCollection.collectionId}`, {
        ...editingCollection,
        collectionBackgroundImgPath: collectionBackgroundImgPath
      });

      if (response.status === 200) {
        setShowEditCollectionDialog(false);
        fetchData();
        setOpenSnackbar(true);
        setSnackbarMessage('Collection updated successfully!');
      } else {
        console.error('Error updating collection:', response);
        setError(response.data?.error || response.statusText);
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      setError('An error occurred while updating the collection.');
    }
  };

  const handleEditClick = (collection) => {
    setEditingCollection(collection);
    setShowEditCollectionDialog(true);
    setCollectionBackgroundImgPath(collection.collectionBackgroundImgPath);
  };

  const handleAddCollectionChange = (event) => {
    const { name, value } = event.target;
    setNewCollectionData((prevState) => ({
      ...prevState,
      [name]: value
    }));
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const handleAddCollection = async () => {
    if (!validateNewCollectionData()) {
      return;
    }
    try {
      const response = await axios.post('http://3.1.81.96/api/Collections', {
        ...newCollectionData,
        collectionBackgroundImgPath: collectionBackgroundImgPath
      });
      if (response.status === 201) {
        setNewCollectionData({ brandId: '', collectionName: '', collectionDescription: '' });
        setShowAddCollectionDialog(false);
        const updatedResponse = await axios.get('http://3.1.81.96/api/Collections/ProductGroup');
        setCollectionData(updatedResponse.data);
        setOpenSnackbar(true);
        setSnackbarMessage('Collection created successfully!');
      } else {
        console.error('Error creating collection:', response);
        setError(response.data?.error || response.statusText);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      setError('An error occurred while creating the collection.');
    }
  };

  const handleCloseAddCollectionDialog = () => {
    setShowAddCollectionDialog(false);
    setValidationErrors({});
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [collectionResponse, brandResponse] = await Promise.all([
        axios.get('http://3.1.81.96/api/Collections/ProductGroup'),
        axios.get('http://3.1.81.96/api/Brands')
      ]);
      setCollectionData(collectionResponse.data);
      setBrandData(brandResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetails = (collection) => {
    navigate('/collection-details', { state: { collectionData: collection } });
  };

  const handleDelete = async (collectionId) => {
    try {
      const response = await axios.delete(`http://3.1.81.96/api/Collections/${collectionId}`);
      if (response.status === 200) {
        setCollectionData(collectionData.filter((collection) => collection.collectionId !== collectionId));
        setOpenSnackbar(true);
        setSnackbarMessage('Collection deleted successfully!');
      } else {
        console.error('Error deleting collection:', response);
        setError(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      setError(`Error: ${error.message}`);
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
        setEditingCollection((prevCollectionData) => ({
          ...prevCollectionData,
          collectionBackgroundImgPath: imageUrl
        }));
        console.log('Result hihi: ', result.data.secure_url);
      });
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditingCollection((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  return (
    <>
      <MainCard title="Collections">
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
              <InputLabel id="brand-filter-label">Brand</InputLabel>
              <Select label="Brand" value={selectedBrandId} onChange={handleBrandChange} labelId="brand-filter-label">
                <MenuItem value="">All Brands</MenuItem>
                {brandData.map((brand) => (
                  <MenuItem key={brand.brandId} value={brand.brandId}>
                    {brand.brandName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            color="success"
            onClick={() => setShowAddCollectionDialog(true)}
            startIcon={<AddCircleOutlined />}
            sx={{ mb: 2, color: 'white' }}
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
                  <CardMedia component="img" height="140" image={collection.collectionBackgroundImgPath} alt={collection.collectionName} />
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

      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)} message={snackbarMessage} />
      <Dialog open={showAddCollectionDialog} onClose={handleCloseAddCollectionDialog}>
        <DialogTitle>Add New Collection</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter the details of the new collection.</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="brand-select"
            name="brandId"
            type="text"
            label="Brand Name"
            fullWidth
            variant="outlined"
            value={newCollectionData.brandId}
            onChange={handleAddCollectionChange}
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
            name="collectionName"
            label="Collection Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCollectionData.collectionName}
            onChange={handleAddCollectionChange}
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
            onChange={handleAddCollectionChange}
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
          <Button onClick={handleAddCollection} variant="contained" color="success">
            Add Collection
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showEditCollectionDialog} onClose={handleCloseEditCollectionDialog}>
        <DialogTitle>Edit Collection</DialogTitle>
        <DialogContent>
          <DialogContentText>Make changes to the collection details:</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="collectionName"
            label="Collection Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editingCollection?.collectionName || ''}
            onChange={handleEditChange}
          />
          <TextField
            autoFocus
            margin="dense"
            name="collectionDescription"
            label="Collection Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editingCollection?.collectionDescription || ''}
            onChange={handleEditChange}
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
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EntityCollection;
