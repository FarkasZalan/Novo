import { useEffect, useState } from 'react';
import { refreshToken } from '../services/authService';
import { useAuth } from '../context/AuthContext';

// Custom hook to initialize authentication state when the app loads
// checks for stored authentication data in localStorage
// if found, it sets the auth state and tries to refresh the token in the background
// if not found, it tries to refresh the access token and sets the auth state
// if refresh fails, it logs out
export const useAuthInitializer = (
    setAuthState: (authState: AuthState) => void
) => {
    const [isLoading, setIsLoading] = useState(true);
    const { logout } = useAuth();

    useEffect(() => {
        const init = async () => {
            try {
                // First try to load from localStorage
                const stored = localStorage.getItem('authState');
                if (stored) {
                    const parsed = JSON.parse(stored);

                    // Set the auth state from localStorage first
                    setAuthState(parsed);

                    // Then try to refresh in background
                    try {
                        const data = await refreshToken();

                        // Update the auth state with the refreshed data
                        setAuthState({
                            user: data.user,
                            accessToken: data.accessToken
                        });

                        // Update localStorage with the refreshed data
                        localStorage.setItem('authState', JSON.stringify({
                            user: data.user,
                            accessToken: data.accessToken
                        }));
                    } catch (refreshError) {
                        console.error('Token refresh failed during initialization:', refreshError);
                        // Check if the error is due to an expired refresh token
                        if ((refreshError as any).status === 403) {
                            // If the refresh token is expired, we need to logout
                            await logout();
                        } else {
                            // For other errors, keep using the stored credentials
                            console.log("Using stored credentials despite refresh failure");
                        }
                    }
                } else {
                    // No stored credentials, try fresh refresh
                    try {
                        const data = await refreshToken();

                        // Set the auth state with the refreshed data
                        setAuthState({
                            user: data.user,
                            accessToken: data.accessToken
                        });

                        // Update localStorage with the refreshed data
                        localStorage.setItem('authState', JSON.stringify({
                            user: data.user,
                            accessToken: data.accessToken
                        }));
                    } catch (refreshError) {
                        console.error('Fresh refresh failed during initialization:', refreshError);
                        // If no stored credentials and refresh fails, we need to logout
                        await logout();
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                await logout();
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [setAuthState, logout]);

    return isLoading;
};
