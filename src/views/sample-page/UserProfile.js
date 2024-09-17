import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Users', {
          params: { userId: userId, pageNumber: 1, pageSize: 100 }
        });
        setUserData(response.data[0]);
      } catch (err) {
        setError('Failed to fetch user data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setPasswordError('');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      await axios.put(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Users/${userId}`, {
        password: newPassword,
        confirmPassword: confirmPassword
      });

      // Log out after successful password change
      localStorage.clear();
      navigate('/', { replace: true }); // Redirect to login page
    } catch (err) {
      setPasswordError('Failed to change password.');
    }
  };

  return (
    <MainCard title="User Profile">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="h6">Username: {userData.userName}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6">Password: {showPassword ? userData.password : '********'}</Typography>
                <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Box>
              <Typography variant="h6">Email: {userData.email}</Typography>
              <Typography variant="h6">Role: {userData.role === 0 ? 'Admin' : 'Brand Manager'}</Typography>
              <Typography variant="h6">Email Verified: {userData.emailVerified ? 'Yes' : 'No'}</Typography>
              <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
                Change Password
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Change Password Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="dense"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="dense"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && <Typography color="error">{passwordError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleChangePassword} color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default UserProfile;
