import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { FaUser, FaUserCheck, FaUserEdit, FaUserSlash, FaRegClock, FaArrowRight } from "react-icons/fa";
import { format } from "date-fns";
import { fetchUserLog } from "../../../services/changeLogService";
import { Link } from "react-router-dom";

interface UserLog {
    id: string;
    table_name: string;
    operation: string;
    old_data: any;
    new_data: any;
    changed_by_name: string;
    changed_by_email: string;
    created_at: string;
    user: any;
}

export const UserLogsComponent = () => {
    const { authState } = useAuth();
    const [logs, setLogs] = useState<UserLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                setLoading(true);
                const logs = await fetchUserLog(authState.accessToken!);
                setLogs(logs);
                console.log(logs);
            } catch (err) {
                setError("Failed to load user logs");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (authState.accessToken) {
            loadLogs();
        }
    }, [authState.accessToken]);

    const getOperationIcon = (operation: string) => {
        switch (operation.toLowerCase()) {
            case 'insert':
                return <FaUserCheck className="text-green-500" />;
            case 'update':
                return <FaUserEdit className="text-blue-500" />;
            case 'delete':
                return <FaUserSlash className="text-red-500" />;
            default:
                return <FaUser className="text-gray-500" />;
        }
    };

    const getOperationColor = (operation: string) => {
        switch (operation.toLowerCase()) {
            case 'insert':
                return "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300";
            case 'update':
                return "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
            case 'delete':
                return "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
            default:
                return "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
        }
    };

    const isCurrentUser = (email: string) => {
        return email === authState.user?.email;
    };

    const formatPremiumDate = (dateString: string | null) => {
        if (!dateString) return 'Not set';
        return format(new Date(dateString), 'MMM d, yyyy H:mm');
    };

    const getActionDescription = (log: UserLog) => {
        const changedFields = [];
        const userRef = isCurrentUser(log.user?.email) ? "your" : "their";
        const userRefYou = isCurrentUser(log.user?.email) ? "You" : "They";
        const userRefYour = isCurrentUser(log.user?.email) ? "your" : "their";

        // User creation
        if (log.operation.toLowerCase() === 'insert') {
            return `${userRefYou} created an account`;
        }

        // User deletion
        if (log.operation.toLowerCase() === 'delete') {
            return `${userRefYou} deleted ${userRef} account`;
        }

        // Premium subscription changes
        if (log.old_data?.is_premium !== log.new_data?.is_premium) {
            if (log.new_data?.is_premium) {
                return `${userRefYou} upgraded to Premium`;
            } else {
                return `${userRefYou} downgraded to Free plan`;
            }
        }

        // Premium cancellation
        if (log.old_data?.user_cancelled_premium !== log.new_data?.user_cancelled_premium) {
            if (log.new_data?.user_cancelled_premium) {
                return `${userRefYou} cancelled ${userRefYour} Premium subscription`;
            } else {
                return `${userRefYou} reactivated ${userRefYour} Premium subscription`;
            }
        }

        // Compare old and new data to find changed fields
        if (log.old_data?.name !== log.new_data?.name) {
            changedFields.push({
                field: 'name',
                oldValue: log.old_data?.name,
                newValue: log.new_data?.name
            });
        }

        if (log.old_data?.email !== log.new_data?.email) {
            changedFields.push({
                field: 'email',
                oldValue: log.old_data?.email,
                newValue: log.new_data?.email
            });
        }

        if (log.old_data?.premium_start_date !== log.new_data?.premium_start_date) {
            changedFields.push({
                field: 'premium start date',
                oldValue: formatPremiumDate(log.old_data?.premium_start_date),
                newValue: formatPremiumDate(log.new_data?.premium_start_date),
                icon: <FaRegClock className="mr-1" />
            });
        }

        if (log.old_data?.premium_end_date !== log.new_data?.premium_end_date) {
            changedFields.push({
                field: 'premium end date',
                oldValue: formatPremiumDate(log.old_data?.premium_end_date),
                newValue: formatPremiumDate(log.new_data?.premium_end_date),
                icon: <FaRegClock className="mr-1" />
            });
        }

        if (changedFields.length === 0) {
            return `${userRefYou} updated ${userRef} profile`;
        }

        return (
            <div className="space-y-1">
                <span className="font-medium">{userRefYou} updated {userRef} profile:</span>
                <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                    {changedFields.map((change, index) => (
                        <li key={index} className="flex flex-wrap items-baseline">
                            <span className="font-medium mr-1 flex items-center">
                                {change.icon || null}
                                {change.field}:
                            </span>
                            {change.oldValue ? (
                                <span className="line-through text-gray-500 dark:text-gray-400 mr-1">{change.oldValue}</span>
                            ) : (
                                <span className="text-gray-500 dark:text-gray-400 mr-1">(empty)</span>
                            )}
                            <span className="mr-1">→</span>
                            {change.newValue ? (
                                <span className="font-medium text-green-600 dark:text-green-400">{change.newValue}</span>
                            ) : (
                                <span className="font-medium text-gray-500 dark:text-gray-400">(empty)</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 dark:text-red-400 py-4">
                <p>{error}</p>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No user activity logs found
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Account History</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing changes made to your account
                </p>
            </div>

            {logs.map((log) => (
                <div key={log.id} className="flex space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getOperationColor(log.operation)}`}>
                            {getOperationIcon(log.operation)}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                            {getActionDescription(log)}
                        </div>
                        <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <FaRegClock className="mr-1.5 opacity-70" />
                            {format(new Date(log.created_at), 'MMM d, yyyy H:mm')}
                        </div>
                    </div>
                </div>
            ))}

            {logs.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <Link
                        to="/all-user-activity"
                        className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline transition-colors"
                    >
                        View all activity
                        <FaArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                </div>
            )}
        </div>
    );
};