import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import {
  Typography,
  Box,
  CircularProgress,
  List,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItem,
  Chip,
  Grid,
  ListItemText,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
  IconButton,
  FormGroup,
  FormControlLabel,
  Switch
} from '@mui/material';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const CollectionDetail = () => {
  const location = useLocation();
  const { collectionData: initialCollectionData } = location.state || {}; // Get collection data from location state
  const [collectionData, setCollectionData] = useState(initialCollectionData || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState({}); // State to store product details
  const [productGroupItemsData, setProductGroupItemsData] = useState({});
  const [productSizePrices, setProductSizePrices] = useState({});
  const [showAddProductGroupDialog, setShowAddProductGroupDialog] = useState(false);
  const [newProductGroupData, setNewProductGroupData] = useState({
    productGroupName: '',
    productGroupMaxCapacity: '',
    haveNormalPrice: true // Initialize with an empty string
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [productGroupToDelete, setProductGroupToDelete] = useState(null);
  const [showEditProductGroupDialog, setShowEditProductGroupDialog] = useState(false);
  const [editingProductGroup, setEditingProductGroup] = useState(null);
  const [showAddProductGroupItemDialog, setShowAddProductGroupItemDialog] = useState(false);
  const [newProductGroupItemData, setNewProductGroupItemData] = useState({
    productGroupId: '', // Now include productGroupId
    productId: ''
  });
  const [showDeleteItemConfirmation, setShowDeleteItemConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [productGroups, setProductGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const validateNewProductGroupData = () => {
    const errors = {};
    if (!newProductGroupData.productGroupName.trim()) {
      errors.productGroupName = 'Product group name is required';
    }
    if (!newProductGroupData.productGroupMaxCapacity.trim()) {
      errors.productGroupMaxCapacity = 'Product group max capacity is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateNewProductGroupItemData = () => {
    const errors = {};
    if (!newProductGroupItemData.productGroupId) {
      errors.productGroupId = 'Product group name is required';
    }
    if (!newProductGroupItemData.productId) {
      errors.productId = 'Product is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeleteProductGroupItem = (itemId) => {
    // Set the item to delete and open the confirmation dialog
    setItemToDelete(itemId);
    setShowDeleteItemConfirmation(true);
  };

  const confirmDeleteProductGroupItem = async () => {
    try {
      const response = await axios.delete(`http://3.1.81.96/api/ProductGroupItem/${itemToDelete}`);
      if (response.status === 200) {
        // Update productGroupItemsData
        setProductGroupItemsData((prevData) => {
          const newData = { ...prevData };
          Object.values(newData).forEach((groupItems) => {
            groupItems.splice(
              groupItems.findIndex((item) => item.productGroupItemId === itemToDelete),
              1
            );
          });
          return newData;
        });
      } else {
        console.error('Error deleting product group item:', response);
        setError(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting product group item:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setShowDeleteItemConfirmation(false);
    }
  };

  const handleAddProductGroupItemChange = (event) => {
    const { name, value } = event.target;
    setNewProductGroupItemData((prevState) => ({ ...prevState, [name]: value }));
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSaveAddProductGroupItem = async () => {
    if (!validateNewProductGroupItemData()) {
      return;
    }
    try {
      const dataToSend = {
        productGroupId: parseInt(newProductGroupItemData.productGroupId, 10),
        productId: parseInt(newProductGroupItemData.productId, 10)
      };
      const response = await axios.post(`http://3.1.81.96/api/ProductGroupItem`, dataToSend);
      if (response.status === 201) {
        const newItem = response.data;

        // Update the productGroupItemsData to include the new item
        setProductGroupItemsData((prevData) => ({
          ...prevData,
          [newItem.productGroupId]: [...(prevData[newItem.productGroupId] || []), newItem]
        }));

        setCollectionData((prevCollectionData) => ({
          ...prevCollectionData,
          productGroups: prevCollectionData.productGroups.map((group) =>
            group.productGroupId === newItem.productGroupId
              ? {
                  ...group,
                  productGroupItems: [...(group.productGroupItems || []), newItem]
                }
              : group
          )
        }));
        setOpenSnackbar(true);
        setSnackbarMessage('Product group item added successfully!');
      } else {
        console.error('Error adding product group item:', response);
        setError(response.data?.error || response.statusText); // Show specific error message from backend
      }
    } catch (error) {
      console.error('Error adding product group item:', error);
      setError('An error occurred while creating the collection item.');
    } finally {
      setShowAddProductGroupItemDialog(false);
    }
  };

  const handleEditProductGroup = (group) => {
    setEditingProductGroup(group);
    setShowEditProductGroupDialog(true);
  };

  const handleCloseEditProductGroupDialog = () => {
    setShowEditProductGroupDialog(false);
    setEditingProductGroup(null); // Reset editingProductGroup when dialog closes
  };

  const handleSaveEditProductGroup = async () => {
    try {
      const updatedGroupData = {
        productGroupName: editingProductGroup.productGroupName,
        haveNormalPrice: editingProductGroup.haveNormalPrice,
        productGroupMaxCapacity: parseInt(editingProductGroup.productGroupMaxCapacity, 10) || 0
      };
      const response = await axios.put(`http://3.1.81.96/api/ProductGroup/${editingProductGroup.productGroupId}`, updatedGroupData);

      if (response.status === 200) {
        setCollectionData((prevCollectionData) => ({
          ...prevCollectionData,
          productGroups: prevCollectionData.productGroups.map((group) =>
            group.productGroupId === editingProductGroup.productGroupId ? response.data : group
          )
        }));
        setOpenSnackbar(true);
        setSnackbarMessage('Product group updated successfully!');
      } else {
        console.error('Error updating product group:', response);
        setError(response.data?.error || response.statusText);
      }
    } catch (error) {
      console.error('Error updating product group:', error);
      setError('An error occurred while updating the product group.');
    } finally {
      handleCloseEditProductGroupDialog();
    }
  };

  const handleChangeProductGroup = (event) => {
    const { name, value, checked } = event.target;
    setEditingProductGroup((prevGroup) => ({
      ...prevGroup,
      [name]: name === 'haveNormalPrice' ? checked : value
    }));
  };

  const handleDeleteProductGroup = (productGroupId) => {
    // Set the product group to delete and open the confirmation dialog
    setProductGroupToDelete(productGroupId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteProductGroup = async () => {
    try {
      const response = await axios.delete(`http://3.1.81.96/api/ProductGroup/${productGroupToDelete}`);
      if (response.status === 200) {
        setCollectionData((prevCollectionData) => ({
          ...prevCollectionData,
          productGroups: prevCollectionData.productGroups.filter((group) => group.productGroupId !== productGroupToDelete)
        }));
        setProductGroupItemsData((prevData) => {
          const newData = { ...prevData };
          delete newData[productGroupToDelete];
          return newData;
        });

        // Remove deleted items from productSizePrices
        setProductSizePrices((prevData) => {
          const newData = { ...prevData };
          for (const item of productGroupItemsData[productGroupToDelete]) {
            delete newData[item.productId];
          }
          return newData;
        });
        setOpenSnackbar(true);
        setSnackbarMessage('Product group deleted successfully!');
      } else {
        console.error('Error deleting product group:', response);
        setError(response.data?.error || response.statusText);
      }
    } catch (error) {
      console.error('Error deleting product group:', error);
      setError('An error occurred while deleting the product group.');
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const handleAddProductGroupChange = (event) => {
    const { name, value, checked } = event.target;
    setNewProductGroupData((prevState) => ({
      ...prevState,
      [name]: name === 'haveNormalPrice' ? checked : value // Update boolean for Switch
    }));
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '' // Clear error for the field being updated
    }));
  };

  const handleAddProductGroup = async () => {
    if (!validateNewProductGroupData()) {
      return;
    }
    try {
      const dataToSend = {
        menuId: null,
        collectionId: collectionData.collectionId,
        productGroupName: newProductGroupData.productGroupName,
        productGroupMaxCapacity: parseInt(newProductGroupData.productGroupMaxCapacity, 10) || 0, // Parse to int or default to 0
        haveNormalPrice: newProductGroupData.haveNormalPrice
      };
      const response = await axios.post('http://3.1.81.96/api/ProductGroup', dataToSend);
      if (response.status === 201) {
        setCollectionData((prevCollectionData) => {
          const updatedProductGroups = [...(prevCollectionData.productGroups || []), response.data];
          return { ...prevCollectionData, productGroups: updatedProductGroups };
        });
        setOpenSnackbar(true);
        setSnackbarMessage('Product group added successfully!');
      } else {
        console.error('Error adding product group:', response);
        setError(`Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding product group:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setShowAddProductGroupDialog(false);
      setNewProductGroupData({
        productGroupName: '',
        productGroupMaxCapacity: '',
        haveNormalPrice: true
      });
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://3.1.81.96/api/Products?pageNumber=1&pageSize=100'); // Replace with your API endpoint
        setProducts(response.data); // Assuming response.data is an array of products
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('An error occurred while fetching products.');
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const productGroupResponse = await axios.get(
          `http://3.1.81.96/api/ProductGroup/GroupItem?collectionId=${collectionData.collectionId}`
        );
        setProductGroups(productGroupResponse.data);
        const productGroupItems = productGroupResponse.data;
        const productIds =
          collectionData.productGroups && collectionData.productGroups.length > 0
            ? [...new Set(productGroupItems.flatMap((group) => group.productGroupItems?.map((item) => item.productId) || []))]
            : [];

        if (productIds.length > 0) {
          const productResponse = await Promise.all(productIds.map((id) => axios.get(`http://3.1.81.96/api/Products?productId=${id}`)));

          const newProductMap = {};
          productResponse.forEach((response) => {
            // Access the first product in the response array
            const product = response.data[0];
            if (product && product.productId) {
              newProductMap[product.productId] = product; // Access the first element of the array
            }
          });
          setProductData(newProductMap);
          const productSizePromises = productIds.map(
            (id) => axios.get(`http://3.1.81.96/api/ProductSizePrices?productId=${id}`) // Assuming API supports filtering by productId
          );
          const productSizeResponses = await Promise.all(productSizePromises);

          const newProductSizePricesData = {};
          productSizeResponses.forEach((response) => {
            const productId = response.data[0]?.productId; // Get the first product id in response
            if (productId) {
              // Check if the productId exists
              newProductSizePricesData[productId] = response.data;
            }
          });

          setProductSizePrices(newProductSizePricesData);
        }

        const reorganizedProductGroups = {};
        productGroupItems.forEach((group) => {
          reorganizedProductGroups[group.productGroupId] = group.productGroupItems;
        });

        setProductGroupItemsData(reorganizedProductGroups);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [collectionData.collectionId, collectionData.productGroups]);

  const getProductSizeType = (sizeType) => {
    switch (sizeType) {
      case 0:
        return 'S';
      case 1:
        return 'M';
      case 2:
        return 'L';
      case 3:
        return 'N';
      default:
        return 'Unknown';
    }
  };

  return (
    <MainCard title="Collection Details">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1">Collection ID: {collectionData.collectionId}</Typography>
        <Typography variant="subtitle1">Brand ID: {collectionData.brandId}</Typography>
        <Typography variant="subtitle1">Collection Name: {collectionData.collectionName}</Typography>
        <Typography variant="subtitle1">Collection Description: {collectionData.collectionDescription}</Typography>
        <Typography variant="h6">Product Groups:</Typography>
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="contained" color="primary" onClick={() => setShowAddProductGroupDialog(true)}>
                Add Product Group
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="contained" color="primary" onClick={() => setShowAddProductGroupItemDialog(true)}>
                Add Product Group Item
              </Button>
            </Box>
            <List>
              {collectionData.productGroups?.map((group) => (
                <Accordion key={group.productGroupId} sx={{ border: '1px solid lightgray', mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{group.productGroupName}</Typography>
                    <IconButton aria-label="delete" onClick={() => handleDeleteProductGroup(group.productGroupId)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                    <IconButton aria-label="edit" onClick={() => handleEditProductGroup(group)}>
                      <EditIcon color="primary" />
                    </IconButton>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 2 }}>
                    <List>
                      {productGroupItemsData[group.productGroupId]?.map((item) => {
                        const product = productData[item.productId];
                        const sizePrices = productSizePrices[item.productId];

                        return product ? (
                          <ListItem key={item.productGroupItemId} disablePadding>
                            <Grid container alignItems="center">
                              {/* Product Name and Description */}
                              <Grid item xs={8} md={9}>
                                <ListItemText primary={product.productName} />
                              </Grid>

                              {/* Size and Price (horizontal layout) */}
                              <Grid item xs={4} md={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Stack direction="row" spacing={8}>
                                  {sizePrices?.map((sizePrice) => (
                                    <Chip
                                      key={sizePrice.productSizePriceId}
                                      label={`${getProductSizeType(sizePrice.productSizeType)} - $${sizePrice.price}`}
                                      size="small"
                                      sx={{
                                        backgroundColor: '#f0f0f0',
                                        color: 'text.primary',
                                        border: '1px solid #e0e0e0'
                                      }}
                                    />
                                  ))}
                                </Stack>
                                <IconButton
                                  aria-label="delete"
                                  onClick={() => handleDeleteProductGroupItem(item.productGroupItemId)}
                                  sx={{ ml: 1 }} // Margin left for spacing
                                >
                                  <DeleteIcon color="error" />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </ListItem>
                        ) : null;
                      })}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          </>
        )}
        <Dialog open={showDeleteItemConfirmation} onClose={() => setShowDeleteItemConfirmation(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this product group item? This action cannot be undone.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDeleteItemConfirmation(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={confirmDeleteProductGroupItem} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showAddProductGroupItemDialog} onClose={() => setShowAddProductGroupItemDialog(false)}>
          <DialogTitle>Add New Product Group Item</DialogTitle>
          <DialogContent>
            <DialogContentText>Enter the product group ID and product ID:</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="product-group-select-label" // Add this TextField for productGroupId
              name="productGroupId"
              type="text"
              label="Product Group"
              fullWidth
              variant="outlined"
              value={newProductGroupItemData.productGroupId}
              onChange={handleAddProductGroupItemChange}
              select
              SelectProps={{ native: true }}
              error={!!validationErrors.productGroupId}
              helperText={validationErrors.productGroupId}
              required
            >
              <option value="" disabled></option>
              {productGroups.map((group) => (
                <option key={group.productGroupId} value={group.productGroupId}>
                  {group.productGroupName}
                </option>
              ))}
            </TextField>
            <TextField
              autoFocus
              margin="dense"
              id="product-select-label"
              name="productId"
              type="text"
              label="Product"
              fullWidth
              variant="outlined"
              value={newProductGroupItemData.productId}
              onChange={handleAddProductGroupItemChange}
              select
              SelectProps={{ native: true }}
              error={!!validationErrors.productId}
              helperText={validationErrors.productId}
              required
            >
              <option value="" disabled></option>
              {products.map((product) => (
                <option key={product.productId} value={product.productId}>
                  {product.productName}
                </option>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowAddProductGroupItemDialog(false);
                setValidationErrors({});
              }}
              color="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAddProductGroupItem} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Dialog open={showAddProductGroupDialog} onClose={() => setShowAddProductGroupDialog(false)}>
        <DialogTitle>Add New Product Group</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter the details of the new product group:</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="productGroupName"
            label="Product Group Name"
            type="text"
            fullWidth
            variant="outlined"
            name="productGroupName" // Add name attribute to bind to state
            value={newProductGroupData.productGroupName} // Bind to newProductGroupData
            onChange={handleAddProductGroupChange}
            required
            error={!!validationErrors.productGroupName}
            helperText={validationErrors.productGroupName}
          />
          <TextField
            margin="dense"
            id="productGroupMaxCapacity"
            label="Max Capacity"
            type="number"
            fullWidth
            variant="outlined"
            name="productGroupMaxCapacity" // Add name attribute to bind to state
            value={newProductGroupData.productGroupMaxCapacity} // Bind to newProductGroupData
            onChange={handleAddProductGroupChange}
            required
            error={!!validationErrors.productGroupMaxCapacity}
            helperText={validationErrors.productGroupMaxCapacity}
          />
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={newProductGroupData.haveNormalPrice}
                  onChange={handleAddProductGroupChange}
                  name="haveNormalPrice" // Connect the Switch to the state
                />
              }
              label="Have Normal Price"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAddProductGroupDialog(false);
              setValidationErrors({});
            }}
            color="secondary"
          >
            Cancel
          </Button>
          <Button onClick={handleAddProductGroup} variant="contained">
            Add Product Group
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditProductGroupDialog} onClose={handleCloseEditProductGroupDialog}>
        <DialogTitle>Edit Product Group</DialogTitle>
        <DialogContent>
          <DialogContentText>Update the details of the product group:</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="productGroupName"
            label="Product Group Name"
            type="text"
            fullWidth
            variant="standard"
            name="productGroupName"
            value={editingProductGroup?.productGroupName || ''}
            onChange={handleChangeProductGroup}
          />
          <TextField
            margin="dense"
            id="productGroupMaxCapacity"
            label="Max Capacity"
            type="number"
            fullWidth
            variant="standard"
            name="productGroupMaxCapacity"
            value={editingProductGroup?.productGroupMaxCapacity || ''}
            onChange={handleChangeProductGroup}
          />
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={editingProductGroup?.haveNormalPrice || false}
                  onChange={handleChangeProductGroup}
                  name="haveNormalPrice"
                />
              }
              label="Have Normal Price"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditProductGroupDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveEditProductGroup} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteConfirmation} onClose={() => setShowDeleteConfirmation(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this product group? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirmation(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteProductGroup} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};
export default CollectionDetail;
