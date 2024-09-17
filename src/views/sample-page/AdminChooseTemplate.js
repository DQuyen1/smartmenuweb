import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const AdminChooseTemplate = () => {
  const [templateData, setTemplateData] = useState([]);
  const [brandData, setBrandData] = useState([]); // Keep track of brand data
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(''); // State for search filter
  const [selectedBrand, setSelectedBrand] = useState(''); // State for brand filter
  const navigate = useNavigate();

  const handleViewDetails = (template) => {
    navigate(`/pages/display/${template.templateId}`);
    console.log(template.templateId);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [templateResponse, brandResponse] = await Promise.all([
          axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates?&pageNumber=1&pageSize=1000`),
          axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Brands?pageNumber=1&pageSize=100')
        ]);
        setTemplateData(templateResponse.data);
        setBrandData(brandResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter templates based on search filter and selected brand
  const filteredTemplates = templateData.filter(
    (template) =>
      template.templateName.toLowerCase().includes(filter.toLowerCase()) && (selectedBrand === '' || template.brandId === selectedBrand)
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard title="Choose Template">
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
                  mr: 5, // Adjusted margin-right to fit brand filter
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    paddingRight: 1
                  }
                }}
              />
              <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                <InputLabel id="brand-filter-label">Brand</InputLabel>
                <Select
                  labelId="brand-filter-label"
                  id="brand-filter"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  label="Brand"
                >
                  <MenuItem value="">
                    <em>All Brands</em>
                  </MenuItem>
                  {brandData.map((brand) => (
                    <MenuItem key={brand.brandId} value={brand.brandId}>
                      {brand.brandName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            <Divider sx={{ mt: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'start', mt: 3 }}>
              <Button variant="contained" color="secondary" onClick={() => navigate('/dashboard/default')}>
                Back
              </Button>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminChooseTemplate;
