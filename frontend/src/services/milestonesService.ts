import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const createMilestone = async (projectId: string, token: string, name: string, description: string, due_date?: Date) => {
    try {
        const response = await axios.post(`${API_URL}/project/${projectId}/milestone/new`, {
            name,
            description,
            due_date
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error creating milestone:", error);
        throw error;
    }
};

export const getAllMilestonesForProject = async (projectId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/milestones`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching milestones:", error);
        throw error;
    }
}

export const addMilestoneToTask = async (milestoneId: string, projectId: string, taskIds: string[], token: string) => {
    try {
        const response = await axios.put(`${API_URL}/project/${projectId}/milestone/${milestoneId}/add`,
            { taskIds },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        return response.data.data;
    } catch (error) {
        console.error("Error adding milestone to task:", error);
        throw error;
    }
}

export const getAllTaskForMilestone = async (milestoneId: string, projectId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/milestone/${milestoneId}/tasks`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching tasks for milestone:", error);
        throw error;
    }
}

export const getAllTaskForMilestoneWithSubtasks = async (milestoneId: string, projectId: string, token: string, order_by: string, order: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/milestone/${milestoneId}/tasks-with-subtasks`, {
            params: {
                order_by: order_by,
                order: order
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching tasks for milestone:", error);
        throw error;
    }
}

export const getMilestoneById = async (milestoneId: string, projectId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/milestone/${milestoneId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching milestone:", error);
        throw error;
    }
}

export const getAllUnassignedTaskForMilestone = async (projectId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/milestone/tasks/unassigned`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching unassigned tasks for milestone:", error);
        throw error;
    }
}

export const deleteMilestoneFromTask = async (milestoneId: string, projectId: string, taskId: string, token: string) => {
    try {
        const response = await axios.put(`${API_URL}/project/${projectId}/milestone/${milestoneId}/remove`, { taskId }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error removing milestone from task:", error);
        throw error;
    }
}

export const updateMilestone = async (milestoneId: string, projectId: string, token: string, name: string, description: string, due_date?: Date) => {
    try {
        const response = await axios.put(`${API_URL}/project/${projectId}/milestone/${milestoneId}/update`, {
            name,
            description,
            due_date
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log(response.data);
        return response.data.data;
    } catch (error) {
        console.error("Error updating milestone:", error);
        throw error;
    }
}

export const deleteMilestone = async (milestoneId: string, projectId: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}/milestone/${milestoneId}/delete`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error deleting milestone:", error);
        throw error;
    }
}