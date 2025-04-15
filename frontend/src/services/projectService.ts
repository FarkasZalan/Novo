import axios from 'axios';
import { API_URL } from '../config/apiURL';

export const fetchProjects = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/projects`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data.map((project: any) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            total_tasks: project.total_tasks,
            completed_tasks: project.completed_tasks,
            status: project.status,
            progress: (project.completed_tasks / project.total_tasks) * 100 || 0, // Calculate progress
            members: 1 // You can modify this to fetch actual member count if needed
        }));
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

export const addMembersToProject = async (projectId: string, users: Array<{ id: string, email: string; name: string, role: "member" | "admin"; }>, token: string) => {
    try {
        // Transform the data to match with the backend API
        const payload = users.map(user => ({
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }));

        const response = await axios.post(
            `${API_URL}/project/${projectId}/add-members`,
            { users: payload },
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

export const getProjectMembers = async (projectId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/members`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project members:", error);
        throw error;
    }
};

export const deleteMemberFromProject = async (projectId: string, userId: string, currentUserId: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}/members`,
            {
                data: { userId, currentUserId },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting project member:", error);
        throw error;
    }
};