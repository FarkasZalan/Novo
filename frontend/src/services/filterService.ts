import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchAllFilteredLogForUser = async (token: string, tables: string[] = [], limit: number = 20) => {
    try {
        const response = await axios.get(`${API_URL}/all-filtered-logs`, {
            params: {
                tables: tables,
                limit: limit
            },
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

export const filterAllUserByNameOrEmail = async (token: string, projectId: string, nameOrEmail: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/all-user-filter`, {
            params: {
                nameOrEmail: nameOrEmail
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project logs:", error);
        throw error;
    }
}

export const filterAllUnassignedTaskByTitleForMilestone = async (projectId: string, token: string, title: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/unassigned-tasks-filter`, {
            params: {
                title: title
            },
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

export const filterAllTaskByTitleForMilestone = async (milestoneId: string, projectId: string, token: string, title: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/milestone/${milestoneId}/all-task-filter`, {
            params: {
                title: title
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