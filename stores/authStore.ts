import { create } from 'zustand';
import api, { tokenStorage, getErrorMessage } from '@/services/api';
import { User, LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '@/interfaces/types';

interface AuthState {
    // State
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginRequest) => Promise<boolean>;
    registerUser: (data: RegisterRequest) => Promise<boolean>;
    registerOwner: (data: RegisterRequest) => Promise<boolean>;
    logout: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<boolean>;
    clearError: () => void;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    // Initial state
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,

    // Initialize - check for existing session
    initialize: async () => {
        try {
            const token = await tokenStorage.getAccessToken();
            if (token) {
                await get().fetchProfile();
            } else {
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false, isAuthenticated: false, user: null });
        }
    },

    // Login
    login: async (credentials: LoginRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post<any>('/auth/login', credentials);
            const data = response.data;

            // Backend returns: { message, user, profile, access_token, refresh_token }
            if (data.access_token && data.refresh_token) {
                await tokenStorage.setTokens(data.access_token, data.refresh_token);

                // Use profile data for the user object (it has role info)
                const user = data.profile || data.user;

                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });
                return true;
            }

            set({
                isLoading: false,
                error: data.message || 'Login failed'
            });
            return false;
        } catch (error) {
            const message = getErrorMessage(error);
            set({ isLoading: false, error: message });
            return false;
        }
    },

    // Register as User (Player) - Does NOT auto-login
    registerUser: async (data: RegisterRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post<any>('/auth/register/user', data);
            const resData = response.data;

            // Registration successful - do NOT auto-login
            // User should manually log in after registration
            if (resData.message || resData.profile || resData.user) {
                set({ isLoading: false, error: null });
                return true;
            }

            set({
                isLoading: false,
                error: resData.message || 'Registration failed'
            });
            return false;
        } catch (error) {
            const message = getErrorMessage(error);
            set({ isLoading: false, error: message });
            return false;
        }
    },

    // Register as Owner - Does NOT auto-login
    registerOwner: async (data: RegisterRequest): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post<any>('/auth/register/owner', data);
            const resData = response.data;

            // Registration successful - do NOT auto-login
            // User should manually log in after registration
            if (resData.message || resData.profile || resData.user) {
                set({ isLoading: false, error: null });
                return true;
            }

            set({
                isLoading: false,
                error: resData.message || 'Registration failed'
            });
            return false;
        } catch (error) {
            const message = getErrorMessage(error);
            set({ isLoading: false, error: message });
            return false;
        }
    },

    // Logout
    logout: async () => {
        set({ isLoading: true });
        try {
            await api.post('/auth/logout');
        } catch {
            // Ignore logout API errors
        } finally {
            await tokenStorage.clearTokens();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        }
    },

    // Fetch current user profile
    fetchProfile: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get<any>('/auth/me');
            const data = response.data;

            // Backend returns: { user, profile }
            if (data.profile || data.user) {
                const user = data.profile || data.user;
                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false
                });
            } else {
                await tokenStorage.clearTokens();
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false
                });
            }
        } catch {
            await tokenStorage.clearTokens();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false
            });
        }
    },

    // Update profile
    updateProfile: async (data: Partial<User>): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put<ApiResponse<User>>('/auth/me', data);

            if (response.data.success && response.data.data) {
                set({
                    user: response.data.data,
                    isLoading: false
                });
                return true;
            }

            set({
                isLoading: false,
                error: response.data.message || 'Update failed'
            });
            return false;
        } catch (error) {
            const message = getErrorMessage(error);
            set({ isLoading: false, error: message });
            return false;
        }
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },
}));
