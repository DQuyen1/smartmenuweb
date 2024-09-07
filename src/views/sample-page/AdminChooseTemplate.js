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
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const AdminChooseTemplate = () => {
  const [templateData, setTemplateData] = useState([]);
  const [, setBrandData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(''); // New state for search filter
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
          axios.get(`http://3.1.81.96/api/Templates?&pageNumber=1&pageSize=1000`),
          axios.get('http://3.1.81.96/api/Brands?pageNumber=1&pageSize=100')
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

  const filteredTemplates = templateData.filter((template) => template.templateName.toLowerCase().includes(filter.toLowerCase()));

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
                  mr: 60, // Set a fixed width (adjust as needed)
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    paddingRight: 1
                  }
                }}
              />
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
              <Button variant="contained" color="secondary" onClick={() => navigate(-1)}>
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
