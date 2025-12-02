import api from './api';
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<User> => {
    const response = await api.post<User>('/auth/register', credentials);
    return response.data;
};

export const getCurrentUser = async (token?: string): Promise<User> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get<User>('/auth/me', config);
    return response.data;
};
