import axios from 'axios';
import { API_ORIGIN } from '../utils/api';

const instance = axios.create({
    baseURL: API_ORIGIN || undefined,
    withCredentials: true
});

export default instance;