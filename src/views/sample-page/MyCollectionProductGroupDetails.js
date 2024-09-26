import React, { useEffect, useState } from 'react';
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
  TablePagination,
  TableRow,
  TextField
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
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductGroup/GroupItem?collectionId=${collectionDataId}&pageNumber=1&pageSize=10`
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
      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Categories?brandId=${brandId}&&pageNumber=1&pageSize=1000`
      );
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
    const brandId = localStorage.getItem('brandId');
    try {
      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Products/${brandId}?pageNumber=1&pageSize=1000`
      );
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
        setProductGroupCreate({
          ...productGroupCreate,
          productGroupName: value
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

  const handleSubmitAddProductGroup = async (e) => {
    try {
      const token = localStorage.getItem('token');
      setErrorMessage('');
      setSuccessMessage('');

      if (productGroupCreate.productGroupName === '') return;
      console.log(productGroupCreate);
      // console.log(productPriceCreate, groupItem.productId);

      const response = await fetch(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductGroup`, {
        method: 'POST', // Or PATCH, depending on your API
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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
        handleSubmitAddProductGroup2(e);

        // Update state or do whatever you need with the updated data
      } else {
        const errorResponse = await response.json();
        setErrorMessage(errorResponse.error);
        setOpenSnackBar(true);
        setErrorMessage('');
        // Handle errors (e.g., display an error message to the user)
        console.error('Error add product price:', errorResponse.error);
      }
    } catch (error) {
      console.error('Network error:', error.message);
      // Handle network errors
    }
  };

  const handleSubmitAddProductGroup2 = async (e) => {
    e.preventDefault();

    // Assuming you have a state variable for the list of products
    const response = await axios.get(
      `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductGroup/GroupItem?collectionId=${collectionDataId}&pageNumber=1&pageSize=1000`
    );

    setProductGroups(response.data);
    setSuccessMessage('Product group added successfully');
    setOpenSnackBar(true);
    setToggleAddProductGroup(false);
    setProductGroupCreate({
      menuId: 0,
      collectionId: 0,
      productGroupName: '',
      haveNormalPrice: true
    });
  };

  // Pagination

  const [page, setPage] = useState(0); // State for current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // State for rows per page

  // Function to handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Function to handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page after changing rows per page
  };

  // Searching
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProductGroups, setFilteredProductGroups] = useState([]);

  useEffect(() => {
    const results = productGroups.filter((group) => group.productGroupName.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredProductGroups(results);
  }, [searchTerm, productGroups]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Render table
  function Row(props) {
    const { row } = props;
    const [groupItems, setGroupItems] = useState(row.productGroupItems);

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

    const [imgError, setImgError] = useState(false);

    const [errorMessage2, setErrorMessage2] = React.useState('');
    const [successMessage2, setSuccessMessage2] = React.useState('');
    const [openSnackBar2, setOpenSnackBar2] = React.useState(false);
    const [selectedProductId, setSelectedProductId] = useState(-1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddProductClick = (productGroupId) => {
      // const matchedCategory = categories.find((category) => category.categoryName === row.productGroupName);
      const productGroupHaveNormalPrice = row.haveNormalPrice;

      // console.log(
      //   products.filter(
      //     (product) =>
      //       product.categoryId === matchedCategory.categoryId && product.productSizePrices.filter((price) => price.productSizeType === 3)
      //   )
      // );
      // console.log(matchedCategory);
      console.log(products);

      switch (productGroupHaveNormalPrice) {
        case true:
          setFilterProducts(
            products.filter(
              (product) =>
                // product.categoryId === matchedCategory.categoryId &&
                product.productSizePrices.some((price) => price.productSizeType === 3) && product.productSizePrices.length > 0
            )
          );
          break;
        case false:
          setFilterProducts(
            products.filter(
              (product) =>
                // product.categoryId === matchedCategory.categoryId &&
                product.productSizePrices.some((price) => price.productSizeType !== 3) && product.productSizePrices.length > 0
            )
          );
          break;
        default:
          break;
      }
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

    const handleDeletePriceClick = (dialogId) => {
      setOpenDialogIds({
        ...openDialogIds, // Keep other dialogs as is
        [dialogId]: true // Open this specific dialog
      });
    };

    const handleAddProductGroupItem = (e) => {
      setSelectedProductId(Number(e.target.value));

      const { name, value } = e.target;
      let productIdValue = value;

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
        const token = localStorage.getItem('token');
        setSuccessMessage2('');
        setErrorMessage2('');
        setIsSubmitting(true);

        // if (productGroupItemCreate.productId === 0 || productGroupItemCreate.productGroupId === 0) return;
        // console.log(productGroupItemCreate);
        // console.log(productPriceCreate, groupItem.productId);

        const response = await fetch(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductGroupItem`, {
          method: 'POST', // Or PATCH, depending on your API
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
            // Add any authentication headers if required
          },
          body: JSON.stringify({
            productGroupId: row.productGroupId,
            productId: productGroupItemCreate.productId
          })
        });

        if (response.ok) {
          handleSubmitAddProductGroupItem2(e, row.productGroupId);

          // Update state or do whatever you need with the updated data
        } else {
          const errorResponse = await response.json();
          setErrorMessage2(errorResponse.error);
          setOpenSnackBar2(true);
          setIsSubmitting(false);

          console.error('Error add product item:', errorResponse.error);
        }
      } catch (error) {
        console.error('Network error:', error.message);
        // Handle network errors
      }
    };

    const handleSubmitAddProductGroupItem2 = async (e, productGroupId) => {
      e.preventDefault();

      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductGroupItem?productGroupId=${productGroupId}&pageNumber=1&pageSize=10`
      );

      setGroupItems(response.data);
      setSuccessMessage2('Product item added successfully');
      setOpenSnackBar2(true);
      setToggleAddProduct(false);
      setIsSubmitting(false);
    };

    const handleSubmitAddPrice = async (e, groupItem) => {
      try {
        const token = localStorage.getItem('token');
        setErrorMessage('');
        setSuccessMessage('');
        console.log({
          ...productPriceCreate,
          productId: groupItem.productId
        });
        // console.log(productPriceCreate, groupItem.productId);

        const response = await fetch(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices/`, {
          method: 'POST', // Or PATCH, depending on your API
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
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
        const token = localStorage.getItem('token');
        const response = await fetch(
          `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices/${size.productSizePriceId}`,
          {
            method: 'PUT', // Or PATCH, depending on your API
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
              // Add any authentication headers if required
            },
            body: JSON.stringify({
              // productId: groupItem.productId,
              // productSizeType: size.productSizeType,
              price: parseFloat(productPriceUpdate)
            })
          }
        );

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
        const token = localStorage.getItem('token');
        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');
        // console.log(groupItem.productGroupItemId);

        const response = await fetch(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductGroup/${row.productGroupId}`, {
          method: 'DELETE', // Or PATCH, depending on your API
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
            // Add any authentication headers if required
          }
        });

        if (response.ok) {
          handleSubmitDeleteProductGroup2(e, row);
        } else {
          const errorResponse = await response.json();
          setErrorMessage(errorResponse.error);
          setOpenSnackBar(true);
          setIsSubmitting(false);
          // Handle errors (e.g., display an error message to the user)
          console.error('Error delete product group :', errorResponse.error);
        }
      } catch (error) {
        console.error('Network error:', error.message);
        // Handle network errors
      }
    };

    const handleSubmitDeleteProductGroup2 = async (e, row) => {
      e.preventDefault();

      // Assuming you have a state variable for the list of products
      setProductGroups((prevProductGroup) => prevProductGroup.filter((group) => group.productGroupId !== row.productGroupId));

      setSuccessMessage('Product group deleted successfully');
      setOpenSnackBar(true);
      setIsSubmitting(false);
    };

    const handleSubmitDeleteProductGroupItem = async (e, groupItem) => {
      try {
        const token = localStorage.getItem('token');
        setErrorMessage2('');
        setSuccessMessage2('');
        setIsSubmitting(true);

        // console.log(groupItem.productGroupItemId);

        const response = await fetch(
          `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductGroupItem/${groupItem.productGroupItemId}`,
          {
            method: 'DELETE', // Or PATCH, depending on your API
            headers: {
              'Content-Type': 'application/json',
              Accept: '*/*',
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          // Handle success (e.g., update UI, show a message)
          // setSuccessMessage('Product group item deleted successfully');
          // setOpenSnackBar(true);

          // setToggleDeleteProductGroupItem(false);
          handleSubmitDeleteProductGroupItem2(e, groupItem);

          // Update state or do whatever you need with the updated data
        } else {
          const errorResponse = await response.json();
          setErrorMessage2(errorResponse.error);
          setOpenSnackBar(true);
          setIsSubmitting(false);
          setErrorMessage2('');
          // Handle errors (e.g., display an error message to the user)
          console.error('Error delete product group item:', errorResponse.error);
        }
      } catch (error) {
        console.error('Network error:', error.message);
        // Handle network errors
      }
    };

    const handleSubmitDeleteProductGroupItem2 = (event, size) => {
      event.preventDefault();

      setGroupItems((prevGroupItems) => prevGroupItems.filter((item) => item.productId !== size.productId));
      setSuccessMessage2('Product deleted successfully');
      setOpenSnackBar2(true);
      setIsSubmitting(false);
    };

    const handleSubmitDeletePrice = async (e, size) => {
      try {
        const token = localStorage.getItem('token');
        console.log(size.productSizePriceId);
        const response = await fetch(
          `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices/${size.productSizePriceId}`,
          {
            method: 'Delete', // Or PATCH, depending on your API
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
              // Add any authentication headers if required
            }
          }
        );

        if (response.ok) {
          // Handle success (e.g., update UI, show a message)
          handleSubmitDeletePrice2(e, size);

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
    const handleSubmitDeletePrice2 = (event, size) => {
      event.preventDefault();

      // Assuming you have a state variable for the list of products
      setGroupItems((prevGroupItems) =>
        prevGroupItems.map((groupItem) => {
          if (groupItem.product.productId === size.productId) {
            console.log(size.productId);
            // Filter out the deleted size price
            const updatedProductSizePrices = groupItem.product.productSizePrices.filter(
              (item) => item.productSizePriceId !== size.productSizePriceId
            );
            return {
              ...groupItem,
              product: {
                ...groupItem.product,
                productSizePrices: updatedProductSizePrices
              }
            };
          }
          return groupItem;
        })
      );

      setSuccessMessage2('Product price deleted successfully');
      setOpenSnackBar2(true);
      // Optionally close the delete dialog after deletion
      setToggleDeletePrice(false);
    };

    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell sx={{ maxWidth: '50px  ', minWidth: '50px' }}>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              Products
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>

          {/* ProductgroupName */}
          <TableCell component="th" sx={{ maxWidth: '50px  ', minWidth: '50px' }}>
            {row.productGroupName}
          </TableCell>

          {/* HaveNormalPrice */}
          <TableCell align="left" sx={{ maxWidth: '50px  ', minWidth: '50px' }}>
            {row.haveNormalPrice ? (
              // <Check color="success" sx={{ fontSize: "3rem" }} /> Normal price
              <div style={{ color: 'green', fontWeight: 'bold' }}>Normal price</div>
            ) : (
              // <Clear color="error" sx={{ fontSize: "3rem" }} />
              <div style={{ color: 'blue', fontWeight: 'bold' }}>Size based price</div>
            )}
          </TableCell>

          <TableCell sx={{ maxWidth: '50px  ', minWidth: '50px' }}>
            {/* Delete ProductGroupItem */}
            <Button style={{ color: 'red' }} onClick={handleDeleteProductGroupClick}>
              <DeleteIcon />
            </Button>

            {/* Dialog Delete */}
            <Dialog open={toggleDeleteProductGroup} onClose={() => setToggleDeleteProductGroup(!toggleDeleteProductGroup)}>
              <DialogTitle variant="h4">Delete Product Group </DialogTitle>
              <DialogContent>Delete product group `{row.productGroupName}`</DialogContent>
              <DialogActions>
                <Button onClick={() => setToggleDeleteProductGroup(!toggleDeleteProductGroup)} color="secondary">
                  Cancel
                </Button>

                <Button onClick={(e) => handleSubmitDeleteProductGroup(e, row)} disabled={isSubmitting}>
                  OK
                </Button>
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

                      <TableCell style={{ fontWeight: 'bold' }}>Image</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell style={{ fontWeight: 'bold', minWidth: '1rem' }}>Description</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>Currency</TableCell>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        <Button variant="contained" sx={{ ml: 1 }} onClick={() => handleAddProductClick(row.productGroupId)}>
                          <AddIcon />
                        </Button>
                        {/* Add product dialog */}
                        <Dialog sx={{ m: '1rem' }} open={toggleAddProduct} onClose={() => setToggleAddProduct(!toggleAddProduct)}>
                          <DialogTitle sx={{ fontSize: '1rem', minWidth: '200px' }}>Add Product</DialogTitle>

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
                            <Button onClick={() => setToggleAddProduct(false)} color="secondary">
                              Cancel
                            </Button>
                            <Button onClick={(e) => handleSubmitAddProductGroupItem(e)} disabled={selectedProductId === -1 || isSubmitting}>
                              OK
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  {groupItems.map((groupItem, groupItemIndex) => (
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

                        <TableCell>
                          {groupItem.product.productImgPath !== null && !imgError ? (
                            <a href={groupItem.product.productImgPath} target="_blank" rel="noreferrer">
                              <img
                                src={groupItem.product.productImgPath}
                                alt={groupItem.product.productName}
                                onError={() => setImgError(true)}
                                style={{
                                  maxWidth: '100px',
                                  minWidth: '100px',
                                  maxHeight: '150px',
                                  minHeight: '150px',
                                  objectFit: 'fill'
                                }}
                              />
                            </a>
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
                        <TableCell sx={{ maxWidth: '4rem', maxHeight: '2rem' }}>{groupItem.product.productDescription}</TableCell>
                        <TableCell style={{ fontWeight: 'bold', color: 'green' }}>
                          {getProductCurrency(groupItem.product.productPriceCurrency)}
                        </TableCell>
                        <TableCell>
                          {/* Delete ProductGroupItem */}
                          <Button style={{ color: 'red' }} onClick={() => handleEditClick(groupItem.productGroupItemId)}>
                            <DeleteIcon />
                          </Button>

                          {/* Dialog Delete */}
                          <Dialog
                            open={openDialogIds[groupItem.productGroupItemId] || false}
                            onClose={() => handleCloseDialog(groupItem.productGroupItemId)}
                          >
                            <DialogTitle variant="h4">Delete Product Group Item</DialogTitle>
                            <DialogContent>Delete product group item `{groupItem.product.productName}`</DialogContent>
                            <DialogActions>
                              <Button onClick={() => handleCloseDialog(groupItem.productGroupItemId)} color="secondary">
                                Cancel
                              </Button>

                              <Button onClick={(e) => handleSubmitDeleteProductGroupItem(e, groupItem)} disabled={isSubmitting}>
                                OK
                              </Button>
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
                open={openSnackBar2}
                onClose={() => setOpenSnackBar2(false)}
                // message={errorMessage}
                // key={groupItem.productId}
              >
                <Alert
                  onClose={() => setOpenSnackBar2(false)}
                  severity={errorMessage2 === '' ? 'success' : 'error'}
                  variant="filled"
                  sx={{ width: '100%' }}
                >
                  {errorMessage2 === '' ? successMessage2 : errorMessage2}
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
        <Box sx={{ p: 2 }}>
          <TextField fullWidth label="Search Product Groups" variant="outlined" value={searchTerm} onChange={handleSearchChange} />
        </Box>

        <Table aria-label="collapsible table">
          {/* Header */}
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell style={{ fontWeight: 'bold' }} sx={{ maxWidth: '50px  ', minWidth: '50px' }}>
                Product group
              </TableCell>
              <TableCell style={{ fontWeight: 'bold' }} sx={{ maxWidth: '50px  ', minWidth: '50px' }}>
                Price type
              </TableCell>
              <TableCell style={{ fontWeight: 'bold' }} sx={{ maxWidth: '50px  ', minWidth: '50px' }}>
                <Button variant="contained" sx={{ ml: 1 }} onClick={handleAddProductGroupClick}>
                  <AddIcon />
                </Button>
                {/* Add product dialog */}
                <Dialog sx={{ m: '1rem' }} open={toggleAddProductGroup} onClose={() => setToggleAddProductGroup(!toggleAddProductGroup)}>
                  <DialogTitle sx={{ minWidth: '200px' }}>Add Product Group</DialogTitle>

                  {/* Product group name */}
                  <DialogContent>
                    <TextField
                      autoFocus
                      margin="dense"
                      name="productGroupName"
                      label="Product Group Name"
                      type="text"
                      fullWidth
                      variant="standard"
                      value={productGroupCreate.productGroupName}
                      onChange={handleAddProductGroup}
                    />
                  </DialogContent>

                  {/* haveNormalPrice */}
                  <DialogContent sx={{ display: 'flex', alignItems: 'center' }}>
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
                    onClose={() => setOpenSnackBar(false)}
                    // message={errorMessage}
                    // key={groupItem.productId}
                  >
                    <Alert
                      onClose={() => setOpenSnackBar(false)}
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
                {filteredProductGroups
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                  <Row key={index} row={row} />
                ))}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        sx={{ display: 'flex', justifyContent: 'flex-end' }}
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredProductGroups.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
}; // <-- Add a semicolon here
export default MyCollectionProductGroupDetails;
