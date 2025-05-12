import axios from 'axios';
import ProjectMember from '../types/projectMember';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchAssignmentsForTask = async (projectId: string, taskId: string, token: string) => {
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
            {},  // Empty body but needs to be included for axios post
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


export const addAssignmentForUsers = async (projectId: string, taskId: string, users: ProjectMember[], token: string) => {
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


export const deleteAssignmentMyself = async (projectId: string, taskId: string, user_id: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}/task/${taskId}/assign-myself`,
            {
                data: { user_id },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting project file:", error);
        throw error;
    }
}

// when an admin/owner want to delete other members wo assigned the task from tha assignment
export const deleteOtherUserAssignment = async (projectId: string, taskId: string, user_id: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}/task/${taskId}/assign-users`,
            {
                data: { user_id },
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