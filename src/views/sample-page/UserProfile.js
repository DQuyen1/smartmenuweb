import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  InputAdornment,
  Paper
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
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ padding: 2 }}>
                  {/* <Typography variant="h6">Username: {userData.userName}</Typography> */}
                  <Box component="form" noValidate autoComplete="off">
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Username"
                          value={userData.userName}
                          fullWidth
                          disabled
                          variant="outlined"
                          margin="normal"
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'black', // Dùng cho Chrome và Safari
                              color: 'black' // Dùng cho các trình duyệt khác
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Password"
                          value={showPassword ? userData.password : '********'}
                          variant="outlined"
                          fullWidth
                          margin="normal"
                          disabled
                          type={showPassword ? 'text' : 'password'}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'black', // Dùng cho Chrome và Safari
                              color: 'black' // Dùng cho các trình duyệt khác
                            }
                          }}
                        />
                      </Grid>
                      {/* <Typography variant="h6">Email: {userData.email}</Typography> */}
                      <Grid item xs={6}>
                        <TextField
                          label="Email"
                          value={userData.email}
                          variant="outlined"
                          fullWidth
                          margin="normal"
                          disabled
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'black', // Dùng cho Chrome và Safari
                              color: 'black' // Dùng cho các trình duyệt khác
                            }
                          }}
                        />
                      </Grid>
                      {/* <Typography variant="h6">Role: {userData.role === 0 ? 'Admin' : 'Brand Manager'}</Typography> */}
                      <Grid item xs={6}>
                        <TextField
                          label="Role"
                          value={userData.role === 0 ? 'Admin' : 'Brand Manager'}
                          variant="outlined"
                          fullWidth
                          margin="normal"
                          disabled
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'black', // Dùng cho Chrome và Safari
                              color: 'black' // Dùng cho các trình duyệt khác
                            }
                          }}
                        />
                      </Grid>
                      {/* <Typography variant="h6">Email Verified: {userData.emailVerified ? 'Yes' : 'No'}</Typography> */}
                      <Grid item xs={6}>
                        <TextField
                          label="Email Verified"
                          value={userData.emailVerified ? 'Yes' : 'No'}
                          variant="outlined"
                          fullWidth
                          margin="normal"
                          disabled
                          sx={{
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'black', // Dùng cho Chrome và Safari
                              color: 'black' // Dùng cho các trình duyệt khác
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="contained" color="secondary" onClick={() => navigate(-1)}>
                      Back
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
                      Change Password
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
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
