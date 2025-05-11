import axios from 'axios';
import { API_URL } from '../config/apiURL';


export const createComment = async (comment: string, taskId: string, projectId: string, author_id: string, token: string) => {
    try {
        const response = await axios.post(`${API_URL}/project/${projectId}/task/${taskId}/comment/new`, {
            comment,
            author_id
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
        return response.data.data;
    } catch (error) {
        console.error("Error creating comment:", error);
        throw error;
    }
};

export const getAllCommentsForTask = async (projectId: string, taskId: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project/${projectId}/task/${taskId}/comments`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error getting comments for task:", error);
        throw error;
    }
}

export const updateComment = async (comment: string, commentId: string, projectId: string, taskId: string, token: string) => {
    try {
        const response = await axios.put(`${API_URL}/project/${projectId}/task/${taskId}/comment/update`, {
            comment,
            commentId
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response.data);
        return response.data.data;
    } catch (error) {
        console.error("Error updating comment:", error);
        throw error;
    }
}

export const deleteComment = async (projectId: string, taskId: string, commentId: string, token: string) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${projectId}/task/${taskId}/comment/delete`, {
            data: { commentId },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
    }
}