import { useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { AuthContext, AuthState } from './AuthContext';
import { useAuthInitializer } from '../hooks/useAuthInitializer';
import { refreshToken, logout as backendLogout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { FaLinkedin, FaGithub, FaEnvelope, FaGlobe } from 'react-icons/fa';

// this file is manages the authentication state 
// so like is the user logged in? what's their token? who are they?

// wrap the entire app with this provider in the app.tsx
// that's handle the authentication and the dark mode
export function AuthProvider({ children }: { children: ReactNode }) {

    // authState holds user info and the token
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        accessToken: null
    });

    // for theme setting
    const [darkMode, setDarkMode] = useState<boolean | null>(null);

    // check if user is logged in -> if user and token is exists then the user is logged in
    const isAuthenticated = !!authState.accessToken && !!authState.user;

    // check if there is a saved login in the localStorage and refresh token in the background
    const isLoading = useAuthInitializer(setAuthState);

    // for navigation
    const navigate = useNavigate();

    // for render server cold start message
    const [showColdStartMessage, setShowColdStartMessage] = useState(false);

    useEffect(() => {
        if (!isLoading) return;

        const coldStartTimer = setTimeout(() => {
            setShowColdStartMessage(true);
        }, 10000); // 10 seconds

        return () => clearTimeout(coldStartTimer);
    }, [isLoading]);

    // dark mode setup
    useEffect(() => {
        // Check if a theme is already saved in localStorage
        const savedTheme = localStorage.getItem('darkMode');

        // If there's no saved theme, use the browser preference
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // If a saved theme exists, use it
        let initialMode = false;
        if (savedTheme === 'true') {
            initialMode = true;
        } else if (savedTheme === 'false') {
            initialMode = false;
        } else if (prefersDarkMode) {
            initialMode = true;
        }

        // add or remove the dark class from the html tags
        if (initialMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Set the state to ensure the button icon and aria-label are correct
        setDarkMode(initialMode);

        // Save theme mode choice to localStorage
        localStorage.setItem('darkMode', String(initialMode));
    }, []);


    // toggle dark mode
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


    // logout the user
    const logout = async () => {
        try {
            const userEmail = authState.user?.email;

            // clear auth state and local storage
            setAuthState({ user: null, accessToken: null });
            localStorage.removeItem('authState');

            // invalidate refresh session with the api call
            if (userEmail) {
                await backendLogout(userEmail);
            }

            // clear refresh token from cookies
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


    // every time when authState changes run this
    useEffect(() => {
        // save auth state to localStorage if user is logged in if logged out then remove
        if (authState.accessToken && authState.user) {
            localStorage.setItem('authState', JSON.stringify(authState));
        } else {
            localStorage.removeItem('authState');
        }
    }, [authState]); // that's the dependency, that's detect when authState changes and run the useEffect

    const refreshUserData = async () => {
        try {
            const data = await refreshToken();
            setAuthState({
                user: data.user,
                accessToken: data.accessToken
            });
        } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
        }
    };


    // every time when authState token is changes run this
    // interceptor = every HTTP request before it is sent and every HTTP response after it is received
    useEffect(() => {
        // setup interceptor before every request (it's the base form for every api request in every service file)
        const requestInterceptor = axios.interceptors.request.use(
            (config) => { // config is the request object (what we're sending to the server URL, headers, body, etc.)
                if (authState.accessToken) { // if user have a token
                    config.headers.Authorization = `Bearer ${authState.accessToken}`; // attach the token to the request headers
                }
                config.withCredentials = true; // allow cookies to be sent with the request
                return config;
            },
            (error) => Promise.reject(error)
        );

        // setup interceptor after every response
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response, // if the request is successful, return the response
            async (error) => { // if the request fails then do special handling (like refresh the token if it's expired based on the error code)
                const originalRequest = error.config;

                // if the token is missing or invalid, don't retry
                const noRefreshTokenError = error.response?.data?.code === "NO_REFRESH_TOKEN";
                const invalidRefreshTokenError = error.response?.data?.code === "INVALID_REFRESH_TOKEN";

                // if there are no refresh token or the session id in invalid then don't trigger to try again just log out immediately
                if (noRefreshTokenError || invalidRefreshTokenError) {
                    await logout();
                    return Promise.reject(error);
                }

                // these error codes mean the token is expired, need to refresh if possible
                const isTokenError = error.response?.status === 401 || error.response?.status === 403;

                // check if we have already tried to refresh the token
                const hasNotRetried = !originalRequest._retry;

                // if the token is expired, and we haven't tried to refresh yet, then try to refresh
                if (isTokenError && hasNotRetried) {
                    originalRequest._retry = true; // set _retry to true to avoid infinite loop of retries

                    try {
                        // refresh the token on the backend
                        const data = await refreshToken();
                        console.log("refresh token successfully");

                        // Update auth state with new token
                        setAuthState({
                            user: data.user,
                            accessToken: data.accessToken
                        });

                        // prepare the original request with the new, refreshed token
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

                // reject the error if it's not a token error
                return Promise.reject(error);
            }
        );

        // clean up the interceptors when the component unmounts (when it's removed from the UI) to avoid memory leaks
        // forexample when navigate away fro ma component that use this useEffect React will clean up the interceptors
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [authState.accessToken]);

    // Show loading screen while authentication is being checked
    if (isLoading) {
        return (
            <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 ${darkMode ? 'dark' : ''}`}>
                {showColdStartMessage ? (
                    // Cold start message after 10 seconds
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">Server Waking Up</h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300">
                                Our free hosting service is spinning up the server. This usually takes about 1-2 minutes after periods of inactivity.
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mt-4">
                                Please wait a bit longer while we get everything ready for you.
                            </p>
                        </div>

                        {/* Loading spinner */}
                        <div className="flex justify-center my-8">
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
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                </div>
                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
                            </div>
                        </div>

                        {/* Progress bar similar to original */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-6 mb-8">
                            <div
                                className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full animate-pulse"
                                style={{ width: '70%' }}
                            />
                        </div>

                        <div className="flex flex-col gap-6 mt-8">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    While you wait, feel free to connect with me:
                                </h3>

                                <div className="flex justify-center gap-6 flex-wrap">
                                    <a href="https://www.linkedin.com/in/zalanfarkas/" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        <FaLinkedin className="text-2xl" /> LinkedIn
                                    </a>
                                    <a href="https://github.com/FarkasZalan" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        <FaGithub className="text-2xl" /> GitHub
                                    </a>
                                    <a href="mailto:farkaszalan2001@gmail.com"
                                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        <FaEnvelope className="text-2xl" /> Email
                                    </a>
                                    <a href="https://www.zalan-farkas.xyz/" target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        <FaGlobe className="text-2xl" /> Website
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center flex flex-col items-center gap-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Taking longer than expected?
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 cursor-pointer bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Check Again
                            </button>
                        </div>
                    </div>
                ) : (
                    // Original loading screen
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
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
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
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Taking longer than expected? {' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                                >
                                    Return to login
                                </button>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Define the context value, in this object holds every data and functions that will be available to any child components that consue the AuthProvider
    const value = {
        authState,
        setAuthState,
        isAuthenticated,
        logout,
        darkMode,
        toggleDarkMode,
        refreshUserData
    };

    // AuthCOntext.Provider is a React component that makes the context available to its children components that wrap inside the Provider component
    // I use this only in the app.tsx, which is the root component so every component in the app will have access to the context provider
    return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>;
}