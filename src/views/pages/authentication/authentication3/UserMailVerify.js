import { CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const { Box, padding } = require('@mui/system');
const { useState, useEffect } = require('react');

const UserMailVerify = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState({
    email: searchParams.get('email')
  });

  const textResponse = (isError) => {
    const successMessage = 'Verified successfully';
    const errorMessage = 'Email already verified';

    return (
      <>
        <Typography variant="h2">{isError ? errorMessage : successMessage}</Typography>
        <Typography variant="h4">
          Redirecting in 5 seconds. If not redirected automatically, click <Link to="/">here</Link>
        </Typography>
      </>
    );
  };

  useEffect(() => {
    axios
      .post(`https://3.1.81.96/api/Auth/EmailVerify?email=${data.email}`)
      .then((response) => {
        setIsVerifying(true);
      })
      .catch((error) => {
        console.log('error');
        setIsVerifying(true);
        setIsError(true);
      });
  }, [data]);

  useEffect(() => {
    if (isVerifying) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000); // Redirect after 5 seconds

      return () => clearTimeout(timer); // Cleanup function
    }
  }, [isVerifying, navigate]);

  return (
    <Box display="flex" alignItems="center" justifyContent="center" sx={{ paddingTop: '30px' }}>
      {/* Ensure the parent container has a defined height */}
      <Box display="flex" flexDirection="column" alignItems="center">
        {!isVerifying ? <CircularProgress size={100} /> : <>{textResponse(isError)}</>}
      </Box>
    </Box>
  );
};

export default UserMailVerify;
