import { useEffect, useState } from "react";
import { useAuth } from "../../../../../../hooks/useAuth";
import { FaInfoCircle, FaFlag } from "react-icons/fa";
import { format } from "date-fns";
import { fetchMilestoneLog } from "../../../../../../services/changeLogService";

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
                <div key={log.id} className="flex space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
                    <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getOperationColor(log.table_name)}`}>
                            {getOperationIcon(log.table_name)}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getActionDescription(log)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            By {getChangedByDisplay(log)} • {format(new Date(log.created_at), 'MMM d, yyyy')}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};