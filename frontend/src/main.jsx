import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { CartProvider } from './context/CartContext';
import { AlertProvider } from './context/AlertContext';
import { API_ORIGIN } from './utils/api';
import './index.css';

if (API_ORIGIN) {
  axios.defaults.baseURL = API_ORIGIN;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AlertProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AlertProvider>
  </BrowserRouter>
);
