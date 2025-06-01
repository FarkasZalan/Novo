import { useEffect, useState } from "react";
import { useAuth } from "../../../../../../hooks/useAuth";
import { FaInfoCircle, FaFlag, FaArrowRight, FaRegClock, FaUser } from "react-icons/fa";
import { format } from "date-fns";
import { fetchMilestoneLog } from "../../../../../../services/changeLogService";
import { Link } from "react-router-dom";

interface MilestoneLog {
    id: string;
    table_name: string;
    operation: string;
    old_data: any;
    new_data: any;
    changed_by_name: string;
    changed_by_email: string;
    created_at: string;
    milestone: any;
    task_title?: string;
    task_id?: string;
}

interface MilestoneLogProps {
    projectId: string;
    milestoneId: string;
}

export const MilestoneLogsComponent = ({ projectId, milestoneId }: MilestoneLogProps) => {
    const { authState } = useAuth();
    const [logs, setLogs] = useState<MilestoneLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                setLoading(true);
                const logs = await fetchMilestoneLog(authState.accessToken!, projectId, milestoneId);
                setLogs(logs);
                console.log(logs);
            } catch (err) {
                setError("Failed to load project logs");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (authState.accessToken) {
            loadLogs();
        }
    }, [authState.accessToken]);

    const getOperationIcon = (tableName: string) => {
        switch (tableName) {
            case 'milestones':
                return <FaFlag className="text-fuchsia-500" />;
            default:
                return <FaInfoCircle className="text-gray-500" />;
        }
    };

    const getOperationColor = (tableName: string) => {
        switch (tableName) {
            case 'milestones':
                return "bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-800 dark:text-fuchsia-300";
            default:
                return "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
        }
    };

    const getChangedItemName = (log: MilestoneLog) => {
        if (log.new_data?.name) return log.new_data.name;
        if (log.old_data?.name) return log.old_data.name;
        if (log.new_data?.title) return log.new_data.title;
        if (log.old_data?.title) return log.old_data.title;
        return "item";
    };

    const getChangedItemType = (log: MilestoneLog) => {
        switch (log.table_name) {
            case 'milestones':
                return 'Milestone';
            default:
                return log.table_name;
        }
    };

    const getChangedByDisplay = (log: MilestoneLog) => {
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

    const getActionDescription = (log: MilestoneLog) => {
        const itemName = getChangedItemName(log);
        const itemType = getChangedItemType(log);

        switch (log.table_name) {
            case 'milestones':
                if (log.operation.toLowerCase() === 'insert') {
                    return (
                        <>
                            Created milestone
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'update') {
                    const changedFields = [];

                    // Compare old and new data to find changed fields
                    if (log.old_data?.name !== log.new_data?.name) {
                        changedFields.push({
                            field: 'name',
                            oldValue: log.old_data?.name,
                            newValue: log.new_data?.name
                        });
                    }
                    if (log.old_data?.description !== log.new_data?.description) {
                        changedFields.push({
                            field: 'description',
                            oldValue: log.old_data?.description || '(empty)',
                            newValue: log.new_data?.description || '(empty)'
                        });
                    }
                    if (log.old_data?.due_date !== log.new_data?.due_date) {
                        changedFields.push({
                            field: 'due date',
                            oldValue: log.old_data?.due_date ? format(new Date(log.old_data.due_date), 'MMM d, yyyy') : 'none',
                            newValue: log.new_data?.due_date ? format(new Date(log.new_data.due_date), 'MMM d, yyyy') : 'none'
                        });
                    }
                    if (log.old_data?.all_tasks_count !== log.new_data?.all_tasks_count) {
                        changedFields.push({
                            field: 'total tasks',
                            oldValue: log.old_data?.all_tasks_count,
                            newValue: log.new_data?.all_tasks_count
                        });
                    }
                    if (log.old_data?.completed_tasks_count !== log.new_data?.completed_tasks_count) {
                        changedFields.push({
                            field: 'completed tasks',
                            oldValue: log.old_data?.completed_tasks_count,
                            newValue: log.new_data?.completed_tasks_count
                        });
                    }

                    if (changedFields.length === 0) {
                        return (
                            <>
                                Updated milestone
                            </>
                        );
                    }

                    return (
                        <div className="space-y-1">
                            <span>
                                Updated milestone :
                            </span>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                                {changedFields.map((change, index) => (
                                    <li key={index} className="flex flex-wrap items-baseline">
                                        <span className="font-medium mr-1">{change.field}:</span>
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
                } else if (log.operation.toLowerCase() === 'delete') {
                    return (
                        <>
                            Deleted milestone <span className="font-bold">{log.milestone?.title}</span>
                        </>
                    );
                }
                return (
                    <>
                        Modified milestone
                    </>
                );
            default:
                switch (log.operation.toLowerCase()) {
                    case 'insert':
                        return `Added ${itemType} "${itemName}" to project`;
                    case 'update':
                        return `Updated ${itemType} "${itemName}" in project`;
                    case 'delete':
                        return `Deleted ${itemType} "${itemName}"`;
                    default:
                        return `Modified ${itemType}`;
                }
        }
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
                No activity logs found
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {logs.map((log) => (
                <div
                    key={log.id}
                    className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all duration-200 group"
                >
                    <div className="flex-shrink-0">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getOperationColor(log.table_name)} group-hover:scale-105 transition-transform`}>
                            {getOperationIcon(log.table_name)}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getActionDescription(log)}
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center">
                                <FaUser className="mr-1.5 opacity-70 text-xs" />
                                {getChangedByDisplay(log)}
                            </span>
                            <span className="inline-flex items-center">
                                <FaRegClock className="mr-1.5 opacity-70 text-xs" />
                                {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                            </span>
                        </div>
                    </div>
                </div>
            ))}

            {logs.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <Link
                        to="/all-log"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                        View all activity
                        <FaArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Link>
                </div>
            )}
        </div>
    );
};