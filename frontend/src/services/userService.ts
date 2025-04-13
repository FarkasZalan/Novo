import axios from "axios";
import { API_URL } from "../config/apiURL";

export const deleteAccount = async (accessToken: string) => {
    await axios.delete(`${API_URL}/user/delete`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        withCredentials: true
    });
}

export const updateUser = async (updateData: any, accessToken: string) => {
    try {
        const response = await axios.put(
            `${API_URL}/user/update`,
            updateData, // Send data directly, no wrapping
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    // Add any other headers your original request had
                },
                withCredentials: true // This is likely what was missing!
            }
        );
        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update profile');
        }
        throw new Error('Failed to update profile');
    }
};

export const fetchAllRegisteredUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching registered users:", error);
        throw error;
    }
}