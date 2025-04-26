import { useEffect, useState } from 'react';
import { refreshToken } from '../services/authService';
import { useAuth } from './useAuth';

// intilaize the user's authentication state when the app first loads, try to restore the user session (use in AuthProvider.tsx)
export const useAuthInitializer = (
    setAuthState: (authState: AuthState) => void
) => {
    const [isLoading, setIsLoading] = useState(true); // create a loading state until initialization is complete
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

                    // Then try to refresh the token on the backend
                    try {
                        const data = await refreshToken();

                        // if refresh succeeds, set the auth state with the refreshed data
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
                        // Check if the error is due to an expired or invalid refresh token
                        if ((refreshError as any).status === 403) {
                            // If the refresh token is expired or invalid, we need to logout
                            await logout();
                        } else {
                            // For other errors, keep using the stored credentials
                            console.error("Network error during initialization:", refreshError);
                        }
                    }
                } else {
                    // No stored credentials in the localStorage, try fresh refresh (maybe user have refresh token in cookies)
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

    return isLoading; // return the loading state (true/false) depending on whether initialization is complete so until display the loading screen
};
