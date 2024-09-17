import React, { useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  NativeSelect,
  Paper,
  Snackbar,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Box } from '@mui/system';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ImageNotSupported } from '@mui/icons-material';

const MyCollectionProductGroupDetails = ({ collectionDataId }) => {
  const [productGroups, setProductGroups] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const blockInvalidChar = (e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://3.1.81.96/api/ProductGroup/GroupItem?collectionId=${collectionDataId}&pageNumber=1&pageSize=10`
      );
      console.log('Data fetched:', response.data);
      setProductGroups(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle errors (e.g., show error message, set error state)
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryData = async () => {
    setIsLoading(true);
    try {
      const brandId = localStorage.getItem('brandId');
      const response = await axios.get(`https://3.1.81.96/api/Categories?brandId=${brandId}&&pageNumber=1&pageSize=1000`);
      console.log('Data fetched:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle errors (e.g., show error message, set error state)
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`https://3.1.81.96/api/Products?pageNumber=1&pageSize=1000`);
      console.log('Data fetched:', response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle errors (e.g., show error message, set error state)
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const fetchDataAsync = async () => {
      try {
        await fetchData();
        await fetchCategoryData();
        await fetchProductData();
      } catch (error) {
        // Centralized error handling
        console.error('Error fetching data:', error);
      }
    };

    fetchDataAsync();
  }, []);

  // Get product size
  const getProductSize = (productSizeType) => {
    switch (productSizeType) {
      case 0:
        return 'S';

      case 1:
        return 'M';

      case 2:
        return 'L';

      case 3:
        return 'Normal';

      default:
        return '';
    }
  };

  // Get product currency
  const getProductCurrency = (productCurrencyType) => {
    switch (productCurrencyType) {
      case 0:
        return 'USD';
      case 1:
        return 'VNĐ';
      default:
        break;
    }
  };

  const [productGroupCreate, setProductGroupCreate] = useState({
    menuId: 0,
    collectionId: 0,
    productGroupName: '',
    productGroupMaxCapacity: 1,
    haveNormalPrice: true
  });

  const [toggleAddProductGroup, setToggleAddProductGroup] = React.useState(false);

  const handleAddProductGroupClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setToggleAddProductGroup(!toggleAddProductGroup);
  };

  const handleAddProductGroup = (e) => {
    const { name, value, checked } = e.target;
    let cleanedValue;
    let parsedValue;

    switch (name) {
      case 'productGroupName':
        var category = categories.find((category) => category.categoryId === parseInt(value));
        console.log(category);
        setProductGroupCreate({
          ...productGroupCreate,
          productGroupName: category.categoryName
        });
        break;

      case 'productGroupMaxCapacity':
        // 1. Remove leading zeros:
        cleanedValue = value.replace(/^0+/, '');

        // 2. Parse to a number
        parsedValue = parseInt(cleanedValue, 10);
        if (value >= 1000000000) return;

        setProductGroupCreate({
          ...productGroupCreate,
          productGroupMaxCapacity: parsedValue
        });
        break;

      case 'haveNormalPrice':
        setProductGroupCreate({
          ...productGroupCreate,
          haveNormalPrice: checked
        });
        break;

      default:
        break;
    }
  };

  const handleSubmitAddProductGroup = async () => {
    try {
      setErrorMessage('');
      setSuccessMessage('');

      if (productGroupCreate.productGroupName === '') return;
      console.log(productGroupCreate);
      // console.log(productPriceCreate, groupItem.productId);

      const response = await fetch(`https://3.1.81.96/api/ProductGroup`, {
        method: 'POST', // Or PATCH, depending on your API
        headers: {
          'Content-Type': 'application/json'
          // Add any authentication headers if required
        },
        body: JSON.stringify({
          menuId: 0,
          collectionId: collectionDataId,
          productGroupName: productGroupCreate.productGroupName,
          productGroupMaxCapacity: productGroupCreate.productGroupMaxCapacity,
          haveNormalPrice: productGroupCreate.haveNormalPrice
        })
      });

      if (response.ok) {
        // Handle success (e.g., update UI, show a message)
        setSuccessMessage('Product price added successfully');
        setOpenSnackBar(true);
        const addedProduct = await response.json();
        console.log(addedProduct);
        setToggleAddProductGroup(false);

        setProductGroupCreate({
          menuId: 0,
          collectionId: 0,
          productGroupName: '',
          productGroupMaxCapacity: 1,
          haveNormalPrice: true
        });
        console.log('Reset complete');

        setTimeout(() => {
          fetchData();
        }, 2000);

        // Update state or do whatever you need with the updated data
      } else {
        const errorResponse = await response.json();
        setErrorMessage(errorResponse.error);
        setOpenSnackBar(true);
        // Handle errors (e.g., display an error message to the user)
        console.error('Error add product price:', errorResponse.error);
      }
    } catch (error) {
      console.error('Network error:', error.message);
      // Handle network errors
    }
  };

  // Render table
  function Row(props) {
    const { row } = props;

    const [open, setOpen] = React.useState(false);

    const [openDialogIds, setOpenDialogIds] = React.useState({});

    const [openNested, setOpenNested] = React.useState(-1);

    const [filterCategories, setFilterCategories] = React.useState([]);
    const [filterProducts, setFilterProducts] = React.useState([]);

    const [toggleAddProduct, setToggleAddProduct] = React.useState(false);
    const [toggleAddPrice, setToggleAddPrice] = React.useState(false);

    const [toggleEditPrice, setToggleEditPrice] = React.useState(false);
    const [toggleEditProductGroup, setToggleEditProductGroup] = React.useState(false);

    const [toggleDeleteProductGroup, setToggleDeleteProductGroup] = React.useState(false);
    const [toggleDeleteProductGroupItem, setToggleDeleteProductGroupItem] = React.useState(false);
    const [toggleDeletePrice, setToggleDeletePrice] = React.useState(false);

    const [productPriceUpdate, setProductPriceUpdate] = React.useState(1);

    const [productPriceCreate, setProducePriceCreate] = React.useState({
      productId: 0,
      productSizeType: 0,
      price: 1
    });
    const [productGroupItemCreate, setProductGroupItemCreate] = React.useState({
      productGroupId: 0,
      productId: 0
    });

    const [productGroupUpdate, setProductGroupUpdate] = React.useState({
      productGroupName: '',
      haveNormalPrice: true,
      productGroupMaxCapacity: -1
    });

    const handleAddProductClick = () => {
      const matchedCategory = categories.find((category) => category.categoryName === row.productGroupName);

      console.log(matchedCategory);
      console.log(products);
      setFilterProducts(products.filter((product) => product.categoryId === matchedCategory.categoryId));
      // setCategories(filterCategories);
      setToggleAddProduct(!toggleAddProduct);
    };

    const handleAddPriceClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setToggleAddPrice(!toggleAddPrice);
    };

    const handleEditProductGroupClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setToggleEditProductGroup(!toggleEditProductGroup);
    };

    const handleEditClick = (dialogId) => {
      setOpenDialogIds({
        ...openDialogIds, // Keep other dialogs as is
        [dialogId]: true // Open this specific dialog
      });
    };

    const handleCloseDialog = (dialogId) => {
      setOpenDialogIds({
        ...openDialogIds,
        [dialogId]: false
      });
    };

    const handleDeleteProductGroupClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setToggleDeleteProductGroup(!toggleDeleteProductGroup);
    };

    const handleDeleteProductGroupItemClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      //   setToggleDeletePrice(!toggleDeletePrice); // Toggle edit mode
      setToggleDeleteProductGroupItem(!toggleDeleteProductGroupItem);
    };

    const handleDeletePriceClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setToggleDeletePrice(!toggleDeletePrice); // Toggle edit mode
    };

    const handleAddProductGroupItem = (e) => {
      const { name, value } = e.target;
      let productIdValue = value;
      console.log('In');
      console.log(e.target.value);
      switch (name) {
        case 'productGroupItemProductId':
          productIdValue = parseInt(value);
          setProductGroupItemCreate({
            productGroupId: row.productGroupId,
            productId: productIdValue
          });
          break;

        default:
          break;
      }
    };

    const handleAddPrice = (e) => {
      const { name, value } = e.target;
      let cleanedValue;
      let parsedValue;
      let productSizeTypeValue;
      switch (name) {
        case 'price':
          // 1. Remove leading zeros:
          cleanedValue = value.replace(/^0+/, '');

          // 2. Parse to a number
          parsedValue = parseInt(cleanedValue, 10);
          if (value >= 1000000000) return;

          setProducePriceCreate({
            ...productPriceCreate,
            [name]: parsedValue
          });
          break;

        case 'productSizeType':
          productSizeTypeValue = parseInt(value);
          setProducePriceCreate({
            ...productPriceCreate,
            [name]: productSizeTypeValue
          });
          break;

        default:
          break;
      }
    };

    const handleEditProductPrice = async (e, productSizePriceId, row) => {
      // console.log(groupItem.productId);
      console.log(productSizePriceId);
      console.log(row.productGroupId);
      console.log(e.target.value);
      setProductPriceUpdate(e.target.value);
    };

    const handleSubmitAddProductGroupItem = async (e, groupItem) => {
      try {
        setErrorMessage('');
        setSuccessMessage('');
        if (productGroupItemCreate.productId === 0 || productGroupItemCreate.productGroupId === 0) return;
        console.log(productGroupItemCreate);
        // console.log(productPriceCreate, groupItem.productId);

        const response = await fetch(`https://3.1.81.96/api/ProductGroupItem`, {
          method: 'POST', // Or PATCH, depending on your API
          headers: {
            'Content-Type': 'application/json'
            // Add any authentication headers if required
          },
          body: JSON.stringify({
            productGroupId: row.productGroupId,
            productId: productGroupItemCreate.productId
          })
        });

        if (response.ok) {
          // Handle success (e.g., update UI, show a message)
          setSuccessMessage('Product added successfully');
          setOpenSnackBar(true);
          const addedProduct = await response.json();
          console.log(addedProduct);
          setToggleAddProduct(false);

          setTimeout(() => {
            fetchData();
          }, 2000);

          // Update state or do whatever you need with the updated data
        } else {
          const errorResponse = await response.json();
          setErrorMessage(errorResponse.error);
          setOpenSnackBar(true);
          // Handle errors (e.g., display an error message to the user)
          console.error('Error add product price:', errorResponse.error);
        }
      } catch (error) {
        console.error('Network error:', error.message);
        // Handle network errors
      }
    };

    const handleSubmitAddPrice = async (e, groupItem) => {
      try {
        setErrorMessage('');
        setSuccessMessage('');
        console.log({
          ...productPriceCreate,
          productId: groupItem.productId
        });
        // console.log(productPriceCreate, groupItem.productId);

        const response = await fetch(`https://3.1.81.96/api/ProductSizePrices/`, {
          method: 'POST', // Or PATCH, depending on your API
          headers: {
            'Content-Type': 'application/json'
            // Add any authentication headers if required
          },
          body: JSON.stringify({
            productId: groupItem.productId,
            productSizeType: productPriceCreate.productSizeType,
            price: parseFloat(productPriceCreate.price)
          })
        });

        if (response.ok) {
          // Handle success (e.g., update UI, show a message)
          setSuccessMessage('Product price added successfully');
          setOpenSnackBar(true);
          const addedProduct = await response.json();
          console.log(addedProduct);
          setToggleAddPrice(false);

          setTimeout(() => {
            fetchData();
          }, 2000);

          // Update state or do whatever you need with the updated data
        } else {
          const errorResponse = await response.json();
          setErrorMessage(errorResponse.error);
          setOpenSnackBar(true);
          // Handle errors (e.g., display an error message to the user)
          console.error('Error add product price:', errorResponse.error);
        }
      } catch (error) {
        console.error('Network error:', error.message);
        // Handle network errors
      }
    };

    const handleSubmitEditPrice = async (e, size) => {
      try {
        const response = await fetch(`https://3.1.81.96/api/ProductSizePrices/${size.productSizePriceId}`, {
          method: 'PUT', // Or PATCH, depending on your API
          headers: {
            'Content-Type': 'application/json'
            // Add any authentication headers if required
          },
          body: JSON.stringify({
            // productId: groupItem.productId,
            // productSizeType: size.productSizeType,
            price: parseFloat(productPriceUpdate)
          })
        });

        if (response.ok) {
          // Handle success (e.g., update UI, show a message)
          const updatedProduct = await response.json();
          console.log(updatedProduct);
          fetchData();

          // Update state or do whatever you need with the updated data
        } else {
          // Handle errors (e.g., display an error message to the user)
          console.error('Error updating product price:', response.status);
        }
      } catch (error) {
        console.error('Network error:', error);
        // Handle network errors
      }
    };

    const handleSubmitDeleteProductGroup = async (e, row) => {
      try {
        setErrorMessage('');
        setSuccessMessage('');

        // console.log(groupItem.productGroupItemId);

        const response = await fetch(`https://3.1.81.96/api/ProductGroup/${row.productGroupId}`, {
          method: 'DELETE', // Or PATCH, depending on your API
          headers: {
            'Content-Type': 'application/json'
            // Add any authentication headers if required
          }
        });

        if (response.ok) {
          // Handle success (e.g., update UI, show a message)
          setSuccessMessage('Product group deleted successfully');
          setOpenSnackBar(true);

          setToggleDeleteProductGroup(false);

          setTimeout(() => {
            fetchData();
          }, 2000);

          // Update state or do whatever you need with the updated data
        } else {
          const errorResponse = await response.json();
          setErrorMessage(errorResponse.error);
          setOpenSnackBar(true);
          // Handle errors (e.g., display an error message to the user)
          console.error('Error delete product group :', errorResponse.error);
        }
      } catch (error) {
        console.error('Network error:', error.message);
        // Handle network errors
      }
    };
    const handleSubmitDeleteProductGroupItem = async (e, groupItem) => {
      try {
        setErrorMessage('');
        setSuccessMessage('');

        // console.log(groupItem.productGroupItemId);

        const response = await fetch(`https://3.1.81.96/api/ProductGroupItem/${groupItem.productGroupItemId}`, {
          method: 'DELETE', // Or PATCH, depending on your API
          headers: {
            'Content-Type': 'application/json'
            // Add any authentication headers if required
          }
        });

        if (response.ok) {
          // Handle success (e.g., update UI, show a message)
          setSuccessMessage('Product group item deleted successfully');
          setOpenSnackBar(true);

          setToggleDeleteProductGroupItem(false);

          setTimeout(() => {
            fetchData();
          }, 2000);

          // Update state or do whatever you need with the updated data
        } else {
          const errorResponse = await response.json();
          setErrorMessage(errorResponse.error);
          setOpenSnackBar(true);
          // Handle errors (e.g., display an error message to the user)
          console.error('Error delete product group item:', errorResponse.error);
        }
      } catch (error) {
        console.error('Network error:', error.message);
        // Handle network errors
      }
    };
    const handleSubmitDeletePrice = async (e, size) => {
      try {
        const response = await fetch(`https://3.1.81.96/api/ProductSizePrices/${size.productSizePriceId}`, {
          method: 'Delete', // Or PATCH, depending on your API
          headers: {
            'Content-Type': 'application/json'
            // Add any authentication headers if required
          }
        });

        if (response.ok) {
          // Handle success (e.g., update UI, show a message)
          setToggleDeletePrice(false);
          fetchData();

          // Update state or do whatever you need with the updated data
        } else {
          // Handle errors (e.g., display an error message to the user)
          console.error('Error deleting product price:', response.status);
        }
      } catch (error) {
        console.error('Network error:', error);
        // Handle network errors
      }
    };

    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              Products
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>

          {/* ProductgroupName */}
          <TableCell component="th">{row.productGroupName}</TableCell>

          {/* HaveNormalPrice */}
          <TableCell align="left">
            {row.haveNormalPrice ? (
              // <Check color="success" sx={{ fontSize: "3rem" }} /> Normal price
              <div style={{ color: 'green', fontWeight: 'bold' }}>Normal price</div>
            ) : (
              // <Clear color="error" sx={{ fontSize: "3rem" }} />
              <div style={{ color: 'blue', fontWeight: 'bold' }}>Size based price</div>
            )}
          </TableCell>

          <TableCell>
            {/* Delete ProductGroupItem */}
            <Button style={{ color: 'red' }} onClick={handleDeleteProductGroupClick}>
              <DeleteIcon />
            </Button>

            {/* Dialog Delete */}
            <Dialog open={toggleDeleteProductGroup} onClose={() => setToggleDeleteProductGroup(!toggleDeleteProductGroup)}>
              <DialogTitle variant="h4">Delete Product Group Item</DialogTitle>
              <DialogContent>Delete product group `{row.productGroupName}`</DialogContent>
              <DialogActions>
                <Button onClick={() => setToggleDeleteProductGroup(!toggleDeleteProductGroup)}>Cancel</Button>

                <Button onClick={(e) => handleSubmitDeleteProductGroup(e, row)}>OK</Button>
              </DialogActions>
            </Dialog>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                {/* ProductGroupItem */}
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      {/* Product group */}

                      <TableCell style={{ fontWeight: 'bold' }}>Product Id</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>Image</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>Currency</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        Actions
                        <Button variant="contained" sx={{ ml: 1 }} onClick={handleAddProductClick}>
                          <AddIcon />
                        </Button>
                        {/* Add product dialog */}
                        <Dialog sx={{ m: '1rem' }} open={toggleAddProduct} onClose={() => setToggleAddProduct(!toggleAddProduct)}>
                          <DialogTitle>Add Product</DialogTitle>

                          <DialogContent>
                            <Box sx={{ minWidth: 120 }}>
                              <FormControl fullWidth>
                                <InputLabel variant="standard" htmlFor="productGroupItemProductIdLabel">
                                  Product
                                </InputLabel>
                                <NativeSelect
                                  defaultValue={-1}
                                  inputProps={{
                                    name: 'productGroupItemProductId',
                                    id: 'productGroupItemProductIdLabel'
                                  }}
                                  onChange={handleAddProductGroupItem}
                                >
                                  <option value={-1} disabled>
                                    Select Product
                                  </option>
                                  {filterProducts.map((product, productIndex) => (
                                    <option key={productIndex} value={product.productId}>
                                      {product.productName}
                                    </option>
                                  ))}
                                </NativeSelect>
                              </FormControl>
                            </Box>
                          </DialogContent>

                          <DialogActions>
                            <Button onClick={() => setToggleAddProduct(false)}>Cancel</Button>
                            <Button onClick={(e) => handleSubmitAddProductGroupItem(e)}>OK</Button>
                          </DialogActions>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  {row.productGroupItems.map((groupItem, groupItemIndex) => (
                    <TableBody key={groupItem.productGroupItemId}>
                      {/* Product  */}
                      <TableRow>
                        {/* Product size price toggle button */}
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpenNested(openNested === groupItemIndex ? -1 : groupItemIndex)}
                          >
                            Sizes
                            {openNested === groupItemIndex ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>

                        <TableCell>{groupItem.product.productId}</TableCell>
                        <TableCell>
                          {groupItem.product.productImgPath !== null ? (
                            <img
                              src={groupItem.product.productImgPath}
                              alt={groupItem.product.productName}
                              style={{
                                maxWidth: '100px',
                                minWidth: '100px',
                                maxHeight: '100px',
                                minHeight: '100px',
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            <ImageNotSupported
                              style={{
                                maxWidth: '100px',
                                minWidth: '100px',
                                maxHeight: '100px',
                                minHeight: '100px',
                                objectFit: 'contain'
                              }}
                            />
                          )}
                        </TableCell>

                        <TableCell>{groupItem.product.productName}</TableCell>
                        <TableCell>{groupItem.product.productDescription}</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: 'green' }}>
                          {getProductCurrency(groupItem.product.productPriceCurrency)}
                        </TableCell>
                        <TableCell>
                          {/* Delete ProductGroupItem */}
                          <Button style={{ color: 'red' }} onClick={handleDeleteProductGroupItemClick}>
                            <DeleteIcon />
                          </Button>

                          {/* Dialog Delete */}
                          <Dialog
                            open={toggleDeleteProductGroupItem}
                            onClose={() => setToggleDeleteProductGroupItem(!toggleDeleteProductGroupItem)}
                          >
                            <DialogTitle variant="h4">Delete Product Group Item</DialogTitle>
                            <DialogContent>Delete product group item `{groupItem.product.productName}`</DialogContent>
                            <DialogActions>
                              <Button onClick={() => setToggleDeleteProductGroupItem(!toggleDeleteProductGroupItem)}>Cancel</Button>

                              <Button onClick={(e) => handleSubmitDeleteProductGroupItem(e, groupItem)}>OK</Button>
                            </DialogActions>
                          </Dialog>
                        </TableCell>
                      </TableRow>

                      {/* Product sizes */}
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={openNested === groupItemIndex} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Table size="small" aria-label="purchases">
                                {/* Header */}
                                <TableHead>
                                  <TableRow>
                                    <TableCell />
                                    <TableCell style={{ fontWeight: 'bold' }}>Size</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>Price</TableCell>
                                    <TableCell style={{ fontWeight: 'bold' }}>
                                      Action
                                      <Button variant="contained" name="addPrice" sx={{ ml: 1 }} onClick={handleAddPriceClick}>
                                        <AddIcon />
                                      </Button>
                                      {/* Add price dialog */}
                                      <Dialog sx={{ m: '1rem' }} open={toggleAddPrice} onClose={() => setToggleAddPrice(!toggleAddPrice)}>
                                        <DialogTitle>Add Price</DialogTitle>
                                        <DialogContent>
                                          <DialogContentText>Add price of product {groupItem.product.productName}</DialogContentText>
                                        </DialogContent>

                                        <DialogContent>
                                          <Box sx={{ minWidth: 120 }}>
                                            <FormControl fullWidth>
                                              <InputLabel variant="standard" htmlFor="productSizeTypeLabel">
                                                Size
                                              </InputLabel>
                                              <NativeSelect
                                                defaultValue={0}
                                                inputProps={{
                                                  name: 'productSizeType',
                                                  id: 'productSizeTypeLabel'
                                                }}
                                                onChange={handleAddPrice}
                                              >
                                                <option value={0}>S</option>
                                                <option value={1}>M</option>
                                                <option value={2}>L</option>
                                                <option value={3}>Normal</option>
                                              </NativeSelect>
                                            </FormControl>
                                          </Box>
                                        </DialogContent>

                                        <DialogContent>
                                          <InputLabel variant="standard" htmlFor="priceLabel">
                                            Price
                                          </InputLabel>
                                          <Input
                                            id="priceLabel"
                                            margin="dense"
                                            name="price"
                                            label="Price"
                                            type="number"
                                            fullWidth
                                            variant="standard"
                                            value={
                                              // size.price
                                              productPriceCreate.price
                                            }
                                            onChange={handleAddPrice}
                                            inputProps={{
                                              min: 1,
                                              max: 1000000000
                                            }}
                                            onKeyDown={blockInvalidChar}
                                          />
                                        </DialogContent>

                                        <DialogActions>
                                          <Button onClick={() => setToggleAddPrice(!toggleAddPrice)}>Cancel</Button>
                                          <Button onClick={(e) => handleSubmitAddPrice(e, groupItem)}>OK</Button>
                                        </DialogActions>
                                      </Dialog>
                                    </TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {groupItem.product.productSizePrices.map((size, sizeIndex) => (
                                    <TableRow key={size.productSizePriceId}>
                                      <TableCell />

                                      {/* productSizeType */}
                                      <TableCell>{getProductSize(size.productSizeType)}</TableCell>

                                      {/* productPriceCurrency */}
                                      <TableCell>
                                        {groupItem.product.productPriceCurrency === 1
                                          ? size.price.toLocaleString('vi-VN', {
                                              style: 'currency',
                                              currency: 'VND'
                                            })
                                          : size.price.toLocaleString('en-US', {
                                              style: 'currency',
                                              currency: 'USD'
                                            })}
                                      </TableCell>

                                      {/* Buttons */}
                                      <TableCell>
                                        {/* Edit price */}
                                        <Button onClick={() => handleEditClick(size.productSizePriceId)}>
                                          <EditIcon />
                                        </Button>

                                        {/* Delete Price */}
                                        <Button style={{ color: 'red' }} onClick={handleDeletePriceClick}>
                                          <DeleteIcon />
                                        </Button>

                                        {/* Dialog Edit */}
                                        <Dialog
                                          id={size.productSizePriceId}
                                          open={openDialogIds[size.productSizePriceId] || false}
                                          onClose={() => handleCloseDialog(size.productSizePriceId)}
                                        >
                                          <DialogTitle>Edit Price</DialogTitle>
                                          <DialogContent>Edit price of product id {groupItem.productId}</DialogContent>
                                          <Input
                                            margin="dense"
                                            name="price"
                                            label="Price"
                                            type="number"
                                            fullWidth
                                            variant="standard"
                                            value={
                                              // size.price
                                              productPriceUpdate
                                            }
                                            onChange={async (e) => {
                                              await handleEditProductPrice(e, size.productSizePriceId, row);
                                            }}
                                          />
                                          <DialogActions>
                                            <Button onClick={() => handleCloseDialog(size.productSizePriceId)}>Cancel</Button>
                                            <Button onClick={(e) => handleSubmitEditPrice(e, size)}>OK</Button>
                                          </DialogActions>
                                        </Dialog>

                                        {/* Dialog Delete */}
                                        <Dialog open={toggleDeletePrice} onClose={() => setToggleDeletePrice(!toggleDeletePrice)}>
                                          <DialogTitle>Delete Price</DialogTitle>
                                          <DialogContent>Delete price of product id {groupItem.productId}</DialogContent>
                                          <DialogActions>
                                            <Button onClick={() => setToggleDeletePrice(!toggleDeletePrice)}>Cancel</Button>

                                            <Button onClick={(e) => handleSubmitDeletePrice(e, size)}>OK</Button>
                                          </DialogActions>
                                        </Dialog>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ))}
                </Table>
              </Box>
            </Collapse>

            {/* Snackbar error message */}
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
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          {/* Header */}
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell style={{ fontWeight: 'bold' }}>Product group</TableCell>
              <TableCell align="left" style={{ fontWeight: 'bold' }}>
                Price type
              </TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>
                Actions
                <Button variant="contained" sx={{ ml: 1 }} onClick={handleAddProductGroupClick}>
                  <AddIcon />
                </Button>
                {/* Add product dialog */}
                <Dialog sx={{ m: '1rem' }} open={toggleAddProductGroup} onClose={() => setToggleAddProductGroup(!toggleAddProductGroup)}>
                  <DialogTitle>Add Product Group</DialogTitle>

                  {/* Product group name */}
                  <DialogContent>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth>
                        <InputLabel variant="standard" htmlFor="productGroupMenuIdLabel">
                          Brand{`'`}s Categories
                        </InputLabel>
                        <NativeSelect
                          defaultValue={-1}
                          inputProps={{
                            name: 'productGroupName',
                            id: 'productGroupMenuIdLabel'
                          }}
                          onChange={handleAddProductGroup}
                        >
                          <option value={-1} disabled>
                            Select Category
                          </option>
                          {categories.map((category, categoryIndex) => (
                            <option key={categoryIndex} value={category.categoryId}>
                              {category.categoryName}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                    </Box>
                  </DialogContent>

                  {/* productGroupMaxCapacity */}
                  <DialogContent>
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth>
                        <InputLabel variant="standard" htmlFor="productGroupMenuIdLabel">
                          Max capacity
                        </InputLabel>
                        <Input
                          id="productGroupMenuIdLabel"
                          margin="dense"
                          name="productGroupMaxCapacity"
                          label="Max capacity"
                          type="number"
                          fullWidth
                          variant="standard"
                          value={
                            // size.price
                            productGroupCreate.productGroupMaxCapacity
                          }
                          onChange={handleAddProductGroup}
                          inputProps={{
                            min: 1,
                            max: 1000000000
                          }}
                          onKeyDown={blockInvalidChar}
                        />
                      </FormControl>
                    </Box>
                  </DialogContent>

                  {/* haveNormalPrice */}
                  <DialogContent>
                    <InputLabel id="haveNormalPrice">Use normal price</InputLabel>
                    <FormControl>
                      <Switch
                        id="haveNormalPrice"
                        name="haveNormalPrice"
                        checked={productGroupCreate.haveNormalPrice}
                        onChange={handleAddProductGroup}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    </FormControl>
                  </DialogContent>

                  <DialogActions>
                    <Button onClick={() => setToggleAddProductGroup(false)}>Cancel</Button>
                    <Button onClick={(e) => handleSubmitAddProductGroup(e)}>OK</Button>
                  </DialogActions>
                </Dialog>
                {/* Snackbar error message */}
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
              </TableCell>
            </TableRow>
          </TableHead>

          {isLoading ? (
            <TableBody>
              <TableRow>
                <TableCell>
                  <Backdrop
                    sx={{
                      color: '#fff',
                      zIndex: (theme) => theme.zIndex.drawer + 1
                    }}
                    open={isLoading} // Controlled by isLoading
                  >
                    <CircularProgress color="inherit" />
                  </Backdrop>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <>
              {/* Body */}
              <TableBody>
                {productGroups.map((row, index) => (
                  <Row key={index} row={row} />
                ))}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>
    </>
  );
}; // <-- Add a semicolon here
export default MyCollectionProductGroupDetails;
