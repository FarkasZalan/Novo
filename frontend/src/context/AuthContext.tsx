import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useAuthInitializer } from '../hooks/useAuthInitializer';
import { refreshToken, logout as apiLogout } from '../services/authService';
import { useNavigate } from 'react-router-dom';

/**
 * AuthState Interface
 * 
 * This interface defines the structure of the authentication state:
 * - user: Contains user information (name, email, etc.)
 * - accessToken: The JWT token used for API authentication
 * 
 * This state is stored in memory and persisted to localStorage
 */
interface AuthState {
    user: any;
    accessToken: string | null;
}

/**
 * AuthContextType Interface
 * 
 * This interface defines the shape of the authentication context:
 * - authState: The current authentication state
 * - setAuthState: Function to update the authentication state
 * - isAuthenticated: Boolean indicating if a user is logged in
 * - logout: Function to log the user out
 * - darkMode: Boolean indicating if dark mode is enabled
 * - toggleDarkMode: Function to toggle dark mode
 * 
 * This context is provided to all components in the app via AuthProvider
 */
interface AuthContextType {
    authState: AuthState;
    setAuthState: (authState: AuthState) => void;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    darkMode: boolean | null;
    toggleDarkMode: () => void;
}

/**
 * AuthContext
 * 
 * This is the React context that will be used to share authentication state
 * throughout the application. It's initialized with default values that will
 * be overridden by the AuthProvider.
 * 
 * The context allows any component in the app to access authentication state
 * and methods without prop drilling.
 */
const AuthContext = createContext<AuthContextType>({
    authState: { user: null, accessToken: null },
    setAuthState: () => { },
    isAuthenticated: false,
    logout: async () => { },
    darkMode: null,
    toggleDarkMode: () => { }
});

