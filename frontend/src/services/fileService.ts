import axios from 'axios';
import { API_URL } from '../config/apiURL';

// project files services
export const fetchProjectFiles = async (projectId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/files`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project files:", error);
        throw error;
    }
};

export const uploadProjectFile = async (projectId: string, token: string, file: File, uploaded_by: string) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploaded_by', uploaded_by);

        const response = await axios.post(`${API_URL}/project/${projectId}/files`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            }
        });

        return response.data.data;
    } catch (error) {
        console.error("Error creating project file:", error);
        throw error;
    }
};

export const downloadProjectFile = async (fileId: string, procejtId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${procejtId}/files/${fileId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            responseType: 'blob'
        });

        return response.data;
    } catch (error) {
        console.error("Error downloading file:", error);
        throw error;
    }
}

export const deleteProjectFile = async (projectId: string, fileId: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}/files/${fileId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting project file:", error);
        throw error;
    }
}

// task files services
export const fetcTaskFiles = async (projectId: string, taskId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/task/${taskId}/files`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project files:", error);
        throw error;
    }
};

export const uploadTaskFile = async (projectId: string, taskId: string, token: string, file: File, uploaded_by: string) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploaded_by', uploaded_by);
        formData.append('task_id', taskId);

        const response = await axios.post(`${API_URL}/project/${projectId}/task/${taskId}/files`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            }
        });

        return response.data.data;
    } catch (error) {
        console.error("Error creating project file:", error);
        throw error;
    }
};

export const downloadTaskFile = async (fileId: string, procejtId: string, taskId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${procejtId}/task/${taskId}/files/${fileId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            responseType: 'blob'
        });

        return response.data;
    } catch (error) {
        console.error("Error downloading file:", error);
        throw error;
    }
}

export const deletetaskFile = async (projectId: string, taskId: string, fileId: string, token: string) => {
    try {
        console.log(projectId, taskId, fileId, token)
        const response = await axios.delete(`${API_URL}/project/${projectId}/task/${taskId}/files/${fileId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting project file:", error);
        throw error;
    }
}