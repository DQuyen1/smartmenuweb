import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, CircularProgress, Paper, Container, Box } from '@mui/material';

const MyBrand = () => {
  const [brandData, setBrandData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const brandId = localStorage.getItem('brandId');

  useEffect(() => {
    const fetchBrandData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://3.1.81.96/api/Brands', {
          params: {
            brandId: brandId,
            pageNumber: 1,
            pageSize: 10
          }
        });

        if (response.status === 200 && response.data.length > 0) {
          setBrandData(response.data[0]);
        } else {
          throw new Error('No brand data found');
        }
      } catch (err) {
        console.error('Error fetching brand data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandData();
  }, [brandId]);

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {brandData ? (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
              {brandData.brandName}
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {brandData.brandDescription}
            </Typography>
            {brandData.brandImage && (
              <img
                src={brandData.brandImage}
                alt={brandData.brandName}
                style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
              />
            )}
            <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
              Contact: {brandData.brandContactEmail}
            </Typography>
          </Box>
        ) : (
          <Typography>No brand data available</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default MyBrand;
