import axios from 'axios';
import { API_URL } from '../config/apiURL';

export const fetchProjects = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/projects`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
        return response.data.data.map((project: any) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            total_tasks: project.total_tasks,
            owner_id: project.owner_id,
            completed_tasks: project.completed_tasks,
            status: project.status,
            progress: project.total_tasks ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0,
            members: project.memberCount
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

export const addMembersToProject = async (projectId: string, users: Array<{ id: string, email: string; name: string, role: "member" | "admin"; }>, token: string, currentUserId: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/project/${projectId}/add-members`,
            { users, currentUserId },
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

export const resendProjectInvite = async (projectId: string, inviteUserId: string, currentUserId: string, token: string) => {
    try {
        const response = await axios.post(
            `${API_URL}/project/${projectId}/members/re-invite`,
            {
                data: { inviteUserId, currentUserId },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error resending project invite:", error);
        throw error;
    }
}

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

export const updateProjectMemberRole = async (projectId: string, userId: string, currentUserId: string, role: string, token: string) => {
    try {
        const response = await axios.put(`${API_URL}/project/${projectId}/members/`,
            {
                data: { userId, currentUserId, role },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating project member role:", error);
        throw error;
    }
}

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

export const leaveProject = async (projectId: string, userId: string, currentUserId: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}/members/leave`,
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