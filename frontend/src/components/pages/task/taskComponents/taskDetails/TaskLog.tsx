import { useEffect, useState } from "react";
import { useAuth } from "../../../../../hooks/useAuth";
import { FaInfoCircle, FaUserCheck, FaFile, FaTag, FaTasks } from "react-icons/fa";
import { format } from "date-fns";
import { fetchTaskLog } from "../../../../../services/changeLogService";
import { Link, useNavigate } from "react-router-dom";

interface TaskLog {
    id: string;
    table_name: string;
    operation: string;
    old_data: any;
    new_data: any;
    changed_by_name: string;
    changed_by_email: string;
    created_at: string;
    assignment: any;
    file: any;
    task_label: any;
    task: any;
}

interface TaskLogProps {
    projectId: string;
    taskId: string;
}

export const TaskLogsComponent = ({ projectId, taskId }: TaskLogProps) => {
    const { authState } = useAuth();
    const [logs, setLogs] = useState<TaskLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadLogs = async () => {
            try {
                setLoading(true);
                const logs = await fetchTaskLog(authState.accessToken!, projectId, taskId);
                setLogs(logs);
                console.log(logs);
            } catch (err) {
                setError("Failed to load task logs");
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
            case 'assignments':
                return <FaUserCheck className="text-indigo-500" />;
            case 'files':
                return <FaFile className="text-emerald-500" />;
            case 'task_labels':
                return <FaTag className="text-pink-500" />;
            case 'tasks':
                return <FaTasks className="text-orange-500" />;
            default:
                return <FaInfoCircle className="text-gray-500" />;
        }
    };

    const getOperationColor = (tableName: string) => {
        switch (tableName) {
            case 'assignments':
                return "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300";
            case 'files':
                return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300";
            case 'task_labels':
                return "bg-pink-50 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300";
            case 'tasks':
                return "bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300";
            default:
                return "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
        }
    };

    const getChangedItemName = (log: TaskLog) => {
        if (log.table_name === 'assignments') {
            const userName = log.assignment?.user_name || "Unknown User";
            return log.assignment?.user_id === authState.user?.id ? "you" : userName;
        }

        if (log.table_name === 'pending_project_invitations') {
            const email = log.new_data?.email || log.old_data?.email || "Unknown Email";
            return email === authState.user?.email ? "you" : email;
        }

        if (log.new_data?.name) return log.new_data.name;
        if (log.old_data?.name) return log.old_data.name;
        if (log.new_data?.title) return log.new_data.title;
        if (log.old_data?.title) return log.old_data.title;
        return "item";
    };

    const getChangedItemType = (log: TaskLog) => {
        switch (log.table_name) {
            case 'tasks':
                return 'Task';
            case 'files':
                return 'File';
            case 'assignments':
                return 'Task Assignment';
            case 'task_labels':
                return 'Task Label';
            default:
                return log.table_name;
        }
    };

    const renderLabelLink = (log: TaskLog) => {
        const title = log.task_label.label_name || "Unnamed Label";
        const projectId = log.task_label?.project_id;

        if (!projectId) return null;

        const basePath = `/projects/${projectId}/tasks?labels`;

        return (
            <Link
                to={basePath}
                className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                {title}
            </Link>
        );
    };

    const getChangedByDisplay = (log: TaskLog) => {
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

    const renderParentTaskConnection = (log: TaskLog) => {
        if (!log.task?.parent_task_id) return null;
        const project_id = log.new_data?.project_id || log.old_data?.project_id;

        return (
            <div className="mt-1.5 group/parent relative">
                <div
                    className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg p-1.5 max-w-fit -ml-1.5"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project_id}/tasks/${log.task.parent_task_id}`);
                    }}
                >
                    {/* Connection line */}
                    <div className="h-4 w-4 flex items-center justify-center relative">
                        <div className="absolute left-0 top-0 h-3 w-4 border-l-2 border-b-2 border-indigo-300 dark:border-indigo-600 rounded-bl-md"></div>
                    </div>

                    {/* Parent task icon & info */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-1 rounded-md">
                            <svg
                                className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                />
                            </svg>
                        </div>
                        <span>Part of:</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                            {log.task.parent_task_title || 'Parent Task'}
                        </span>
                        <div className="opacity-0 group-hover/parent:opacity-100 transition-opacity">
                            <svg
                                className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const getActionDescription = (log: TaskLog) => {
        const itemName = getChangedItemName(log);
        const itemType = getChangedItemType(log);

        switch (log.table_name) {
            case 'assignments':
                if (log.operation.toLowerCase() === 'insert') {
                    if (itemName === "you") {
                        return (
                            <>
                                You assigned this task
                            </>
                        );
                    }
                    return (
                        <>
                            Assigned {itemName} to this task
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'delete') {
                    if (itemName === "you") {
                        return (
                            <>
                                You unassigned from this task
                            </>
                        );
                    }
                    return (
                        <>
                            Unassigned {itemName} from this task
                        </>
                    );
                }
                return `Modified assignment for ${itemName}`;
            case 'files':
                if (log.operation.toLowerCase() === 'insert') {
                    return (
                        <>
                            Uploaded file {log.file.title || "Unnamed File"}
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'update') {
                    return (
                        <>
                            Updated file  {log.file.title || "Unnamed File"}
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'delete') {
                    return (
                        <>
                            Deleted file {log.file.title || "Unnamed File"}
                        </>
                    );
                }
                return `Modified file ${log.file.title || "Unnamed File"}`;
            case 'task_labels':
                if (log.operation.toLowerCase() === 'insert') {
                    return (
                        <>
                            Added label {renderLabelLink(log)}
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'delete') {
                    return (
                        <>
                            Removed label {renderLabelLink(log)}
                        </>
                    );
                }
                return (
                    <>
                        Modified label {renderLabelLink(log)}
                    </>
                );
            case 'tasks':
                if (log.operation.toLowerCase() === 'insert') {
                    // For subtasks
                    if (log.task?.parent_task_id) {
                        return (
                            <div className="space-y-1">
                                <div>
                                    Added subtask {log.task.title} to parent task
                                </div>
                                {renderParentTaskConnection(log)}
                            </div>
                        );
                    }
                    return (
                        <>
                            Added task {log.task.title} to project
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'update') {
                    const changedFields = [];

                    // Title changes
                    if (log.old_data?.title !== log.new_data?.title) {
                        changedFields.push({
                            field: 'title',
                            oldValue: log.old_data?.title,
                            newValue: log.new_data?.title
                        });
                    }

                    // Description changes
                    if (log.old_data?.description !== log.new_data?.description) {
                        changedFields.push({
                            field: 'description',
                            oldValue: log.old_data?.description || '(empty)',
                            newValue: log.new_data?.description || '(empty)'
                        });
                    }

                    // Status changes
                    if (log.old_data?.status !== log.new_data?.status) {
                        changedFields.push({
                            field: 'status',
                            oldValue: log.old_data?.status,
                            newValue: log.new_data?.status
                        });
                    }

                    // Priority changes
                    if (log.old_data?.priority !== log.new_data?.priority) {
                        changedFields.push({
                            field: 'priority',
                            oldValue: log.old_data?.priority,
                            newValue: log.new_data?.priority
                        });
                    }

                    // Due date changes
                    const oldDueDate = log.old_data?.due_date ? format(new Date(log.old_data.due_date), 'MMM d, yyyy') : 'none';
                    const newDueDate = log.new_data?.due_date ? format(new Date(log.new_data.due_date), 'MMM d, yyyy') : 'none';
                    if (oldDueDate !== newDueDate) {
                        changedFields.push({
                            field: 'due date',
                            oldValue: oldDueDate,
                            newValue: newDueDate
                        });
                    }

                    // Milestone changes
                    if (log.old_data?.milestone_id !== log.new_data?.milestone_id) {
                        changedFields.push({
                            field: 'milestone',
                            oldValue: log.old_data?.milestone_id ? log.task.milestone_name : 'none',
                            newValue: log.new_data?.milestone_id ? log.task.milestone_name : 'none'
                        });
                    }

                    // Attachments count changes
                    if (log.old_data?.attachments_count !== log.new_data?.attachments_count) {
                        changedFields.push({
                            field: 'attachments',
                            oldValue: log.old_data?.attachments_count,
                            newValue: log.new_data?.attachments_count
                        });
                    }

                    if (changedFields.length === 0) {
                        if (log.task?.parent_task_id) {
                            return (
                                <div className="space-y-1">
                                    <div>
                                        Modified subtask {log.task.title}
                                    </div>
                                    {renderParentTaskConnection(log)}
                                </div>
                            )
                        } else {
                            return (
                                <>
                                    Modified task {log.task.title}
                                </>
                            );
                        }
                    }

                    if (log.task?.parent_task_id) {
                        return (
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <span>
                                        Updated subtask {log.task.title} :
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
                                {renderParentTaskConnection(log)}
                            </div>
                        )
                    } else {
                        return (
                            <div className="space-y-1">
                                <span>
                                    Updated task {log.task.title} :
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
                    }
                } else if (log.operation.toLowerCase() === 'delete') {
                    if (log.task?.parent_task_id) {
                        return (
                            <div className="space-y-1">
                                <div>
                                    Deleted subtask {log.task?.task_title}
                                </div>
                                {renderParentTaskConnection(log)}
                            </div>
                        )
                    } else {
                        return (
                            <>
                                Deleted task {log.task?.task_title}
                            </>
                        )
                    }
                }

                if (log.task?.parent_task_id) {
                    return (
                        <div className="space-y-1">
                            <div>
                                Modified subtask <span className="font-medium">{log.task.task_title}</span>
                            </div>
                            {renderParentTaskConnection(log)}
                        </div>
                    );
                } else {
                    return (
                        <>
                            Modified task {log.task.title}
                        </>
                    );
                }
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

    const getAdditionalDetails = (log: TaskLog) => {
        if (log.table_name === 'assignments') {
            const assignedByName = log.assignment?.assigned_by_name || "Unknown";
            const assignedAt = log.new_data?.assigned_at ? format(new Date(log.new_data.assigned_at), 'MMM d, yyyy h:mm a') : null;
            const displayName = log.assignment?.assigned_by_email === authState.user?.email ? "You" : assignedByName;

            return assignedAt && (
                <span>Assigned by {displayName} on {assignedAt}</span>
            );
        }

        if (log.table_name === 'pending_project_invitations') {
            const inviterName = log.new_data?.inviter_name || log.changed_by_name || "Unknown";
            const role = log.new_data?.role || log.old_data?.role || "member";
            const displayName = log.changed_by_email === authState.user?.email ? "You" : inviterName;

            return (
                <span>
                    Invited as {role} by {displayName}
                </span>
            );
        }

        if (log.table_name === 'project_members' && log.operation.toLowerCase() !== 'delete') {
            const role = log.new_data?.role || log.old_data?.role || "member";
            return (
                <span>
                    Upgraded role to {role}
                </span>
            );
        }

        return null;
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
                        {getAdditionalDetails(log) && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {getAdditionalDetails(log)}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};