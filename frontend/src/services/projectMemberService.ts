import axios from 'axios';
import { API_URL } from '../config/apiURL';

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