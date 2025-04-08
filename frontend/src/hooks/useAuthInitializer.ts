import { useEffect, useState } from 'react';
import { refreshToken } from '../services/authService';
import { useAuth } from '../context/AuthContext';

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
                    setAuthState(parsed);

                    // Then try to refresh in background
                    try {
                        const { data } = await refreshToken();
                        setAuthState({
                            user: data.user,
                            accessToken: data.accessToken
                        });
                    } catch (refreshError) {
                        console.log('Token refresh failed, using stored credentials:', refreshError);
                        // Don't logout here - use the stored credentials
                    }
                } else {
                    // No stored credentials, try fresh refresh
                    const { data } = await refreshToken();
                    setAuthState({
                        user: data.user,
                        accessToken: data.accessToken
                    });
                }
            } catch (err) {
                await logout();
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [setAuthState]);

    return isLoading;
};
