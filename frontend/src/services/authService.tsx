import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // backend URL

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

export const refreshToken = async () => {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
        withCredentials: true
    });
    return response.data;
};

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