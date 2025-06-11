import { useEffect, useState } from "react";
import { useAuth } from "../../../../../../hooks/useAuth";
import { FaInfoCircle, FaComment } from "react-icons/fa";
import { format } from "date-fns";
import { fetchCommentLog } from "../../../../../../services/changeLogService";

interface CommentLogProps {
    projectId: string;
    taskId: string;
    commentId: string;
}

export const CommentLogsComponent = ({ projectId, taskId, commentId }: CommentLogProps) => {
    const { authState } = useAuth();
    const [logs, setLogs] = useState<CommentLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                setLoading(true);
                const logs = await fetchCommentLog(authState.accessToken!, projectId, taskId, commentId);
                setLogs(logs);
            } catch (err) {
                setError("Failed to load comment logs");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (authState.accessToken) {
            loadLogs();
        }
    }, [authState.accessToken, projectId, taskId, commentId]);

    const getOperationIcon = (tableName: string) => {
        switch (tableName) {
            case 'comments':
                return <FaComment className="text-amber-500" />;
            default:
                return <FaInfoCircle className="text-gray-500" />;
        }
    };

    const getOperationColor = (tableName: string) => {
        switch (tableName) {
            case 'comments':
                return "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300";
            default:
                return "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
        }
    };

    const getChangedByDisplay = (log: CommentLog) => {
        let name = log.changed_by_name;
        let email = log.changed_by_email;

        if (email === authState.user?.email) {
            return "You";
        }

        if (name && email) {
            return `${name} (${email})`;
        }

        return "Unknown user";
    };

    const getActionDescription = (log: CommentLog) => {
        const changedFields = [];

        // Comment text changes
        if (log.old_data?.comment !== log.new_data?.comment) {
            changedFields.push({
                field: 'text',
                oldValue: log.old_data?.comment,
                newValue: log.new_data?.comment,
            });
        }

        // Check for other potential changes in comment data
        if (log.old_data?.comment_text !== log.new_data?.comment_text) {
            changedFields.push({
                field: 'text',
                oldValue: log.old_data?.comment_text,
                newValue: log.new_data?.comment_text,
            });
        }

        if (changedFields.length === 0) {
            return "Updated comment details";
        }

        return (
            <div className="space-y-2">
                <span className="font-medium">Comment updated:</span>
                <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                    {changedFields.map((change, index) => (
                        <div key={index} className="mb-2 last:mb-0">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {change.field}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                                <div className="flex-1 bg-white dark:bg-gray-800 p-2 rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-gray-200 dark:border-gray-600 sm:border-r-0">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Before:</div>
                                    <div className="line-through text-gray-700 dark:text-gray-300 break-words">
                                        {change.oldValue || <span className="text-gray-400 italic">empty</span>}
                                    </div>
                                </div>
                                <div className="flex-1 bg-white dark:bg-gray-800 p-2 rounded-lg sm:rounded-r-lg sm:rounded-l-none border border-gray-200 dark:border-gray-600">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">After:</div>
                                    <div className="text-green-600 dark:text-green-400 break-words">
                                        {change.newValue || <span className="text-gray-400 italic">empty</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">Comment History</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing changes made to this comment
                </p>
            </div>

            <div className="space-y-4 px-2 sm:px-0">
                {logs.map((log) => (
                    <div key={log.id} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                        <div className="flex sm:flex-col items-center sm:items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getOperationColor(log.table_name)}`}>
                                    {getOperationIcon(log.table_name)}
                                </div>
                            </div>
                            <div className="sm:text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {format(new Date(log.created_at), 'MMM d, yyyy')}
                                    <br className="hidden sm:block" />
                                    {format(new Date(log.created_at), 'H:mm')}
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                                {getActionDescription(log)}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                By {getChangedByDisplay(log)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};