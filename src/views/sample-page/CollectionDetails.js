import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { Typography, Box, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import CollectionProductGroupDetails from './CollectionProductGroupDetail';

const CollectionDetails = () => {
  const location = useLocation();
  const { collectionData: initialCollectionData } = location.state || {}; // Get menu data from location state
  const [collectionData, setCollectionData] = useState(initialCollectionData || {});
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState(null);
  const [productData, setProductData] = useState({}); // State to store product details
  const [productGroupItemsData, setProductGroupItemsData] = useState({});
  const [productSizePrices, setProductSizePrices] = useState({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [productGroups, setProductGroups] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Categories?pageNumber=1&pageSize=100'); // Replace with your API endpoint
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('An error occurred while fetching categories.');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Products?pageNumber=1&pageSize=100'); // Replace with your API endpoint
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
        // Fetch product group items for this menu
        const productGroupResponse = await axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductGroup/GroupItem?menuId=${collectionData.collectionId}`);
        setProductGroups(productGroupResponse.data);
        const productGroupItems = productGroupResponse.data;
        // Get unique product IDs from all product groups
        const productIds =
          menuData.productGroups && menuData.productGroups.length > 0
            ? [...new Set(productGroupItems.flatMap((group) => group.productGroupItems?.map((item) => item.productId) || []))]
            : [];
        // Fetch product details for all unique product IDs
        if (productIds.length > 0) {
          // Fetch product size prices for all unique product IDs
          const productResponses = await Promise.all(
            productIds.map((id) => axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Products?productId=${id}`)) // Assuming query parameter
          );

          const newProductMap = {};
          productResponses.forEach((response) => {
            // Access the first product in the response array
            const product = response.data[0];
            if (product && product.productId) {
              newProductMap[product.productId] = product; // Access the first element of the array
            }
          });
          setProductData(newProductMap);
          const productSizePromises = productIds.map(
            (id) => axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/ProductSizePrices?productId=${id}`) // Assuming API supports filtering by productId
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

        // Re-organize product group items based on productGroupId
        const reorganizedProductGroups = {};
        productGroupItems.forEach((group) => {
          reorganizedProductGroups[group.productGroupId] = group.productGroupItems;
        });

        setProductGroupItemsData(reorganizedProductGroups); // Update state
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message); // Store the error message as a string
      } finally {
        setIsLoading(false);
      }
    };

    if (collectionData?.collectionId) {
      // Check if menuData is not undefined
      fetchData();
    }
  }, [collectionData]);

  return (
    <MainCard title={<Typography variant="h2">Collection Details</Typography>}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4" style={{ fontWeight: 'normal' }}>
          Collection ID: {collectionData.collectionId}
        </Typography>
        <Typography variant="h4" style={{ fontWeight: 'normal' }}>
          Brand ID: {collectionData.brandId}
        </Typography>
        <Typography variant="h4" style={{ fontWeight: 'normal' }}>
          Name: {collectionData.collectionName}
        </Typography>
        <Typography variant="h4" style={{ fontWeight: 'normal' }}>
          Description: {collectionData.collectionDescription}
        </Typography>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <CollectionProductGroupDetails collectionDataId={collectionData.collectionId} brandId={collectionData.brandId} />
    </MainCard>
  );
};

export default CollectionDetails;
