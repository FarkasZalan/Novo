import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaCog, FaCalendarAlt, FaSignOutAlt, FaTasks, FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import axios from "axios";
import { API_URL } from "../../../config/apiURL";

export const Profile = () => {
    const { authState, logout } = useAuth();
    const user = authState.user;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleLogout = async () => {
        await logout();
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        setDeleteError("");

        try {
            await axios.delete(`${API_URL}/user/delete`, {
                headers: {
                    Authorization: `Bearer ${authState.accessToken}`
                }
            });

            await logout();
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Account deletion failed";
            setDeleteError(errorMessage);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Profile Header */}
            <section className="py-16 bg-indigo-600 text-white dark:bg-indigo-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="h-24 w-24 rounded-full bg-indigo-400 dark:bg-indigo-700 flex items-center justify-center text-4xl font-bold">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{user?.name || 'User'}</h1>
                                <p className="text-indigo-100 dark:text-indigo-300 mt-1">{user?.email || 'user@example.com'}</p>
                                <div className="flex items-center mt-2 text-indigo-200 dark:text-indigo-400">
                                    <FaCalendarAlt className="mr-1" />
                                    <span>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <Link
                            to="/profile-settings"
                            className="mt-4 md:mt-0 px-6 py-3 bg-white text-indigo-600 dark:bg-indigo-800 dark:text-white rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-indigo-700 transition-colors flex items-center"
                        >
                            <FaCog className="mr-2" />
                            Edit Profile
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column - User Info */}
                        <div className="md:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <FaUser className="text-indigo-600 dark:text-indigo-400 mr-2" />
                                    Personal Information
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                                        <p className="text-gray-900 dark:text-white font-medium">{user?.name || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                                        <p className="text-gray-900 dark:text-white font-medium">{user?.email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Account Type</p>
                                        <p className="text-gray-900 dark:text-white font-medium">Premium Member</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Activities and Actions */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Recent Activity */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 mr-4">
                                            <FaTasks />
                                        </div>
                                        <div>
                                            <p className="text-gray-900 dark:text-white">Created new project "Website Redesign"</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 mr-4">
                                            <FaEnvelope />
                                        </div>
                                        <div>
                                            <p className="text-gray-900 dark:text-white">Received message from team member</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">1 day ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Actions */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account Actions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Link
                                        to="/profile-settings/password"
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <h3 className="font-medium text-gray-900 dark:text-white">Change Password</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your account password</p>
                                    </Link>
                                    <Link
                                        to="/settings/notifications"
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <h3 className="font-medium text-gray-900 dark:text-white">Notification Settings</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your email preferences</p>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left cursor-pointer"
                                    >
                                        <div className="flex items-center text-red-600 dark:text-red-400">
                                            <FaSignOutAlt className="mr-2" />
                                            <h3 className="font-medium">Sign Out</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Log out of your account</p>
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-red-200 dark:border-red-900">
                                <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center">
                                    <FaExclamationTriangle className="mr-2" />
                                    Danger Zone
                                </h2>

                                {!showDeleteConfirm ? (
                                    <>
                                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                                            Deleting your account will permanently remove all your data. This action cannot be undone.
                                        </p>
                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center cursor-pointer"
                                        >
                                            <FaTrash className="mr-2" />
                                            Delete Account
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                                            Are you sure you want to delete your account? All your data will be permanently removed.
                                        </p>

                                        {deleteError && (
                                            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-sm">
                                                {deleteError}
                                            </div>
                                        )}

                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={deleteLoading}
                                                className={`px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center cursor-pointer ${deleteLoading ? "opacity-70 cursor-not-allowed" : ""
                                                    }`}
                                            >
                                                {deleteLoading ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Deleting...
                                                    </span>
                                                ) : (
                                                    <>
                                                        <FaTrash className="mr-2" />
                                                        Confirm Delete
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};