import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchAllTasksForProject = async (projectId: string, token: string, order_by: string, order: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/tasks`, {
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
        console.error("Error fetching tasks:", error);
        throw error;
    }
};

export const fetchAllTasksForProjectWithNoParent = async (projectId: string, token: string, order_by: string, order: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/tasks-with-no-parent`, {
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
        console.error("Error fetching tasks:", error);
        throw error;
    }
};

export const createTask = async (projectId: string, token: string, title: string, description: string, due_date?: Date, priority?: string, status: string = 'not-started', labels: Label[] = [], parent_task_id?: string) => {
    try {
        const response = await axios.post(`${API_URL}/project/${projectId}/tasks/new`, {
            title,
            description,
            due_date,
            priority,
            status,
            labels,
            parent_task_id
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.data;
    } catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
};

export const fetchTask = async (taskId: string, projectId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/task/${taskId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching task:", error);
        throw error;
    }
}

export const updateTask = async (taskId: string, procejt_Id: string, token: string, title: string, description: string, due_date?: Date, priority?: string, status?: string, labels?: Label[], parent_task_id?: string) => {
    try {
        const response = await axios.put(`${API_URL}/project/${procejt_Id}/task/${taskId}`, {
            title,
            description,
            due_date,
            priority,
            status,
            labels,
            parent_task_id
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.data;
    } catch (error) {
        console.error("Error updating task:", error);
        throw error;
    }
};

export const updateTaskStatus = async (taskId: string, projectId: string, token: string, status: string) => {
    try {
        const response = await axios.put(`${API_URL}/project/${projectId}/task/${taskId}/status`, {
            status
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating task status:", error);
        throw error;
    }
}

export const fetchAllTasksCount = async (projectId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/task-counts`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching task counts:", error);
        throw error;
    }
};

export const deleteTask = async (taskId: string, projectId: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}/task/${taskId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
    }
};