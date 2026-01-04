import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Helper to get the correct API URL based on platform
const getApiUrl = () => {
    const url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5050/api';

    // If on Android and using localhost, swap to 10.0.2.2 (Emulator)
    if (Platform.OS === 'android' && url.includes('localhost')) {
        return url.replace('localhost', '10.0.2.2');
    }

    return url;
};

const API_URL = getApiUrl();

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
    // Venues
    getVenues: async (params?: { sport_type?: string; lat?: number; lng?: number; radius?: number; limit?: number; offset?: number }) => {
        return api.get('/venues', { params });
    },

    getVenueById: async (id: string) => {
        return api.get(`/venues/${id}`);
    },

    getVenueAvailability: async (venueId: string) => {
        return api.get(`/venues/${venueId}/availability`);
    },

    getVenueReviews: async (venueId: string, params?: { limit?: number; offset?: number }) => {
        return api.get(`/venues/${venueId}/reviews`, { params });
    },

    getSportTypes: async () => {
        return api.get('/venues/sports');
    },

    // Court Slots
    getCourtSlots: async (courtId: string, date: string) => {
        return api.get(`/courts/${courtId}/slots`, { params: { date } });
    },

    // Favorites
    getFavorites: async () => {
        return api.get('/users/favorites');
    },

    addFavorite: async (venueId: string) => {
        return api.post(`/users/favorites/${venueId}`);
    },

    removeFavorite: async (venueId: string) => {
        return api.delete(`/users/favorites/${venueId}`);
    },

    // Bookings
    getBookings: async (params?: { status?: string; upcoming?: boolean }) => {
        return api.get('/bookings', { params });
    },

    getBookingById: async (id: string) => {
        return api.get(`/bookings/${id}`);
    },

    createBooking: async (data: { court_id: string; date: string; start_time: string; end_time: string }) => {
        return api.post('/bookings', data);
    },

    cancelBooking: async (id: string, reason?: string) => {
        return api.post(`/bookings/${id}/cancel`, { reason });
    },

    // Reviews
    submitReview: async (bookingId: string, data: { rating: number; comment?: string }) => {
        return api.post(`/reviews/bookings/${bookingId}/review`, data);
    },

    getMyReviews: async () => {
        return api.get('/reviews/my-reviews');
    },

    // Owner APIs
    owner: {
        getVenues: async () => {
            return api.get('/owner/venues');
        },

        createVenue: async (data: any) => {
            return api.post('/owner/venues', data);
        },

        updateVenue: async (id: string, data: any) => {
            return api.put(`/owner/venues/${id}`, data);
        },

        deleteVenue: async (id: string) => {
            return api.delete(`/owner/venues/${id}`);
        },

        getVenueCourts: async (venueId: string) => {
            return api.get(`/owner/venues/${venueId}/courts`);
        },

        createCourt: async (venueId: string, data: any) => {
            return api.post(`/owner/venues/${venueId}/courts`, data);
        },

        getBookings: async (params?: { date?: string; court_id?: string }) => {
            return api.get('/owner/bookings', { params });
        },

        getEarningsSummary: async () => {
            return api.get('/owner/earnings/summary');
        },

        getDashboardStats: async () => {
            return api.get('/owner/dashboard/stats');
        },

        getBlockedSlots: async (courtId: string) => {
            return api.get(`/owner/courts/${courtId}/blocked-slots`);
        },

        createBlockedSlot: async (courtId: string, data: { date: string; start_time: string; end_time: string; reason?: string }) => {
            return api.post(`/owner/courts/${courtId}/blocked-slots`, data);
        },

        deleteBlockedSlot: async (slotId: string) => {
            return api.delete(`/owner/blocked-slots/${slotId}`);
        },

        createWalkin: async (data: { court_id: string; date: string; start_time: string; end_time: string; guest_name: string; guest_phone: string }) => {
            return api.post('/owner/bookings/walk-in', data);
        },
    },
};

