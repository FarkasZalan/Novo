import { FaCrown, FaExclamationTriangle, FaTrash, FaTimes, FaCheck, FaInfoCircle, FaSyncAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from "react";
import { ConfirmationDialog } from "../project/ConfirmationDialog";

interface PremiumManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onDowngrade: () => Promise<void>;
    onReActivateShow: () => void;
}

export const PremiumManagementModal = ({
    isOpen,
    onClose,
    user,
    onDowngrade,
    onReActivateShow
}: PremiumManagementModalProps) => {
    const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);

    if (!isOpen || !user?.is_premium) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200/80 dark:border-gray-700/50 pb-8"
            >
                {/* Header */}
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FaCrown className={`${user.user_cancelled_premium ? 'text-yellow-400 dark:text-yellow-300' : 'text-yellow-500 dark:text-yellow-400'}`} />
                                {user.user_cancelled_premium ? 'Premium Ending Soon' : 'Premium Membership'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                                {user.user_cancelled_premium
                                    ? 'Your premium access will end soon'
                                    : 'Manage your premium subscription details'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                        >
                            <FaTimes className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Membership Details */}
                <div className="px-6 pb-4">
                    {user.user_cancelled_premium && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-lg p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <FaInfoCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Subscription Ending
                                    </h3>
                                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                        <p>
                                            Your premium access will continue until{' '}
                                            <span className="font-semibold">
                                                {user.premium_end_date ? formatDate(user.premium_end_date) : 'the end of billing period'}
                                            </span>.
                                            After this date, you'll revert to the free plan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className={`${user.user_cancelled_premium ? 'bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'} border rounded-lg p-4`}>
                            <div className="flex items-start">
                                <FaInfoCircle className={`mt-1 mr-3 flex-shrink-0 ${user.user_cancelled_premium ? 'text-yellow-400 dark:text-yellow-300' : 'text-yellow-500 dark:text-yellow-400'}`} />
                                <div>
                                    <h4 className={`font-medium ${user.user_cancelled_premium ? 'text-yellow-700 dark:text-yellow-300' : 'text-yellow-800 dark:text-yellow-200'}`}>
                                        {user.user_cancelled_premium ? 'Current Benefits (Until End Date)' : 'Premium Member Benefits'}
                                    </h4>
                                    <ul className="mt-2 text-sm space-y-1">
                                        <li className="flex items-center">
                                            <FaCheck className={`mr-2 ${user.user_cancelled_premium ? 'text-yellow-400 dark:text-yellow-300' : 'text-yellow-500 dark:text-yellow-400'}`} />
                                            <span className={user.user_cancelled_premium ? 'text-yellow-600 dark:text-yellow-300' : 'text-yellow-700 dark:text-yellow-300'}>Custom project branding</span>
                                        </li>
                                        <li className="flex items-center">
                                            <FaCheck className={`mr-2 ${user.user_cancelled_premium ? 'text-yellow-400 dark:text-yellow-300' : 'text-yellow-500 dark:text-yellow-400'}`} />
                                            <span className={user.user_cancelled_premium ? 'text-yellow-600 dark:text-yellow-300' : 'text-yellow-700 dark:text-yellow-300'}>Unlimited team members</span>
                                        </li>
                                        <li className="flex items-center">
                                            <FaCheck className={`mr-2 ${user.user_cancelled_premium ? 'text-yellow-400 dark:text-yellow-300' : 'text-yellow-500 dark:text-yellow-400'}`} />
                                            <span className={user.user_cancelled_premium ? 'text-yellow-600 dark:text-yellow-300' : 'text-yellow-700 dark:text-yellow-300'}>Priority support</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Subscription Start</p>
                                <p className="text-gray-900 dark:text-white font-medium">
                                    {user.premium_start_date ? formatDate(user.premium_start_date) : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.user_cancelled_premium ? 'Access Ends' : 'Renewal Date'}
                                </p>
                                <p className="text-gray-900 dark:text-white font-medium">
                                    {user.premium_end_date ? formatDate(user.premium_end_date) : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-gray-200 dark:border-gray-700/50">
                    <div className="px-6 py-4">
                        <h4 className="font-semibold text-red-600 dark:text-red-400 flex items-center mb-3">
                            <FaExclamationTriangle className="mr-2" />
                            {user.user_cancelled_premium ? 'Subscription Status' : 'Danger Zone'}
                        </h4>

                        {user.user_cancelled_premium ? (
                            <div className="space-y-4">
                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                        Subscription Cancelled
                                    </h5>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                                        Your premium access will continue until{' '}
                                        <span className="font-semibold">
                                            {user.premium_end_date ? formatDate(user.premium_end_date) : 'the end of billing period'}
                                        </span>.
                                    </p>
                                    <button
                                        onClick={onReActivateShow}
                                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium cursor-pointer transition-colors duration-200 flex items-center justify-center"
                                    >
                                        <FaSyncAlt className="mr-2" />
                                        Reactivate Premium Plan
                                    </button>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <button
                                        disabled
                                        className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg font-medium cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                                    >
                                        <FaTrash className="mr-2" />
                                        Already Cancelled
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">
                                    Downgrade to Free Plan
                                </h5>
                                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                    You'll lose access to premium features after the current billing period ends.
                                </p>
                                <button
                                    onClick={() => setShowDowngradeConfirm(true)}
                                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg font-medium cursor-pointer transition-colors duration-200 flex items-center justify-center"
                                >
                                    <FaTrash className="mr-2" />
                                    Downgrade Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            <ConfirmationDialog
                isOpen={showDowngradeConfirm}
                onClose={() => setShowDowngradeConfirm(false)}
                onConfirm={() => {
                    onClose();
                    onDowngrade();
                }}
                title="Downgrade Account?"
                message="Are you sure you want to downgrade your account? You'll lose access to premium features after the current billing period ends."
                confirmText="Downgrade"
                confirmColor="red"
            />
        </div>
    );
};