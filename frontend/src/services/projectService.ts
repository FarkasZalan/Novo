import axios from 'axios';
import { API_URL } from '../config/apiURL';

export const fetchProjects = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/projects`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.data
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
    }
};

export const createProject = async (name: string, description: string, ownerId: string, token: string) => {
    try {
        const response = await axios.post(`${API_URL}/project/new`, {
            name,
            description,
            ownerId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
};

export const fetchProjectById = async (projectId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        // because response has a data object that includes the response attachment that called 'data' and that contains the project object
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project by ID:", error);
        throw error;
    }
};

export const updateProject = async (projectId: string, name: string, description: string, ownerId: string, token: string) => {
    try {
        const response = await axios.put(`${API_URL}/project/${projectId}`, {
            name,
            description,
            ownerId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating project:", error);
        throw error;
    }
};

export const deleteProject = async (projectId: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting project:", error);
        throw error;
    }
};