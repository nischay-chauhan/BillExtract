import axios from 'axios';
import { Platform } from 'react-native';

// Use localhost for iOS simulator, 10.0.2.2 for Android emulator
// For physical devices, replace with your computer's IP address
const getBaseUrl = () => {
    // EC2 Instance URL
    return 'http://3.109.185.58:8001';
};

const BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

import { useAuthStore } from '../store/authStore';

api.interceptors.request.use(
    async (config) => {
        const token = useAuthStore.getState().token;
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`[API] Response:`, response.status);
        return response;
    },
    async (error) => {
        if (error.response) {
            console.error('[API] Response error:', error.response.status, error.response.data);

            if (error.response.status === 401) {
                console.log('[API] 401 detected, logging out...');
                await useAuthStore.getState().logout();
            }
        } else if (error.request) {
            console.error('[API] No response received:', error.message);
        } else {
            console.error('[API] Request setup error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
