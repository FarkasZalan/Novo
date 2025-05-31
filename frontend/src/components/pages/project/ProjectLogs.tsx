import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { FaUserEdit, FaPlus, FaTrash, FaInfoCircle, FaUserCheck, FaEnvelope, FaComment, FaFlag, FaFile, FaTag } from "react-icons/fa";
import { format } from "date-fns";
import { fetchAllProjectLogForUser } from "../../../services/changeLogService";
import { Link } from "react-router-dom";

interface ProjectLog {
    id: string;
    table_name: string;
    operation: string;
    old_data: any;
    new_data: any;
    changed_by_name: string;
    changed_by_email: string;
    created_at: string;
    assignment: any;
    comment: any;
    milestone: any;
    file: any;
    projectMember: any;
    task_label: any;
    projectName?: string;
    project_id?: string;
    task_title?: string;
    task_id?: string;
}

export const ProjectLogsComponent = () => {
    const { authState } = useAuth();
    const [logs, setLogs] = useState<ProjectLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                setLoading(true);
                const logs = await fetchAllProjectLogForUser(authState.accessToken!);
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
        if (tableName === 'assignments') {
            return <FaUserCheck className="text-indigo-500" />;
        }
        if (tableName === 'pending_project_invitations') {
            return <FaEnvelope className="text-purple-500" />;
        }
        if (tableName === 'comments') {
            return <FaComment className="text-amber-500" />;
        }
        if (tableName === 'milestones') {
            return <FaFlag className="text-fuchsia-500" />;
        }
        if (tableName === 'files') {
            return <FaFile className="text-emerald-500" />;
        }
        if (tableName === 'project_members') {
            return <FaUserCheck className="text-cyan-500" />;
        }
        if (tableName === 'task_labels') {
            return <FaTag className="text-pink-500" />;
        }
        if (tableName === 'projects') {
            return <FaInfoCircle className="text-blue-500" />;
        }


        switch (operation.toLowerCase()) {
            case 'insert':
                return <FaPlus className="text-green-500" />;
            case 'update':
                return <FaUserEdit className="text-blue-500" />;
            case 'delete':
                return <FaTrash className="text-red-500" />;
            default:
                return <FaInfoCircle className="text-gray-500" />;
        }
    };

    const getOperationColor = (operation: string, tableName: string) => {
        if (tableName === 'assignments') {
            return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300";
        }
        if (tableName === 'pending_project_invitations') {
            return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
        }
        if (tableName === 'comments') {
            return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300";
        }
        if (tableName === 'milestones') {
            return "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-800 dark:text-fuchsia-300";
        }
        if (tableName === 'files') {
            return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300";
        }
        if (tableName === 'project_members') {
            return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300";
        }
        if (tableName === 'task_labels') {
            return "bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300";
        }
        if (tableName === 'projects') {
            return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
        }

        switch (operation.toLowerCase()) {
            case 'insert':
                return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
            case 'update':
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
            case 'delete':
                return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
            default:
                return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
        }
    };

    const getChangedItemName = (log: ProjectLog) => {
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

    const getChangedItemType = (log: ProjectLog) => {
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
            case 'labels':
                return 'Label';
            default:
                return log.table_name;
        }
    };

    const renderProjectLink = (log: ProjectLog) => {
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

    const renderTaskLink = (log: ProjectLog) => {
        const project_id = log.new_data?.project_id || log.old_data?.project_id || null;
        const task_title = log.assignment?.task_title || log.task_label?.task_title || log.comment?.task_title || log.file?.task_title || log.new_data?.task_title || log.old_data?.task_title;
        const task_id = log.assignment?.task_id || log.task_label?.task_id || log.comment?.task_id || log.file?.task_id || log.new_data?.task_id || log.old_data?.task_id;

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

    const renderMilestoneLink = (log: ProjectLog) => {
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

    const renderFileLink = (log: ProjectLog) => {
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

    const renderLabelLink = (log: ProjectLog) => {
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

    const getChangedByDisplay = (log: ProjectLog) => {
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

    const getActionDescription = (log: ProjectLog) => {
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
                    return (
                        <>
                            Updated a comment on task {renderTaskLink(log)} in project {renderProjectLink(log)}
                        </>
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
                    return (
                        <>
                            Updated milestone {renderMilestoneLink(log)} in project {renderProjectLink(log)}
                        </>
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
                            Deleted file {fileLink} {taskContext}
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
                                Joined {log.projectMember.user_name} ({log.projectMember.user_email}) to project {renderProjectLink(log)}
                            </>
                        )
                    }
                } else if (log.operation.toLowerCase() === 'delete') {
                    return (
                        <>
                            Removed {log.projectMember.user_name} ({log.projectMember.user_email}) from project {renderProjectLink(log)}
                        </>
                    )
                }
                return (
                    <>
                        Modified {log.projectMember.user_name} ({log.projectMember.user_email}) status in project {renderProjectLink(log)}
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
                    )
                } else if (log.operation.toLowerCase() === 'update') {
                    if (log.old_data?.name !== log.new_data?.name && log.old_data?.description === log.new_data?.description) {
                        return (
                            <>
                                Renamed project {renderProjectLink(log)} from "{log.old_data?.name}" to "{log.new_data?.name}"
                            </>
                        )
                    } else if (log.old_data?.name !== log.new_data?.name && log.old_data?.description !== log.new_data?.description) {
                        return (
                            <>
                                Renamed project {renderProjectLink(log)} from "{log.old_data?.name}" to "{log.new_data?.name}"
                                and modified description
                            </>
                        )
                    } else {
                        return (
                            <>
                                Modified project {renderProjectLink(log)} description
                            </>
                        )
                    }
                } else if (log.operation.toLowerCase() === 'delete') {
                    return (
                        <>
                            Deleted project {renderProjectLink(log)}
                        </>
                    )
                }
                return (
                    <>
                        Modified project {renderProjectLink(log)}
                    </>
                );
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

    const getAdditionalDetails = (log: ProjectLog) => {
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
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getOperationColor(log.operation, log.table_name)}`}>
                            {getOperationIcon(log.operation, log.table_name)}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getActionDescription(log)}
                        </p>
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