/**
 * AuthProvider Component
 * 
 * This is the main provider component that wraps the application and provides
 * authentication context to all child components.
 * 
 * It manages:
 * 1. Authentication state (user info and access token)
 * 2. Dark mode preferences
 * 3. Axios interceptors for automatic token handling
 * 4. Persistence of auth state to localStorage
 * 
 * @param children - React components that will have access to the auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    // State to store user information and access token
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        accessToken: null
    });

    // State to manage dark mode preference
    const [darkMode, setDarkMode] = useState<boolean | null>(null);

    // Derived state that indicates if a user is authenticated
    const isAuthenticated = !!authState.accessToken && !!authState.user;

    // Custom hook to initialize authentication state
    const isLoading = useAuthInitializer(setAuthState);

    // React Router hook for navigation
    const navigate = useNavigate();

    /**
     * Initialize dark/light theme
     * 
     * This effect runs once when the component mounts and:
     * 1. Checks localStorage for saved theme preference
     * 2. Falls back to system preference if no saved preference
     * 3. Applies the theme to the document
     * 4. Saves the preference to localStorage
     */
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

    /**
     * Toggle dark mode
     * 
     * This function:
     * 1. Toggles the darkMode state
     * 2. Updates the document class
     * 3. Saves the preference to localStorage
     */
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

    /**
     * Logout function
     * 
     * This function:
     * 1. Clears the auth state in memory
     * 2. Removes auth data from localStorage
     * 3. Calls the API to invalidate the refresh token
     * 4. Clears all cookies
     * 
     * It's designed to work even if the API call fails, ensuring the user
     * is always logged out locally.
     */
    const logout = async () => {
        try {
            const userEmail = authState.user?.email;
            setAuthState({ user: null, accessToken: null });
            localStorage.removeItem('authState');
            if (userEmail) {
                await apiLogout(userEmail);
            }
            // Clear any other auth-related data
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        } catch (err) {
            console.error("Logout error:", err);
            // Even if the API call fails, clear local auth state
            setAuthState({ user: null, accessToken: null });
            localStorage.removeItem('authState');
        }
    };

    /**
     * Persist auth state to localStorage
     * 
     * This effect runs whenever authState changes and:
     * 1. Saves auth state to localStorage if user is authenticated
     * 2. Removes auth data from localStorage if user is not authenticated
     * 
     * This ensures the auth state persists across page refreshes.
     */
    useEffect(() => {
        if (authState.accessToken && authState.user) {
            localStorage.setItem('authState', JSON.stringify(authState));
        } else {
            localStorage.removeItem('authState');
        }
    }, [authState]);

    /**
     * Set up axios interceptors
     * 
     * This effect sets up two interceptors:
     * 1. Request interceptor: Adds the access token to all outgoing requests
     * 2. Response interceptor: Handles token errors (401/403) by:
     *    - Attempting to refresh the token
     *    - Retrying the original request with the new token
     *    - Logging out if refresh fails
     * 
     * The interceptors are cleaned up when the component unmounts.
     */
    useEffect(() => {
        // Request interceptor to add token to all requests
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

        // Response interceptor to handle token errors
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Check for specific error codes that shouldn't trigger refresh
                const noRefreshTokenError = error.response?.data?.code === "NO_REFRESH_TOKEN";
                const invalidRefreshTokenError = error.response?.data?.code === "INVALID_REFRESH_TOKEN";

                // if there are no refresh token or the session id in invalid then don't trigger to try again just log out
                if (noRefreshTokenError || invalidRefreshTokenError) {
                    await logout();
                    return Promise.reject(error);
                }

                // Check if the error is due to an expired token (401) or invalid token (403)
                const isTokenError = error.response?.status === 401 || error.response?.status === 403;
                const hasNotRetried = !originalRequest._retry;

                if (isTokenError && hasNotRetried) {
                    originalRequest._retry = true;

                    try {
                        // Attempt to refresh the token
                        const data = await refreshToken();
                        console.log("Token refreshed successfully");

                        // Update auth state with new token
                        setAuthState({
                            user: data.user,
                            accessToken: data.accessToken
                        });

                        // Create a new request with the updated token
                        const newRequest = {
                            ...originalRequest,
                            headers: {
                                ...originalRequest.headers,
                                Authorization: `Bearer ${data.accessToken}`
                            }
                        };

                        // Add a small delay to ensure the token is properly set in the auth state
                        await new Promise(resolve => setTimeout(resolve, 100));

                        // Retry the original request with the new token
                        return axios(newRequest);
                    } catch (refreshError) {
                        console.error("Failed to refresh token:", refreshError);
                        // If refresh fails, log out the user
                        await logout();
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        // Clean up interceptors when component unmounts
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [authState.accessToken]);

    // Context value object that will be provided to consumers
    const value = {
        authState,
        setAuthState,
        isAuthenticated,
        logout,
        darkMode,
        toggleDarkMode
    };

    // Show loading screen while authentication is being checked
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

    // Render the app with the auth context provider
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * 
 * This is a custom hook that provides access to the authentication context.
 * It's a crucial part of the authentication system because:
 * 
 * 1. It provides a clean, consistent API for components to access auth state and methods
 * 2. It ensures components can only use auth context when wrapped in an AuthProvider
 * 3. It simplifies component code by abstracting away the context consumption logic
 * 4. It provides type safety for the auth context
 * 
 * Usage example:
 * ```tsx
 * function MyComponent() {
 *   const { authState, logout } = useAuth();
 *   
 *   return (
 *     <div>
 *       {authState.user ? (
 *         <button onClick={logout}>Logout</button>
 *       ) : (
 *         <Link to="/login">Login</Link>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 * 
 * Without this hook, components would need to use useContext directly:
 * ```tsx
 * const authContext = useContext(AuthContext);
 * if (!authContext) {
 *   throw new Error('useAuth must be used within an AuthProvider');
 * }
 * ```
 * 
 * This hook encapsulates this boilerplate code and provides a better developer experience.
 * 
 * @returns The authentication context
 * @throws Error if used outside of an AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}