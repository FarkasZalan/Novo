// handle auth API requests
import axios from 'axios';
import { API_URL } from '../config/apiURL';

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

// OAuth functions
export const initiateGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
};

export const initiateGithubLogin = () => {
    window.location.href = `${API_URL}/auth/github`;
};

export const handleOAuthCallback = async (token: string, userId: string) => {
    try {
        const response = await axios.get(`${API_URL}/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`  // Set as Bearer token
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
        console.error("OAuth state fetch error:", error);
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