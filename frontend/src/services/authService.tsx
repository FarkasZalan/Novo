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
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Refresh token error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            cookies: document.cookie
        });
        throw error;
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