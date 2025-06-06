import { Divider, FormControl, Grid, InputLabel, OutlinedInput, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { Formik } from 'formik';
import MinimalLayout from 'layout/MinimalLayout';
import { useState } from 'react';
import AuthWrapper1 from '../AuthWrapper1';
import { Link } from 'react-router-dom';
import Logo from 'ui-component/Logo';
import AuthCardWrapper from '../AuthCardWrapper';
import AuthFooter from 'ui-component/cards/AuthFooter';
import AuthResetPassword from '../auth-forms/AuthResetPassword';

const ResetPassword3 = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const [user, setUser] = useState({
    userName: ''
  });

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
                        <Stack alignItems="center" justifyContent="center" spacing={1}>
                          <Typography color={theme.palette.secondary.main} gutterBottom variant={matchDownSM ? 'h3' : 'h2'}>
                            Reset password
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <AuthResetPassword />
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

export default ResetPassword3;
