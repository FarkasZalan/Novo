import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useAuthInitializer } from '../hooks/useAuthInitializer';
import { refreshToken, logout as apiLogout } from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface AuthState {
    user: any;
    accessToken: string | null;
}

interface AuthContextType {
    authState: AuthState;
    setAuthState: (authState: AuthState) => void;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    darkMode: boolean | null;
    toggleDarkMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
    authState: { user: null, accessToken: null },
    setAuthState: () => { },
    isAuthenticated: false,
    logout: async () => { },
    darkMode: null,
    toggleDarkMode: () => { }
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        accessToken: null
    });
    const [darkMode, setDarkMode] = useState<boolean | null>(null);
    const isAuthenticated = !!authState.accessToken && !!authState.user;
    const isLoading = useAuthInitializer(setAuthState);
    const navigate = useNavigate();

    // Initialize dark/light theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('darkMode');
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        let initialMode = false;
        if (savedTheme === 'true') {
            initialMode = true;
        } else if (savedTheme === 'false') {
            initialMode = false;
        } else if (prefersDarkMode) {
            initialMode = true;
        }

        // Apply theme to document
        if (initialMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        setDarkMode(initialMode);
        localStorage.setItem('darkMode', String(initialMode));
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode!;
        setDarkMode(newMode);

        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('darkMode', String(newMode));
    };

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

        // refresh access token
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

    // Context value
    const value = {
        authState,
        setAuthState,
        isAuthenticated,
        logout,
        darkMode,
        toggleDarkMode
    };

    // Loading screen while authentication is being checked
    if (isLoading) {
        return (
            <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 ${darkMode ? 'dark' : ''}`}>
                <div className="w-full max-w-sm text-center">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Novo</h1>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                                    <svg
                                        className="animate-spin h-6 w-6 text-indigo-600 dark:text-indigo-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                </div>
                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
                            </div>

                            <div>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Securing your session
                                </h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Please wait while we authenticate your credentials
                                </p>
                            </div>

                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4">
                                <div
                                    className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full animate-pulse"
                                    style={{ width: '70%' }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Taking longer than expected?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                                Return to login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Render the app
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}