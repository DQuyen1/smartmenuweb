import {
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
  useMediaQuery
} from '@mui/material';
import AuthWrapper1 from '../AuthWrapper1';
import AuthCardWrapper from '../AuthCardWrapper';
import { Form, Link, useNavigate } from 'react-router-dom';
import Logo from 'ui-component/Logo';
import { Stack } from 'immutable';
import AuthFooter from 'ui-component/cards/AuthFooter';
import { useTheme } from '@emotion/react';
import AuthResetPassword from './AuthResetPassword';
import { Box } from '@mui/system';
import { Label, Visibility, VisibilityOff } from '@mui/icons-material';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { useEffect, useState } from 'react';
import axios from 'axios';

const AuthForgotPassword = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AuthWrapper1>
      <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
        <Grid item xs={12}>
          <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
            <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                  <Grid item sx={{ mb: 3 }}>
                    <Link to="#">
                      <Logo />
                    </Link>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container direction={matchDownSM ? 'column-reverse' : 'row'} alignItems="center" justifyContent="center">
                      <Grid item>
                        <Typography color={theme.palette.secondary.main} gutterBottom variant={matchDownSM ? 'h3' : 'h2'}>
                          Forgot password
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <AuthForgotPasswordForm />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
          <AuthFooter />
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
};

const AuthForgotPasswordForm = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [toggleButton, setToggleButton] = useState(false);
  const navigate = useNavigate();

  const handleInput = (e) => {
    setEmail(e.target.value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(emailRegex.test(e.target.value) ? '' : 'Invalid email format');
  };

  useEffect(() => {
    if (emailError === '' && email !== '') {
      setToggleButton(true);
    } else {
      setToggleButton(false);
    }
  }, [emailError]);

  const handleSubmit = () => {
    // console.log(data);
    setToggleButton((prev) => !prev);

    axios
      // .post(`http://localhost:5063/api/Auth/ForgotPassword?email=${email}`)
      .post(`https://3.1.81.96/api/Auth/ForgotPassword?email=${email}`)
      .then((response) => {
        console.log(response.data); // Handle successful response
        alert('Reset password email sent successfully');
        navigate('/', { replace: true });
      })
      .catch((error) => {
        // console.error(error); // Handle
        setEmailError(error.response.data.error);
        setToggleButton((prev) => !prev);
      });
  };

  return (
    <>
      <Grid container direction="column" justifyContent="center" spacing={2}>
        <Grid item xs={12} container alignItems="center" justifyContent="center">
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Fill in information to reset</Typography>
          </Box>
        </Grid>
      </Grid>
      {}
      <form>
        <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
          <InputLabel htmlFor="email">Email</InputLabel>
          <OutlinedInput id="email" name="email" value={email} onChange={handleInput} inputMode="email" aria-describedby="email-error" />
        </FormControl>

        <FormControl fullWidth>
          {emailError ? (
            <span id="email-error" style={{ color: 'red', textAlign: 'right' }}>
              * {emailError}
            </span>
          ) : (
            <span hidden>Hidden</span>
          )}
        </FormControl>

        <Box sx={{ mt: 2 }}>
          <AnimateButton>
            <Button
              disableElevation
              disabled={!toggleButton}
              fullWidth
              size="large"
              variant="contained"
              color="secondary"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </AnimateButton>
        </Box>
      </form>
    </>
  );
};

export default AuthForgotPassword;
