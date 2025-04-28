import axios from 'axios';
import { API_URL } from '../config/apiURL';

export const fetcAssignmentsForTask = async (projectId: string, taskId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/task/${taskId}/assignments`, {
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

export const addAssignmentForMyself = async (projectId: string, taskId: string, token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/project/${projectId}/task/${taskId}/assign-myself`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error adding members:", error);
        throw error;
    }
};


export const addAssignmentForUsers = async (projectId: string, taskId: string, users: Array<{ id: string }>, token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/project/${projectId}/task/${taskId}/assign-users`,
            { users },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error adding members:", error);
        throw error;
    }
};


export const deleteAssignmentMyself = async (projectId: string, taskId: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}/task/${taskId}/assign-myself`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting project file:", error);
        throw error;
    }
}

// when an admin/owner want to delete other members wo assigned the task from tha assignment
export const deleteOtherAssignment = async (projectId: string, taskId: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}/task/${taskId}/assign-users`, {
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