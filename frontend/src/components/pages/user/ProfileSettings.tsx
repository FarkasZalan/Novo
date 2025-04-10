import { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaSave, FaTimes, FaGoogle, FaGithub } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config/apiURL";
import { useAuth } from "../../../context/AuthContext";

export const ProfileSettings = () => {
    const { authState, setAuthState } = useAuth();
    const user = authState.user;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOAuthUser, setIsOAuthUser] = useState(false);

    useEffect(() => {
        if (user) {
            // Check if user is an OAuth user (Google/GitHub)
            const oAuthUser = user.provider === 'google' || user.provider === 'github';
            setIsOAuthUser(oAuthUser);

            // Disable password fields for OAuth users
            if (oAuthUser) {
                setFormData(prev => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                }));
            }
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isOAuthUser && (e.target.name === 'currentPassword' ||
            e.target.name === 'newPassword' ||
            e.target.name === 'confirmPassword')) {
            return; // Ignore password changes for OAuth users
        }

        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const updateData: any = {
                name: formData.name,
                email: formData.email
            };
            // Block password updates for OAuth users
            if (isOAuthUser && (formData.currentPassword || formData.newPassword || formData.confirmPassword)) {
                throw new Error("Password cannot be changed for OAuth accounts");
            }

            // Validate inputs for non-OAuth users
            if (!isOAuthUser) {
                if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
                    throw new Error("New passwords don't match");
                }

                if (formData.newPassword && !formData.currentPassword) {
                    throw new Error("Current password is required to change password");
                }

                updateData.password = formData.newPassword;
                updateData.currentPassword = formData.currentPassword;
            }

            // Update profile info only
            const profileResponse = await axios.put(
                `${API_URL}/user/update`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${authState.accessToken}`
                    },
                    withCredentials: true // Important for cookies
                }
            );

            // Update auth state
            setAuthState({
                ...authState,
                user: profileResponse.data.data
            });

            setSuccess("Profile updated successfully!");
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            }));

        } catch (err: any) {
            let errorMessage = "Update failed";

            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    // The axios interceptor should have already tried to refresh the token
                    // If we still get an error, it means the refresh failed
                    errorMessage = "Session expired. Please try again.";
                } else if (err.response.data.message === "Current password is incorrect") {
                    errorMessage = "The current password you entered is incorrect";
                    const currentPasswordField = document.getElementById("currentPassword");
                    if (currentPasswordField) currentPasswordField.focus();
                } else {
                    errorMessage = err.response.data.message || errorMessage;
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Manage your account information and security settings
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="John Carter"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {isOAuthUser && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center text-blue-700 dark:text-blue-300">
                                    {user?.provider === 'google' && <FaGoogle className="mr-2" />}
                                    {user?.provider === 'github' && <FaGithub className="mr-2" />}
                                    <span>
                                        You're signed in with a {user?.provider} account. Password changes are not allowed for OAuth accounts.
                                    </span>
                                </div>
                            </div>
                        )}

                        {!isOAuthUser && (
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Change Password
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type="password"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                className={`block w-full pl-10 pr-3 py-3 border ${error.includes("current password")
                                                    ? "border-red-500 dark:border-red-400"
                                                    : "border-gray-300 dark:border-gray-600"
                                                    } rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {error.includes("current password") && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {error}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaLock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center cursor-pointer"
                            >
                                <FaTimes className="mr-2" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors flex items-center ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FaSave className="mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};