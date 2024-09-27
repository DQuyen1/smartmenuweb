import React, { useState, useEffect } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Paper,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

const ManageTransaction = () => {
  const [transactionData, setTransactionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchTransactionData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const brandId = localStorage.getItem('brandId');
      let response;
      // if (brandId === 'null') {
      //   totalResponse = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Transactions', {
      //     params: {
      //       pageSize: 100000000,
      //       pageNumber: 1,
      //       filter: filter
      //     }
      //   });
      // } else {
      //   totalResponse = await axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Transactions/brand/${brandId}`, {
      //     params: {
      //       pageSize: 100000000,
      //       pageNumber: 1,
      //       filter: filter
      //     }
      //   });
      // }
      // setTotalCount(totalResponse.data.length);
      if (brandId === 'null') {
        response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Transactions', {
          params: {
            pageSize: 100000,
            pageNumber: 1,
            filter: searchTerm
          }
        });
      } else {
        response = await axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Transactions/brand/${brandId}`, {
          params: {
            pageSize: 100000,
            pageNumber: 1,
            filter: searchTerm
          }
        });
      }

      const transactionsData = response.data;

      const transactionsWithDeviceInfo = await Promise.all(
        transactionsData.map(async (transaction) => {
          const deviceInfo = await fetchDeviceSubscriptionInfo(transaction.deviceSubscriptionId);
          return { ...transaction, deviceInfo };
        })
      );

      setTransactionData(transactionsWithDeviceInfo);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      setError(error.message);
      Toastify({
        text: `Error: ${error.message}`,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(to right, #ff0000, #ff6347)'
      }).showToast();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionData();
  }, []);

  const fetchDeviceSubscriptionInfo = async (deviceSubscriptionId) => {
    try {
      const response = await axios.get('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/DeviceSubscriptions', {
        params: {
          deviceSubscriptionId,
          pageNumber: 1,
          pageSize: 10
        }
      });
      return response.data[0];
    } catch (error) {
      console.error('Error fetching device subscription info:', error);
      return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPayTypeString = (payType) => {
    return payType === 0 ? 'Bank' : 'Card';
  };

  // const handleFilterChange = (event) => {
  //     setFilter(event.target.value);
  //     setPage(0);
  // };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setPage(0);
  };

  // Pagination

  const [page, setPage] = useState(0); // State for current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // State for rows per page

  // Function to handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Function to handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page after changing rows per page
  };

  // Searching
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  useEffect(() => {
    const results = transactionData.filter(
      (data) =>
        data.amount.toString().includes(searchTerm) ||
        data.deviceInfo?.storeDevice?.storeDeviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(results);
  }, [searchTerm, transactionData]);

  useEffect(() => {
    const result = transactionData.filter((data) => data.payDate.includes(selectedDate));
    setFilteredTransactions(result);
  }, [selectedDate, transactionData]);

  return (
    <MainCard title="Transactions">
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2, p: 2 }}>
        <TextField
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          placeholder="Search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ mr: 2 }}
        />
        <TextField
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          variant="outlined"
          InputLabelProps={{
            shrink: true
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
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
              <TableHead>
                <TableRow>
                  <TableCell>Device</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Pay Type</TableCell>
                  <TableCell>Pay Date</TableCell>
                  <TableCell>Expired In</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((transaction) => (
                    <TableRow key={transaction.transactionId}>
                      <TableCell>{transaction.deviceInfo?.storeDevice?.storeDeviceName || 'N/A'}</TableCell>
                      <TableCell>{formatPrice(transaction.amount)}</TableCell>
                      <TableCell>{getPayTypeString(transaction.payType)}</TableCell>
                      <TableCell>{formatDate(transaction.payDate)}</TableCell>
                      <TableCell>{transaction.deviceInfo ? formatDate(transaction.deviceInfo.subscriptionEndDate) : 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center"></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </MainCard>
  );
};

export default ManageTransaction;
