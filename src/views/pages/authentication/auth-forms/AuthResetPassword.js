import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Button,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
  useTheme
} from '@mui/material';
import { Box, padding } from '@mui/system';
import axios from 'axios';
import { set } from 'lodash';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AnimateButton from 'ui-component/extended/AnimateButton';

const AuthResetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Data part
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({
    email: searchParams.get('email'),
    token: searchParams.get('token'),
    password: '',
    confirmPassword: ''
  });

  // Interact part
  const [showPasswords, setShowPasswords] = useState([false, false]);
  const [toggleButton, setToggleButton] = useState(false);

  const handleShowPassword = (index) => {
    setShowPasswords((prevShowPasswords) => {
      const newShowPasswords = [...prevShowPasswords];
      newShowPasswords[index] = !newShowPasswords[index];
      return newShowPasswords;
    });
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    setToggleButton((prev) => {
      return !prev;
    });
  };

  const handleSubmit = () => {
    console.log(data);
    setToggleButton((prev) => !prev);

    axios
      .post('http://3.1.81.96/api/Auth/ResetPassword', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        console.log(response.data); // Handle successful response
        alert('Password reset successfully');
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.error(error); // Handle
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
          <InputLabel htmlFor="password">Password</InputLabel>
          <OutlinedInput
            id="password"
            name="password"
            type={showPasswords[0] ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => handleShowPassword(0)}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="large"
                >
                  {showPasswords[0] ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            autoComplete="current-password"
            value={data.password}
            onChange={(e) => handleInput(e)}
          />
        </FormControl>

        <FormControl fullWidth sx={{ ...theme.typography.customInput }}>
          <InputLabel htmlFor="confirm-password">Confirm Password</InputLabel>
          <OutlinedInput
            id="confirm-password"
            name="confirmPassword"
            type={showPasswords[1] ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => handleShowPassword(1)}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  size="large"
                >
                  {showPasswords[1] ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            autoComplete="current-password"
            value={data.confirmPassword}
            onChange={(e) => handleInput(e)}
          />
        </FormControl>

        {data.password !== data.confirmPassword ? (
          <p style={{ color: 'red', textAlign: 'right' }}>* Password not match </p>
        ) : (
          <p style={{ visibility: 'hidden' }}>Hidden</p>
        )}

        <Box sx={{ mt: 2 }}>
          <AnimateButton>
            <Button
              disableElevation
              disabled={data.password !== data.confirmPassword || (data.password === '' && data.confirmPassword === '') || toggleButton}
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

export default AuthResetPassword;
