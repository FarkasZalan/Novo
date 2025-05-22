import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchAllProjectLogForUser = async (token: string) => {
    try {
        const response = await axios.get(`${API_URL}/project-logs`, {
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