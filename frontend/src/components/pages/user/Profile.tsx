import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaCog, FaCalendarAlt, FaSignOutAlt, FaExclamationTriangle, FaTrash, FaCrown, FaCheck, FaTimes, FaChevronLeft } from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";
import { useEffect, useState } from "react";
import { cancelPremiumPlan, createPayment, deleteAccount, reactivatePremiumPlan } from "../../../services/userService";
import { loadStripe } from '@stripe/stripe-js';
import toast from "react-hot-toast";
import { PremiumInfoDialog } from "./PremiumInfoDialog";
import { PremiumManagementModal } from "./PremiumManagementDialog";
import { UserLogsComponent } from "./UserLog";

export const Profile = () => {
    const { authState, logout, refreshUserData } = useAuth();
    const user = authState.user;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const navigate = useNavigate();

    //stripe checkout open loading
    const [paymentLoading, setPaymentLoading] = useState(false);

    // payment info dialog
    const [showPremiumDialog, setShowPremiumDialog] = useState(false);

    // premium management
    const [showPremiumManagement, setShowPremiumManagement] = useState(false);

    // reactivate payment payment info dialog
    const [showReActivatePremiumDialog, setShowReActivatePremiumDialog] = useState(false);

    const handleLogout = async () => {
        await logout();
    };

    const getUserInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== user?.email) {
            setDeleteError("Please type your email exactly to confirm deletion");
            return;
        }

        setDeleteLoading(true);
        setDeleteError("");

        try {
            await deleteAccount(authState.accessToken!);
            await logout();
        } catch (err: any) {
            console.error("Delete account error:", err);

            if (err.response?.status === 401) {
                setDeleteError("Session expired. Please try again.");
            } else if (err.response?.status === 403) {
                setDeleteError("Access denied. Your session may have expired. Please try logging out and back in.");
            } else {
                const errorMessage = err.response?.data?.message || "Account deletion failed";
                setDeleteError(errorMessage);
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleUpgradeToPremium = async () => {
        if (!authState.user || !authState.accessToken) return;
        setShowPremiumDialog(false);
        setPaymentLoading(true);

        try {
            const sessionId = await createPayment(
                authState.accessToken,
                authState.user.id,
                authState.user.email,
                authState.user.name
            );

            const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);
            if (!stripe) {
                console.log("Stripe failed to initialize");
            };

            if (stripe) {
                const { error } = await stripe.redirectToCheckout({
                    sessionId: sessionId
                });

                if (error) {
                    console.error("Error:", error);
                    toast.error("Failed to initiate payment");
                }
            }
        } catch (err: any) {
            console.error("Payment error:", err);
            toast.error("Failed to initiate payment");
        } finally {
            setPaymentLoading(false);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);

        if (query.get("payment_status") === "success") {
            toast.success("You have successfully upgraded to premium!");
        }
        navigate(location.pathname, { replace: true });
    }, []);

    const handleDowngradeSubscription = async () => {
        try {
            setPaymentLoading(true);
            await cancelPremiumPlan(authState.accessToken!, authState.user!.premium_session_id!);
            await refreshUserData();
            setShowPremiumManagement(false);
            toast.success("You have successfully downgraded your subscription");
        } catch (err) {
            toast.error("Failed to downgrade subscription");
            console.error(err);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleReActivatePremiumPlan = async () => {
        try {
            setShowPremiumManagement(false);
            setPaymentLoading(true);
            await reactivatePremiumPlan(authState.accessToken!, authState.user!.premium_session_id!);
            await refreshUserData();
            setShowPremiumManagement(false);
            toast.success("You have successfully reactivated your subscription");
        } catch (err) {
            toast.error("Failed to reactivate subscription");
            console.error(err);
        } finally {
            setPaymentLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Payment Loading Overlay */}
            {paymentLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm">
                    <div className="w-full max-w-sm text-center">
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                                        <svg
                                            className="animate-spin h-6 w-6 text-indigo-600 dark:text-indigo-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    </div>
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        Just a moment...
                                    </h3>
                                </div>

                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4">
                                    <div
                                        className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full animate-pulse"
                                        style={{ width: '70%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Header */}
            <section className="py-16 bg-indigo-600 dark:bg-indigo-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-4 md:space-x-6">
                            {/* Left arrow - hidden on mobile, visible on md and up */}
                            <div
                                className="hidden md:flex h-10 w-10 cursor-pointer rounded-full bg-indigo-500 dark:bg-indigo-700 items-center justify-center text-white shadow-md hover:bg-indigo-400 dark:hover:bg-indigo-600 transition-colors duration-200"
                                onClick={() => navigate('/', { replace: true })}
                            >
                                <FaChevronLeft className="text-xl" />
                            </div>

                            {/* Profile avatar */}
                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-indigo-500 dark:bg-indigo-700 flex items-center justify-center text-3xl md:text-4xl font-bold">
                                {getUserInitials(user?.name || user?.email.split('@')[0] || 'U')}
                            </div>

                            {/* User info */}
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">{user?.name || 'User'}</h1>
                                <p className="text-indigo-100 dark:text-indigo-200 mt-1 text-sm md:text-base">
                                    {user?.email || 'user@example.com'}
                                </p>
                                <div className="flex items-center mt-2 text-indigo-200 dark:text-indigo-300 text-sm md:text-base">
                                    <FaCalendarAlt className="mr-1" />
                                    <span>Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Edit Profile button */}
                        <Link
                            to="/profile-settings"
                            className="mt-4 md:mt-0 px-5 py-3 md:px-6 md:py-3 bg-white dark:bg-gray-100 text-indigo-600 dark:text-indigo-800 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors flex items-center text-md md:text-base"
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
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                                    <FaUser className="text-indigo-600 dark:text-indigo-400 mr-2" />
                                    Personal Information
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                                        <p className="text-gray-800 dark:text-gray-100 font-medium">{user?.name || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                                        <p className="text-gray-800 dark:text-gray-100 font-medium">{user?.email || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Account Type</p>
                                        <p className="text-gray-800 dark:text-gray-100 font-medium">
                                            {user?.is_premium ? (
                                                <span className="flex items-center text-yellow-500 dark:text-yellow-400">
                                                    <FaCrown className="mr-1" />
                                                    {user.user_cancelled_premium ? 'Premium (Ending Soon)' : 'Premium Member'}
                                                </span>
                                            ) : (
                                                "Free Member"
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Activities and Actions */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Membership Status */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                                    <FaCrown className="text-yellow-500 dark:text-yellow-400 mr-2" />
                                    Membership Status
                                </h2>
                                <div className="space-y-4">
                                    {/* Premium Cancellation Notice */}
                                    {user?.user_cancelled_premium && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-lg">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                        Premium Membership Ending Soon
                                                    </h3>
                                                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                                        <p>
                                                            Your premium access will continue until {new Date(user.premium_end_date).toLocaleDateString()}.
                                                            After this date, you'll revert to the free plan.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Free Plan */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
                                            <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">Free Plan</h3>
                                            <ul className="space-y-2">
                                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                    {user?.is_premium ? (
                                                        <FaTimes className="text-red-500 dark:text-red-400 mr-2" />
                                                    ) : (
                                                        <FaCheck className="text-green-500 dark:text-green-400 mr-2" />
                                                    )}
                                                    <span>Max 5 team members per project</span>
                                                </li>
                                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                    {user?.is_premium ? (
                                                        <FaTimes className="text-red-500 dark:text-red-400 mr-2" />
                                                    ) : (
                                                        <FaCheck className="text-green-500 dark:text-green-400 mr-2" />
                                                    )}
                                                    <span>Basic task management</span>
                                                </li>
                                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                    {user?.is_premium ? (
                                                        <FaTimes className="text-red-500 dark:text-red-400 mr-2" />
                                                    ) : (
                                                        <FaCheck className="text-green-500 dark:text-green-400 mr-2" />
                                                    )}
                                                    <span>Standard support</span>
                                                </li>
                                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                    <FaTimes className="text-red-500 dark:text-red-400 mr-2" />
                                                    <span>No email notifications</span>
                                                </li>
                                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                    <FaTimes className="text-red-500 dark:text-red-400 mr-2" />
                                                    <span>No due date reminders</span>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Premium Plan */}
                                        <div className={`border rounded-lg p-4 transition-colors duration-200 ${user?.user_cancelled_premium
                                            ? 'border-yellow-400 dark:border-yellow-500 bg-yellow-50/50 dark:bg-gray-700'
                                            : 'border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-gray-700'
                                            }`}>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-lg mb-2 text-yellow-600 dark:text-yellow-400">Premium Plan</h3>
                                                {user?.user_cancelled_premium && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                                                        Ending Soon
                                                    </span>
                                                )}
                                            </div>
                                            <ul className="space-y-2">
                                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                    <FaCheck className="text-green-500 dark:text-green-400 mr-2" />
                                                    <span>Unlimited team members per project</span>
                                                </li>
                                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                    <FaCheck className="text-green-500 dark:text-green-400 mr-2" />
                                                    <span>Advanced task management</span>
                                                </li>
                                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                    <FaCheck className="text-green-500 dark:text-green-400 mr-2" />
                                                    <span>Priority support</span>
                                                </li>
                                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                    <FaCheck className="text-green-500 dark:text-green-400 mr-2" />
                                                    <span>Email notifications for new comments</span>
                                                </li>
                                                <li className="flex items-center text-gray-700 dark:text-gray-300">
                                                    <FaCheck className="text-green-500 dark:text-green-400 mr-2" />
                                                    <span>Due date reminders (today/tomorrow)</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {user?.is_premium ? (
                                        <button
                                            className="w-full mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center cursor-pointer"
                                            onClick={() => setShowPremiumManagement(true)}
                                        >
                                            <FaCog className="mr-2" />
                                            {user.user_cancelled_premium ? 'Membership Ending Soon' : 'Manage Membership'}
                                        </button>
                                    ) : (
                                        <button
                                            className="w-full mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center cursor-pointer"
                                            onClick={() => setShowPremiumDialog(true)}
                                        >
                                            <FaCrown className="mr-2" />
                                            Upgrade to Premium - 2499 Huf/month
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h2>
                                <div className="space-y-4">
                                    <UserLogsComponent />
                                </div>
                            </div>

                            {/* Account Actions */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Account Actions</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Sign Out */}
                                    <button
                                        onClick={handleLogout}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left cursor-pointer"
                                    >
                                        <div className="flex items-center text-red-600 dark:text-red-400">
                                            <FaSignOutAlt className="mr-2" />
                                            <h3 className="font-medium">Sign Out</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Log out of your account</p>
                                    </button>

                                    {/* Manage Membership */}
                                    <button
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left cursor-pointer"
                                        onClick={() => user?.is_premium ? setShowPremiumManagement(true) : setShowPremiumDialog(true)}
                                    >
                                        <div className="flex items-center text-indigo-600 dark:text-indigo-400">
                                            <FaCrown className="mr-2" />
                                            <h3 className="font-medium">{user?.is_premium ? "Manage Membership" : "Upgrade Membership"}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {user?.is_premium ? "Manage your premium subscription" : "Access premium features"}
                                        </p>
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200 border border-red-200 dark:border-red-900/50">
                                <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
                                    <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center">
                                        <FaExclamationTriangle className="mr-2" />
                                        Danger Zone
                                    </h2>
                                </div>

                                <div className="px-6 py-4">
                                    {!showDeleteConfirm ? (
                                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                                            <div className="mb-4 md:mb-0">
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">Delete your account</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    This will permanently delete all your data. This action cannot be undone.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg font-medium cursor-pointer transition-colors duration-200 flex items-center justify-center"
                                            >
                                                <FaTrash className="mr-2" />
                                                Delete Account
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    To confirm, type your email address <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{user?.email}</span> below:
                                                </p>
                                                <input
                                                    type="text"
                                                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                    placeholder={`Type "${user?.email}" to confirm`}
                                                    value={deleteConfirmation}
                                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                    onPaste={(e) => {
                                                        e.preventDefault();
                                                        toast.error("Pasting is not allowed for security reasons");
                                                    }}
                                                    onCopy={(e) => {
                                                        e.preventDefault();
                                                        toast.error("Copying is not allowed for security reasons");
                                                    }}
                                                />
                                            </div>

                                            {deleteError && (
                                                <div className="text-sm text-red-600 dark:text-red-400">
                                                    {deleteError}
                                                </div>
                                            )}

                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteConfirm(false);
                                                        setDeleteConfirmation("");
                                                        setDeleteError("");
                                                    }}
                                                    className="px-4 py-2 border cursor-pointer border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleDeleteAccount}
                                                    disabled={deleteConfirmation !== user?.email || deleteLoading}
                                                    className={`px-4 py-2 rounded-lg font-medium text-white flex items-center justify-center ${deleteConfirmation !== user?.email || deleteLoading
                                                        ? 'bg-red-400 dark:bg-red-800 cursor-not-allowed opacity-70'
                                                        : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 cursor-pointer dark:hover:bg-red-800'
                                                        } transition-colors duration-200`}
                                                >
                                                    {deleteLoading ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        'Delete Account'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <PremiumInfoDialog
                isOpen={showPremiumDialog}
                onClose={() => setShowPremiumDialog(false)}
                onContinue={handleUpgradeToPremium}
            />

            <PremiumInfoDialog
                isOpen={showReActivatePremiumDialog}
                onClose={() => setShowReActivatePremiumDialog(false)}
                onContinue={handleReActivatePremiumPlan}
            />

            {user?.is_premium && (
                <PremiumManagementModal
                    isOpen={showPremiumManagement}
                    onClose={() => setShowPremiumManagement(false)}
                    user={user}
                    onDowngrade={handleDowngradeSubscription}
                    onReActivateShow={() => {
                        handleReActivatePremiumPlan();
                    }}
                />
            )}
        </div>
    );
};