import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { FaInfoCircle, FaUserCheck, FaEnvelope, FaComment, FaFlag, FaFile, FaTag, FaTasks, FaUserMinus, FaUserPlus, FaArrowRight, FaRegClock, FaUser } from "react-icons/fa";
import { format } from "date-fns";
import { fetchDashboardLogForUser } from "../../../services/changeLogService";
import { Link, useNavigate } from "react-router-dom";

export const DashboardLogsComponent = () => {
    const { authState } = useAuth();
    const [logs, setLogs] = useState<DashboardLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadLogs = async () => {
            try {
                setLoading(true);
                const logs = await fetchDashboardLogForUser(authState.accessToken!);
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

    const getOperationIcon = (operation: string, tableName: string) => {
        switch (tableName) {
            case 'assignments':
                return <FaUserCheck className="text-indigo-500" />;
            case 'pending_project_invitations':
                return <FaEnvelope className="text-purple-500" />;
            case 'comments':
                return <FaComment className="text-amber-500" />;
            case 'milestones':
                return <FaFlag className="text-fuchsia-500" />;
            case 'files':
                return <FaFile className="text-emerald-500" />;
            case 'project_members':
                return operation.toLowerCase() === 'insert'
                    ? <FaUserPlus className="text-teal-500" />
                    : <FaUserMinus className="text-rose-500" />;
            case 'task_labels':
                return <FaTag className="text-pink-500" />;
            case 'projects':
                return <FaInfoCircle className="text-sky-500" />;
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
            case 'pending_project_invitations':
                return "bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300";
            case 'comments':
                return "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300";
            case 'milestones':
                return "bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-800 dark:text-fuchsia-300";
            case 'files':
                return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300";
            case 'project_members':
                return "bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300";
            case 'task_labels':
                return "bg-pink-50 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300";
            case 'projects':
                return "bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-300";
            case 'tasks':
                return "bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300";
            default:
                return "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
        }
    };

    const getChangedItemName = (log: DashboardLog) => {
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

    const getChangedItemType = (log: DashboardLog) => {
        switch (log.table_name) {
            case 'projects':
                return 'Project';
            case 'tasks':
                return 'Task';
            case 'project_members':
                return 'Project Member';
            case 'files':
                return 'File';
            case 'assignments':
                return 'Task Assignment';
            case 'pending_project_invitations':
                return 'Project Invitation';
            case 'comments':
                return 'Comment';
            case 'milestones':
                return 'Milestone';
            case 'task_labels':
                return 'Task Label';
            default:
                return log.table_name;
        }
    };

    const renderProjectLink = (log: DashboardLog) => {
        if (!log.projectName) return null;
        return (
            <Link
                to={`/projects/${log.new_data?.project_id || log.old_data?.project_id}`}
                className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                {log.projectName}
            </Link>
        );
    };

    const renderTaskLink = (log: DashboardLog) => {
        const project_id = log.new_data?.project_id || log.old_data?.project_id || null;
        const task_title = log.assignment?.task_title || log.task?.task_title || log.task_label?.task_title || log.comment?.task_title || log.file?.task_title || log.new_data?.task_title || log.old_data?.task_title;
        const task_id = log.assignment?.task_id || log.task?.task_id || log.task_label?.task_id || log.comment?.task_id || log.file?.task_id || log.new_data?.task_id || log.old_data?.task_id;

        if (!task_title || !task_id || !project_id) return null;
        return (
            <Link
                to={`/projects/${project_id}/tasks/${task_id}`}
                className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                {task_title}
            </Link>
        );
    };

    const renderMilestoneLink = (log: DashboardLog) => {
        const project_id = log.new_data?.project_id || log.old_data?.project_id;
        const milestone_title = log.milestone?.title || log.new_data?.title || log.old_data?.title;
        const milestone_id = log.milestone?.id || log.new_data?.id || log.old_data?.id;

        if (!project_id || !milestone_id || !milestone_title) return null;

        return (
            <Link
                to={`/projects/${project_id}/milestones/${milestone_id}`}
                className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                {milestone_title}
            </Link>
        );
    };

    const renderFileLink = (log: DashboardLog) => {
        const title = log.file.title || "Unnamed File";
        const fileId = log.file?.id;
        const projectId = log.file?.project_id;
        const taskId = log.file?.task_id;

        if (!fileId || !projectId) return null;

        const basePath = taskId
            ? `/projects/${projectId}/tasks/${taskId}`
            : `/projects/${projectId}?files`;

        return (
            <Link
                to={basePath}
                className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                {title}
            </Link>
        );
    };

    const renderLabelLink = (log: DashboardLog) => {
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

    const getChangedByDisplay = (log: DashboardLog) => {
        let name = log.changed_by_name;
        let email = log.changed_by_email;

        if ((!name || !email) && (log.table_name === 'project_members' || log.table_name === 'pending_project_invitations')) {
            name = log.projectMember?.inviter_user_name;
            email = log.projectMember?.inviter_user_email;
        }

        if (email === authState.user?.email) {
            return "You";
        }

        if (name && email) {
            return `${name} (${email})`;
        }

        return "Unknown user";
    };

    const renderParentTaskConnection = (log: DashboardLog) => {
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

    const getActionDescription = (log: DashboardLog) => {
        const itemName = getChangedItemName(log);
        const itemType = getChangedItemType(log);

        switch (log.table_name) {
            case 'assignments':
                if (log.operation.toLowerCase() === 'insert') {
                    if (itemName === "you") {
                        return (
                            <>
                                You assigned to task {renderTaskLink(log)} in project {renderProjectLink(log)}
                            </>
                        );
                    }
                    return (
                        <>
                            Assigned {itemName} to task {renderTaskLink(log)} in project {renderProjectLink(log)}
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'delete') {
                    if (itemName === "you") {
                        return (
                            <>
                                You unassigned from task {renderTaskLink(log)} in project {renderProjectLink(log)}
                            </>
                        );
                    }
                    return (
                        <>
                            Unassigned {itemName} from task {renderTaskLink(log)} in project {renderProjectLink(log)}
                        </>
                    );
                }
                return `Modified assignment for ${itemName}`;
            case 'pending_project_invitations':
                if (log.operation.toLowerCase() === 'insert') {
                    if (itemName === "you") {
                        return (
                            <>
                                Were invited to project {renderProjectLink(log)}
                            </>
                        );
                    }
                    return (
                        <>
                            Sent invitation to {itemName} for project {renderProjectLink(log)}
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'delete') {
                    if (itemName === "you") {
                        return (
                            <>
                                Invitation was cancelled for project {renderProjectLink(log)}
                            </>
                        );
                    }
                    return (
                        <>
                            Cancelled invitation to {itemName} for project {renderProjectLink(log)}
                        </>
                    );
                }
                return `Modified invitation for ${itemName}`;
            case 'comments':
                if (log.operation.toLowerCase() === 'insert') {
                    return (
                        <>
                            Wrote a comment to task {renderTaskLink(log)} in project {renderProjectLink(log)}
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'update') {
                    const changedFields = [];
                    const MAX_LENGTH = 40; // Strict character limit

                    // Simple truncation function
                    const truncate = (text: string) => {
                        if (!text) return '(empty)';
                        return text.length > MAX_LENGTH
                            ? `${text.substring(0, MAX_LENGTH)}...`
                            : text;
                    };

                    // Comment text changes
                    if (log.old_data?.comment !== log.new_data?.comment) {
                        changedFields.push({
                            field: 'text',
                            oldValue: truncate(log.old_data?.comment),
                            newValue: truncate(log.new_data?.comment),
                        });
                    }

                    if (changedFields.length === 0) {
                        return (
                            <>
                                Updated a comment on task {renderTaskLink(log)} in project {renderProjectLink(log)}
                            </>
                        );
                    }

                    return (
                        <div className="space-y-1">
                            <span>
                                Updated comment on task {renderTaskLink(log)} in project {renderProjectLink(log)}:
                            </span>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                                {changedFields.map((change, index) => (
                                    <li key={index} className="flex flex-wrap items-baseline">
                                        <span className="font-medium mr-1">{change.field}:</span>
                                        <span className="line-through text-gray-500 dark:text-gray-400 mr-1">
                                            {change.oldValue}
                                        </span>
                                        <span className="mr-1">→</span>
                                        <span className="text-green-600 dark:text-green-400">
                                            {change.newValue}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                } else if (log.operation.toLowerCase() === 'delete') {
                    return (
                        <>
                            Deleted a comment from task {renderTaskLink(log)} in project {renderProjectLink(log)}
                        </>
                    );
                }
                return `Modified comment in project ${renderProjectLink(log)}`;
            case 'milestones':
                if (log.operation.toLowerCase() === 'insert') {
                    return (
                        <>
                            Created milestone {renderMilestoneLink(log)} in project {renderProjectLink(log)}
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
                                Updated milestone {renderMilestoneLink(log)} in project {renderProjectLink(log)}
                            </>
                        );
                    }

                    return (
                        <div className="space-y-1">
                            <span>
                                Updated milestone {renderMilestoneLink(log)} in project {renderProjectLink(log)}:
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
                            Deleted milestone <span className="font-bold">{log.milestone?.title}</span> from project {renderProjectLink(log)}
                        </>
                    );
                }
                return (
                    <>
                        Modified milestone {renderMilestoneLink(log)} in project {renderProjectLink(log)}
                    </>
                );
            case 'files':
                const taskLink = renderTaskLink(log);
                const fileLink = renderFileLink(log);
                const projectLink = renderProjectLink(log);

                const taskContext = log.new_data?.task_id || log.old_data?.task_id
                    ? <> to task {taskLink} </>
                    : <> to project {projectLink} </>;

                if (log.operation.toLowerCase() === 'insert') {
                    return (
                        <>
                            Uploaded file {fileLink} {taskContext}
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'update') {
                    return (
                        <>
                            Updated file {fileLink} {taskContext}
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'delete') {
                    return (
                        <>
                            Deleted file {fileLink} {log.new_data?.task_id || log.old_data?.task_id ? `from task ${taskLink}` : `from project ${projectLink}`}
                        </>
                    );
                }
                return `Modified file ${fileLink}`;
            case 'project_members':
                if (log.operation.toLowerCase() === 'insert') {
                    if (log.projectMember.user_id === authState.user.id) {
                        return (
                            <>
                                You joined project {renderProjectLink(log)}
                            </>
                        )
                    } else {
                        return (
                            <>
                                {log.projectMember.inviter_user_id === authState.user.id
                                    ? "You invited"
                                    : `${log.projectMember.inviter_user_name} invited`} {log.projectMember.user_name} ({log.projectMember.user_email}) to project {renderProjectLink(log)}
                            </>
                        )
                    }
                } else if (log.operation.toLowerCase() === 'delete') {
                    return (
                        <>
                            Removed {log.projectMember.user_name} ({log.projectMember.user_email}) from project {renderProjectLink(log)}
                        </>
                    )
                } else if (log.operation.toLowerCase() === 'update') {
                    const changedFields = [];

                    // Role changes
                    if (log.old_data?.role !== log.new_data?.role) {
                        changedFields.push({
                            field: 'role',
                            oldValue: log.old_data?.role,
                            newValue: log.new_data?.role
                        });
                    }

                    // Status changes (if applicable)
                    if (log.old_data?.status !== log.new_data?.status) {
                        changedFields.push({
                            field: 'status',
                            oldValue: log.old_data?.status,
                            newValue: log.new_data?.status
                        });
                    }

                    if (changedFields.length === 0) {
                        return (
                            <>
                                Modified {log.projectMember.user_name}'s membership in project {renderProjectLink(log)}
                            </>
                        );
                    }

                    return (
                        <div className="space-y-1">
                            <span>
                                Updated {log.projectMember.user_name}'s membership in project {renderProjectLink(log)}:
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
                return (
                    <>
                        Modified {log.projectMember.user_name}'s membership in project {renderProjectLink(log)}
                    </>
                )
            case 'task_labels':
                const taskLinkTL = renderTaskLink(log);
                if (log.operation.toLowerCase() === 'insert') {
                    return (
                        <>
                            Added label {renderLabelLink(log)} to task {taskLinkTL} in project {renderProjectLink(log)}
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'delete') {
                    return (
                        <>
                            Removed label {renderLabelLink(log)} from task {taskLinkTL} in project {renderProjectLink(log)}
                        </>
                    );
                }
                return (
                    <>
                        Modified label {renderLabelLink(log)} on task {taskLinkTL} in project {renderProjectLink(log)}
                    </>
                );
            case 'projects':
                if (log.operation.toLowerCase() === 'insert') {
                    return (
                        <>
                            Created project {renderProjectLink(log)}
                        </>
                    );
                } else if (log.operation.toLowerCase() === 'update') {
                    const changedFields = [];
                    const MAX_LENGTH = 40; // Character limit

                    // Simple truncation function
                    const truncate = (text: string) => {
                        if (!text) return '(empty)';
                        return text.length > MAX_LENGTH
                            ? `${text.substring(0, MAX_LENGTH)}...`
                            : text;
                    };

                    // Project name changes
                    if (log.old_data?.name !== log.new_data?.name) {
                        changedFields.push({
                            field: 'name',
                            oldValue: truncate(log.old_data?.name),
                            newValue: truncate(log.new_data?.name)
                        });
                    }

                    // Description changes
                    if (log.old_data?.description !== log.new_data?.description) {
                        changedFields.push({
                            field: 'description',
                            oldValue: truncate(log.old_data?.description),
                            newValue: truncate(log.new_data?.description)
                        });
                    }

                    if (changedFields.length === 0) {
                        return (
                            <>
                                Modified project {renderProjectLink(log)}
                            </>
                        );
                    }

                    return (
                        <div className="space-y-1">
                            <span>
                                Updated project {renderProjectLink(log)}:
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
                            Deleted project {renderProjectLink(log)}
                        </>
                    );
                }
                return (
                    <>
                        Modified project {renderProjectLink(log)}
                    </>
                );
            case 'tasks':
                if (log.operation.toLowerCase() === 'insert') {
                    // For subtasks
                    if (log.task?.parent_task_id) {
                        return (
                            <div className="space-y-1">
                                <div>
                                    Added subtask {renderTaskLink(log)} to project {renderProjectLink(log)}
                                </div>
                                {renderParentTaskConnection(log)}
                            </div>
                        );
                    }
                    return (
                        <>
                            Added task {renderTaskLink(log)} to project {renderProjectLink(log)}
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
                                        Modified subtask {renderTaskLink(log)} in project {renderProjectLink(log)}
                                    </div>
                                    {renderParentTaskConnection(log)}
                                </div>
                            )
                        } else {
                            return (
                                <>
                                    Modified task {renderTaskLink(log)} in project {renderProjectLink(log)}
                                </>
                            );
                        }
                    }

                    if (log.task?.parent_task_id) {
                        return (
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <span>
                                        Updated subtask {renderTaskLink(log)} in project {renderProjectLink(log)}:
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
                                    Updated task {renderTaskLink(log)} in project {renderProjectLink(log)}:
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
                                    Deleted subtask {log.task?.task_title} from project {renderProjectLink(log)}
                                </div>
                                {renderParentTaskConnection(log)}
                            </div>
                        )
                    } else {
                        return (
                            <>
                                Deleted task {log.task?.task_title} from project {renderProjectLink(log)}
                            </>
                        )
                    }
                }

                if (log.task?.parent_task_id) {
                    return (
                        <div className="space-y-1">
                            <div>
                                Modified subtask <span className="font-medium">{log.task.task_title}</span> in project {renderProjectLink(log)}
                            </div>
                            {renderParentTaskConnection(log)}
                        </div>
                    );
                } else {
                    return (
                        <>
                            Modified task {renderTaskLink(log)} in project {renderProjectLink(log)}
                        </>
                    );
                }
            default:
                switch (log.operation.toLowerCase()) {
                    case 'insert':
                        return `Added ${itemType} "${itemName}" to project ${renderProjectLink(log)}`;
                    case 'update':
                        return `Updated ${itemType} "${itemName}" in project ${renderProjectLink(log)}`;
                    case 'delete':
                        return `Deleted ${itemType} "${itemName}" from project ${renderProjectLink(log)}`;
                    default:
                        return `Modified ${itemType} in project ${renderProjectLink(log)}`;
                }
        }
    };

    const getAdditionalDetails = (log: DashboardLog) => {
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
                <div
                    key={log.id}
                    className="flex space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xs border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all duration-200"
                >
                    <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getOperationColor(log.table_name)}`}>
                            {getOperationIcon(log.operation, log.table_name)}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getActionDescription(log)}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                                <FaUser className="mr-1.5 opacity-70" />
                                {getChangedByDisplay(log)}
                            </span>
                            <span className="flex items-center">
                                <FaRegClock className="mr-1.5 opacity-70" />
                                {format(new Date(log.created_at), 'MMM d, yyyy H:mm')}
                            </span>
                            {getAdditionalDetails(log) && (
                                <span className="bg-gray-100 dark:bg-gray-700/50 rounded-full px-2.5 py-0.5">
                                    {getAdditionalDetails(log)}
                                </span>
                            )}
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