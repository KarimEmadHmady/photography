// src/lib/axios.ts
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { handleError } from './errorHandler';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    handleError(error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
