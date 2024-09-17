import { createRoot } from 'react-dom/client';

// third party
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

// project imports
import * as serviceWorker from 'serviceWorker';
import App from 'App';
import { store } from 'store';
import axios from 'axios';
// style + assets
import 'assets/scss/style.scss';
import config from './config';
import axios from 'axios';

// ==============================|| REACT DOM RENDER  ||============================== //

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Add Authorization header to every request
    // console.log('token: ' + token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers.Accept = '*/*'; // Add other global headers if needed

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use((response) => {
  // console.log(response);
  return response;
});

const container = document.getElementById('root');
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Add Authorization header to every request
    // console.log('token: ' + token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers.Accept = '*/*'; // Add other global headers if needed

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use((response) => {
  console.log(response);
  return response;
});
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <Provider store={store}>
    <BrowserRouter basename={config.basename}>
      <App />
    </BrowserRouter>
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
