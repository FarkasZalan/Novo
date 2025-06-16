// handle auth API requests
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// basic auth functions
export const register = async (name: string, email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
    });
    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
    }, {
        withCredentials: true // Important for cookies
    });
    return response.data;
};

export const logout = async (email: string) => {
    const response = await axios.post(`${API_URL}/auth/logout`, {
        email
    }, {
        withCredentials: true // Important for cookie handling
    });
    return response.data;
};

// refresh access token request
export const refreshToken = async () => {
    try {
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
            withCredentials: true, // Important for cookies
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response has the expected structure
        if (!response.data || !response.data.accessToken || !response.data.user) {
            console.error("Invalid refresh token response structure:", response.data);
            throw new Error("Invalid refresh token response");
        }

        // Return the response data directly
        return response.data;
    } catch (error: any) {
        console.error('Refresh token error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            cookies: document.cookie
        });

        // error object
        const enhancedError = new Error(error.response?.data?.message || error.message || 'Failed to refresh token');
        enhancedError.name = 'TokenRefreshError';
        (enhancedError as any).status = error.response?.status;
        (enhancedError as any).originalError = error;

        throw enhancedError;
    }
};

export const verifyEmail = async (token: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/verify-email`, {
            token
        });
        return response.data;
    } catch (error) {
        console.error("Email verification error:", error);
        throw error;
    }
};

export const resendVerificationEmail = async (email: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/resend-verification`, {
            email
        });
        return response.data;
    } catch (error) {
        console.error("Resend verification error:", error);
        throw error;
    }
};

// OAuth functions
export const initiateGoogleLogin = (): Promise<{ success: boolean, accessToken?: string, user?: any, error?: string }> => {
    return new Promise((resolve, reject) => {
        // Check if popups are blocked
        const popup = window.open(
            `${API_URL}/auth/google`,
            'google-auth',
            'width=600,height=700,scrollbars=yes,resizable=yes,top=100,left=100'
        );

        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            reject(new Error('Popup blocked. Please allow popups and try again.'));
            return;
        }

        let messageReceived = false;
        let checkClosedInterval: NodeJS.Timeout;

        const messageListener = (event: MessageEvent) => {
            // Accept messages from any origin for OAuth callback

            if (event.data && typeof event.data === 'object' && 'success' in event.data) {
                messageReceived = true;

                const { success, accessToken, user, error } = event.data;

                if (success && accessToken && user) {
                    resolve({ success: true, accessToken, user });
                } else {
                    resolve({ success: false, error: error || 'Authentication failed' });
                }

                cleanup();
            }
        };

        const cleanup = () => {
            window.removeEventListener('message', messageListener);
            if (checkClosedInterval) {
                clearInterval(checkClosedInterval);
            }
            if (popup && !popup.closed) {
                popup.close();
            }
        };

        window.addEventListener('message', messageListener);

        // Check if popup is closed manually
        checkClosedInterval = setInterval(() => {
            if (popup.closed) {
                if (!messageReceived) {
                    reject(new Error('Authentication was cancelled by user'));
                }
                cleanup();
            }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
            if (!messageReceived) {
                reject(new Error('Authentication timeout'));
                cleanup();
            }
        }, 5 * 60 * 1000);
    });
};

export const initiateGithubLogin = (): Promise<{ success: boolean, accessToken?: string, user?: any, error?: string }> => {
    return new Promise((resolve, reject) => {
        // Check if popups are blocked
        const popup = window.open(
            `${API_URL}/auth/github`,
            'github-auth',
            'width=600,height=700,scrollbars=yes,resizable=yes,top=100,left=100'
        );

        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            reject(new Error('Popup blocked. Please allow popups and try again.'));
            return;
        }

        let messageReceived = false;
        let checkClosedInterval: NodeJS.Timeout;

        const messageListener = (event: MessageEvent) => {
            // Accept messages from any origin for OAuth callback

            if (event.data && typeof event.data === 'object' && 'success' in event.data) {
                messageReceived = true;

                const { success, accessToken, user, error } = event.data;

                if (success && accessToken && user) {
                    resolve({ success: true, accessToken, user });
                } else {
                    resolve({ success: false, error: error || 'Authentication failed' });
                }

                cleanup();
            }
        };

        const cleanup = () => {
            window.removeEventListener('message', messageListener);
            if (checkClosedInterval) {
                clearInterval(checkClosedInterval);
            }
            if (popup && !popup.closed) {
                popup.close();
            }
        };

        window.addEventListener('message', messageListener);

        // Check if popup is closed manually
        checkClosedInterval = setInterval(() => {
            if (popup.closed) {
                if (!messageReceived) {
                    reject(new Error('Authentication was cancelled by user'));
                }
                cleanup();
            }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
            if (!messageReceived) {
                reject(new Error('Authentication timeout'));
                cleanup();
            }
        }, 5 * 60 * 1000);
    });
};

export const handleOAuthCallback = async (token: string, userId: string) => {
    try {
        const response = await axios.get(`${API_URL}/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}` // Set as Bearer token
            },
            withCredentials: true
        });
        return {
            data: {
                user: response.data.data,
                accessToken: token
            }
        };
    } catch (error) {
        console.error("OAuth callback handling error:", error);
        throw error;
    }
};

// Fetch OAuth state data (access token, user) from the backend
export const fetchOAuthState = async (stateToken: string) => {
    try {
        const response = await axios.get(`${API_URL}/auth/oauth-state`, {
            params: { state: stateToken },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Password reset functions
export const requestPasswordReset = async (email: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/forgot-password`, {
            email
        });
        return response.data;
    } catch (error) {
        console.error("Password reset request error:", error);
        throw error;
    }
};

export const verifyResetPasswordToken = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/auth/verify-reset-token/${token}`);
        return response.data;
    } catch (error) {
        console.error("Token verification error:", error);
        throw error;
    }
};

export const resetPassword = async (email: string, token: string, newPassword: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/reset-password`, {
            email,
            token,
            newPassword
        });
        return response.data;
    } catch (error) {
        console.error("Password reset error:", error);
        throw error;
    }
};