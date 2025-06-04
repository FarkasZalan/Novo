import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchDashboardLogForUser = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/dashboard-logs`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data.data);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project logs:", error);
        throw error;
    }
};

export const fetchProjectLog = async (token: string, projectId: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/logs`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project logs:", error);
        throw error;
    }
};

export const fetchTaskLog = async (token: string, projectId: string, taskId: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/task/${taskId}/logs`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project logs:", error);
        throw error;
    }
};

export const fetchCommentLog = async (token: string, projectId: string, taskId: string, commentId: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/task/${taskId}/comment/${commentId}/logs`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project logs:", error);
        throw error;
    }
};

export const fetchMilestoneLog = async (token: string, projectId: string, milestoneId: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/milestone/${milestoneId}/logs`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project logs:", error);
        throw error;
    }
};

export const fetchUserLog = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/user-logs`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project logs:", error);
        throw error;
    }
};