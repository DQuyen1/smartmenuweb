import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainCard from 'ui-component/cards/MainCard';
import {
  Typography,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Tooltip,
  styled,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  FormHelperText
} from '@mui/material';
import { gridSpacing } from 'store/constant';
import FolderIcon from '@mui/icons-material/Folder';
import UploadIcon from '@mui/icons-material/Upload';

// Create a styled card component to resemble a folder
const FolderCard = styled(Card)({
  borderRadius: 8, // Rounded corners
  border: '2px solid #ccc', // Slightly thicker border
  overflow: 'hidden', // Hide overflowing content
  position: 'relative', // For positioning the icon

  '&::before': {
    // Create the folder tab shape
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '20px', // Adjust tab height as needed
    backgroundColor: '#f5f5f5', // Light background for the tab
    transform: 'translateY(-50%)', // Position the tab above the card
    borderBottom: '2px solid #ccc' // Border for the tab
  }
});

const EntityFont = () => {
  const [fontData, setFontData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateNewFontData = () => {
    const errors = {};
    if (!selectedFile) {
      errors.file = 'Please select a font file';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleUploadClick = () => {
    setShowUploadDialog(true);
  };

  const handleCloseUploadDialog = () => {
    setShowUploadDialog(false);
    setSelectedFile(null); // Clear the selected file
    setValidationErrors({});
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setValidationErrors((prevErrors) => ({ ...prevErrors, file: '' }));
  };

  const handleUploadFont = async () => {
    if (!validateNewFontData()) {
      return; // Don't proceed if validation fails
    }

    const formData = new FormData();
    formData.append('File', selectedFile); // Append the file to the FormData

    try {
      const response = await axios.post('http://3.1.81.96/api/Fonts', formData, {
        // Replace with your actual API endpoint
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 201) {
        fetchFontData();
        setOpenSnackbar(true);
        setSnackbarMessage('Font uploaded successfully!');
      } else {
        console.error('Error uploading font:', response);
        setError(response.data?.error || response.statusText);
      }
    } catch (error) {
      console.error('Error uploading font:', error);
      setError('An error occurred while uploading the font.');
    } finally {
      handleCloseUploadDialog();
    }
  };

  const fetchFontData = async () => {
    try {
      const response = await axios.get('http://3.1.81.96/api/Fonts?pageNumber=1&pageSize=100'); // Replace with your actual font API endpoint
      setFontData(response.data);
    } catch (error) {
      console.error('Error fetching font data:', error);
      setError(error.message || 'An error occurred while fetching font data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFontData();
  }, []); // Empty dependency array ensures this runs only once on component mount

  const renderFontCard = (font) => (
    <Grid item xs={12} sm={6} md={4} key={font.bFontId}>
      <Tooltip title={font.fontPath}>
        <FolderCard elevation={2} sx={{ transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: 4 } }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
            <FolderIcon sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h6" component="div" noWrap sx={{ fontFamily: font.fontPath, fontWeight: 'bold' }}>
              {font.fontName}
            </Typography>
          </CardContent>
        </FolderCard>
      </Tooltip>
    </Grid>
  );

  return (
    <MainCard title="Fonts">
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleUploadClick}
                startIcon={<UploadIcon />}
                sx={{ mb: 2, color: 'white' }}
              >
                Upload Font
              </Button>
            </Box>
            <Grid container spacing={gridSpacing}>
              {fontData.map(renderFontCard)}
            </Grid>
          </>
        )}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog open={showUploadDialog} onClose={handleCloseUploadDialog}>
        <DialogTitle>Upload New Font</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mt: 2 }}>Select a font file to upload:</DialogContentText>
          <input type="file" accept=".ttf,.otf" onChange={handleFileChange} />

          {validationErrors.file && ( // Display file error (if any)
            <FormHelperText error>{validationErrors.file}</FormHelperText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleUploadFont} variant="contained">
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default EntityFont;
