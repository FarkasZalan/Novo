import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useAuthInitializer } from '../hooks/useAuthInitializer';
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

const AuthContext = createContext<AuthContextType>({
    authState: { user: null, accessToken: null },
    setAuthState: () => { },
    isAuthenticated: false,
    logout: async () => { }
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        accessToken: null
    });

    const isAuthenticated = !!authState.accessToken && !!authState.user;
    const isLoading = useAuthInitializer(setAuthState);

    const logout = async () => {
        try {
            const userEmail = authState.user?.email;
            setAuthState({ user: null, accessToken: null });
            localStorage.removeItem('authState');
            if (userEmail) {
                await apiLogout(userEmail);
            }
        } catch (err) {
            console.error("Logout error:", err);
            localStorage.removeItem('authState');
        }
    };

    // Save auth state to localStorage
    useEffect(() => {
        if (authState.accessToken && authState.user) {
            localStorage.setItem('authState', JSON.stringify(authState));
        } else {
            localStorage.removeItem('authState');
        }
    }, [authState]);

    // Axios interceptors
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (authState.accessToken) {
                    config.headers.Authorization = `Bearer ${authState.accessToken}`;
                }
                config.withCredentials = true;
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
                    } catch (err) {
                        await logout();
                        return Promise.reject(err);
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

    if (isLoading) {
        return <div className="text-center mt-20 text-lg">Loading authentication...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
