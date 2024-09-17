import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography
} from '@mui/material';

// third party
import { Formik } from 'formik';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// import { useDispatch } from 'react-redux';
// import { loginSuccess } from 'store/actions';

// ============================|| FIREBASE - LOGIN ||============================ //

const FirebaseLogin = ({ ...others }) => {
  // const dispatch = useDispatch();
  const theme = useTheme();
  const [checked, setChecked] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {}, []);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState(null);

  return (
    <>
      <Grid container direction="column" justifyContent="center" spacing={2}>
        <Grid item xs={12} container alignItems="center" justifyContent="center">
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Sign in with Email address</Typography>
          </Box>
        </Grid>
      </Grid>

      <Formik
        initialValues={{
          userName: '',
          password: '',
          submit: null
        }}
        onSubmit={async (values, { setStatus, setSubmitting }) => {
          try {
            const response = await axios.post(
              'https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Auth/Login',
              {
                userName: values.userName,
                password: values.password
              },
              {
                headers: {
                  'Content-Type': 'application/json' // Set content type explicitly
                }
              }
            );

            if (response.status === 200) {
              // Successful login (handle token/session storage, etc.)
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('userId', response.data.userId);
              localStorage.setItem('role', response.data.role);
              localStorage.setItem('brandId', response.data.brandId);

              setStatus({ success: true });
              setSubmitting(false);
              navigate('/dashboard/default', { replace: true });
            } else {
              // Handle login error
              const errorData = response.data;
              if (errorData && errorData.error) {
                setLoginError(errorData.error);
              } else {
                setLoginError('Login failed. Please try again.');
              }
              setStatus({ success: false });
              setSubmitting(false);
            }
          } catch (error) {
            // Handle network errors or other exceptions
            setLoginError('Login failed. Please try again.');
            setStatus({ success: false });
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...others}>
            <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
              <InputLabel htmlFor="outlined-adornment-email-login">Username</InputLabel>
              <OutlinedInput
                id="outlined-adornment-email-login"
                type="text"
                value={values.userName}
                name="userName"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Username"
                inputProps={{}}
              />
            </FormControl>

            <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ ...theme.typography.customInput }}>
              <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password-login"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                inputProps={{}}
              />
              {touched.password && errors.password && (
                <FormHelperText error id="standard-weight-helper-text-password-login">
                  {errors.password}
                </FormHelperText>
              )}
            </FormControl>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />
                }
                label="Remember me"
              />
              <Typography variant="subtitle1" color="secondary" sx={{ textDecoration: 'none', cursor: 'pointer' }}>
                <Link to="/pages/forgot-password">Forgot Password?</Link>
              </Typography>
            </Stack>
            {errors.submit && (
              <Box sx={{ mt: 3 }}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <AnimateButton>
                <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="secondary">
                  Sign in
                </Button>
              </AnimateButton>
            </Box>
            {loginError && ( // Only show error message if loginError is not null
              <Box sx={{ mt: 3 }}>
                <FormHelperText error>{loginError}</FormHelperText>
              </Box>
            )}
          </form>
        )}
      </Formik>
    </>
  );
};

export default FirebaseLogin;
