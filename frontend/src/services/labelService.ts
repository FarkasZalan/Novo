import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const createLabel = async (projectId: string, token: string, name: string, description: string, color: string) => {
    try {
        const response = await axios.post(`${API_URL}/project/${projectId}/label/new`, {
            name,
            description,
            color
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error creating label:", error);
        throw error;
    }
};

export const updateLabel = async (projectId: string, token: string, labelId: string, name: string, description: string, color: string) => {
    try {
        const response = await axios.put(`${API_URL}/project/${projectId}/label/${labelId}/update`, {
            name,
            description,
            color
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error updating label:", error);
        throw error;
    }
};

export const deleteLabel = async (projectId: string, token: string, labelId: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}/label/${labelId}/delete`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error deleting label:", error);
        throw error;
    }
}

export const getAllLabelForProject = async (projectId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/labels`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error getting labels:", error);
        throw error;
    }
}

export const getAllLabelForTask = async (projectId: string, token: string, taskId: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/task/${taskId}/labels`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error getting labels for task:", error);
        throw error;
    }
}

