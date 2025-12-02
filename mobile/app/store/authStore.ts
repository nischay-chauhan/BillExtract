import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    loadToken: () => Promise<void>;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Storage adapter for cross-platform support
const storage = {
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.error('Local storage error:', e);
            }
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.error('Local storage error:', e);
                return null;
            }
        } else {
            return await SecureStore.getItemAsync(key);
        }
    },
    deleteItem: async (key: string) => {
        if (Platform.OS === 'web') {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('Local storage error:', e);
            }
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: async (user, token) => {
        // Update state immediately for UI responsiveness
        set({ user, token, isAuthenticated: true });

        try {
            await storage.setItem(TOKEN_KEY, token);
            await storage.setItem(USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Error saving auth data:', error);
        }
    },

    logout: async () => {
        try {
            await storage.deleteItem(TOKEN_KEY);
            await storage.deleteItem(USER_KEY);
            set({ user: null, token: null, isAuthenticated: false });
        } catch (error) {
            console.error('Error clearing auth data:', error);
            // Ensure state is cleared even if storage fails
            set({ user: null, token: null, isAuthenticated: false });
        }
    },

    loadToken: async () => {
        try {
            const token = await storage.getItem(TOKEN_KEY);
            const userStr = await storage.getItem(USER_KEY);

            if (token && userStr) {
                const user = JSON.parse(userStr);
                set({ token, user, isAuthenticated: true, isLoading: false });
            } else {
                set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            console.error('Error loading auth data:', error);
            set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
