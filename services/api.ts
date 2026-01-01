import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management functions with web fallback
export const tokenStorage = {
    async getAccessToken(): Promise<string | null> {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(ACCESS_TOKEN_KEY);
            }
            return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        } catch {
            return null;
        }
    },

    async getRefreshToken(): Promise<string | null> {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(REFRESH_TOKEN_KEY);
            }
            return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        } catch {
            return null;
        }
    },

    async setTokens(accessToken: string, refreshToken: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        } else {
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        }
    },

    async clearTokens(): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
        } else {
            await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        }
    },
};

// Request interceptor - add auth token
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await tokenStorage.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await tokenStorage.getRefreshToken();
                if (refreshToken) {
                    // Attempt to refresh the token
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    if (response.data.success) {
                        const { access_token, refresh_token } = response.data.data.session;
                        await tokenStorage.setTokens(access_token, refresh_token);

                        // Retry the original request
                        originalRequest.headers.Authorization = `Bearer ${access_token}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens
                await tokenStorage.clearTokens();
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || 'An error occurred';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

// API Wrapper Functions
export const apiService = {
    getVenues: async (params?: { sport_type?: string; limit?: number; offset?: number }) => {
        return api.get('/venues', { params });
    },

    getVenueById: async (id: string) => {
        return api.get(`/venues/${id}`);
    },

    // Auth functions (can be moved here later if needed)
};

