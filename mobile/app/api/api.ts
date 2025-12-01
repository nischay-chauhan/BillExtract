import axios from 'axios';
import { Platform } from 'react-native';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
// For physical devices, replace with your computer's IP address
const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8000';
    }
    // iOS simulator can use localhost
    return 'http://localhost:8000';
};

const BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 seconds for image upload
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`[API] Response:`, response.status);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('[API] Response error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('[API] No response received:', error.message);
        } else {
            console.error('[API] Request setup error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
