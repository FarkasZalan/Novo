import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { refreshToken, logout as apiLogout } from '../services/authService';

interface AuthState {
    user: any;
    accessToken: string | null;
}

interface AuthContextType {
    authState: AuthState;
    setAuthState: (authState: AuthState) => void;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    authState: { user: null, accessToken: null },
    setAuthState: () => { },
    isAuthenticated: false,
    logout: async () => { }
});

// Separate provider component for better Fast Refresh support
export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        accessToken: null
    });

    const isAuthenticated = !!authState.accessToken && !!authState.user;

    const logout = async () => {
        try {
            // Get the current user email before clearing state
            const userEmail = authState.user?.email;

            // Clear auth state immediately for better UX
            setAuthState({
                user: null,
                accessToken: null
            });

            // Call the logout API if we have the email
            if (userEmail) {
                await apiLogout(userEmail);
            }
        } catch (error) {
            console.error("Logout failed:", error);
            // Even if API fails, we still want to clear local state
            setAuthState({
                user: null,
                accessToken: null
            });
        }
    };

    // Add axios interceptors
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (authState.accessToken) {
                    config.headers.Authorization = `Bearer ${authState.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const { data } = await refreshToken();
                        setAuthState({
                            user: data.user,
                            accessToken: data.accessToken
                        });
                        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        await logout();
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [authState.accessToken]);

    const value = {
        authState,
        setAuthState,
        isAuthenticated,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook with proper Fast Refresh support
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}