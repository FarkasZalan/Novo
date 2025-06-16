import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { FaInfoCircle, FaUserCheck, FaEnvelope, FaComment, FaFlag, FaFile, FaTag, FaTasks, FaUserMinus, FaUserPlus, FaArrowLeft, FaExclamationCircle, FaUser, FaUserEdit, FaUserSlash, FaRegClock, FaChevronDown, FaChevronUp, FaFilter, FaArrowUp } from "react-icons/fa";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllFilteredLogForUser } from "../../../services/filterService";

const DEFAULT_TABLES = [
    'projects',
    'tasks',
    'project_members',
    'files',
    'assignments',
    'pending_project_invitations',
    'comments',
    'milestones',
    'task_labels',
    'users'
];

export const AllFilteredLogsComponent = () => {
    const { authState } = useAuth();
    const [logs, setLogs] = useState<AllLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTables, setSelectedTables] = useState<string[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    const [limit, setLimit] = useState(20);
    const [filterOpen, setFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const [showScrollToTop, setShowScrollToTop] = useState(false);

    const filterGroups = [
        {
            name: "Projects",
            tables: ['projects'],
            icon: <FaInfoCircle className="text-sky-500" />,
            color: "bg-sky-100 dark:bg-sky-900/20 text-sky-800 dark:text-sky-300"
        },
        {
            name: "Tasks",
            tables: ['tasks', 'assignments'],
            icon: <FaTasks className="text-orange-500" />,
            color: "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300"
        },
        {
            name: "Team",
            tables: ['project_members', 'pending_project_invitations'],
            icon: <FaUserCheck className="text-teal-500" />,
            color: "bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300"
        },
        {
            name: "Content",
            tables: ['files', 'comments', 'milestones'],
            icon: <FaFile className="text-emerald-500" />,
            color: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300"
        },
        {
            name: "Organization",
            tables: ['task_labels', 'users'],
            icon: <FaTag className="text-pink-500" />,
            color: "bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300"
        }
    ];

    const loadLogs = async (newLimit: number, reset: boolean = false) => {
        try {
            if (reset) {
                setLoading(true);
                setLogs([]); // Clear existing logs when resetting
            } else {
                setLoadingMore(true);
            }

            const [newLogs, moreAvailable] = await fetchAllFilteredLogForUser(
                authState.accessToken!,
                selectedTables,
                newLimit // Use the newLimit parameter directly
            );

            setLogs(newLogs);
            setHasMore(moreAvailable);
            setLimit(newLimit);
        } catch (err) {
            setError("Failed to load activity logs");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (authState.accessToken) {
            const timer = setTimeout(() => {
                loadLogs(20, true);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [authState.accessToken, selectedTables]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            loadLogs(limit + 20);
        }
    };

    const handleShowLess = () => {
        loadLogs(20, false);
    };

    const toggleTableFilter = (table: string) => {
        setSelectedTables(prev => {
            const newTables = prev.includes(table)
                ? prev.filter(t => t !== table)
                : [...prev, table];
            return newTables;
        });
    };

    const toggleGroupFilter = (tables: string[]) => {
        const allSelected = tables.every(table => selectedTables.includes(table));

        setSelectedTables(prev => {
            if (allSelected) {
                return prev.filter(table => !tables.includes(table));
            } else {
                const newTables = [...prev];
                tables.forEach(table => {
                    if (!newTables.includes(table)) {
                        newTables.push(table);
                    }
                });
                return newTables;
            }
        });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setFilterOpen(false);
            }
        };

        if (filterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [filterOpen]);

    const selectAllFilters = () => {
        setSelectedTables(DEFAULT_TABLES);
    };

    const clearAllFilters = () => {
        setSelectedTables([]);
    };

    // scroll to top check
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollToTop(true);
            } else {
                setShowScrollToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // scroll to top
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

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
            case 'users':
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
            case 'users':
                return "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
            default:
                return "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
        }
    };

    const getChangedItemName = (log: AllLog) => {
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

    const getChangedItemType = (log: AllLog) => {
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
            case 'users':
                return 'User';
            default:
                return log.table_name;
        }
    };

    const renderProjectLink = (log: AllLog) => {
        if (!log.projectName) return null;

        const projectId = log.new_data?.project_id || log.old_data?.project_id || log.new_data?.id || log.old_data?.id || null;
        return (
            <Link
                to={`/projects/${projectId}`}
                className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                {log.projectName}
            </Link>
        );
    };

    const renderTaskLink = (log: AllLog) => {
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

    const renderMilestoneLink = (log: AllLog) => {
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

    const renderFileLink = (log: AllLog) => {
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

    const renderLabelLink = (log: AllLog) => {
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

    const renderProfileLink = ({ children }: { children: React.ReactNode }) => (
        <Link
            to="/profile"
            className="underline hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
            {children}
        </Link>
    );

    const getChangedByDisplay = (log: AllLog) => {
        if (log.table_name === 'users') {
            return "You";
        }

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

    const renderParentTaskConnection = (log: AllLog) => {
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

    const getActionDescription = (log: AllLog) => {
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
            case 'users':
                const changedFields = [];
                const userRef = log.user?.email === authState.user?.email ? "your" : "their";
                const userRefYou = log.user?.email === authState.user?.email ? "You" : "They";
                const userRefYour = log.user?.email === authState.user?.email ? "your" : "their";

                // Format function for premium dates
                const formatPremiumDate = (dateString: string | null) => {
                    if (!dateString) return 'Not set';
                    return format(new Date(dateString), 'MMM d, yyyy H:mm');
                };

                // User creation
                if (log.operation.toLowerCase() === 'insert') {
                    return (
                        <>{userRefYou} created an {renderProfileLink({ children: "account" })}</>
                    );
                }

                // User deletion
                if (log.operation.toLowerCase() === 'delete') {
                    return (
                        <>{userRefYou} deleted {renderProfileLink({ children: `${userRef} account` })}</>
                    );
                }

                // Premium subscription changes
                if (log.old_data?.is_premium !== log.new_data?.is_premium) {
                    if (log.new_data?.is_premium) {
                        return (
                            <>
                                {userRefYou} upgraded to {renderProfileLink({ children: "Premium" })}
                            </>
                        )
                    } else {
                        return (
                            <>
                                {userRefYou} downgraded to {renderProfileLink({ children: "Free plan" })}
                            </>
                        )
                    }
                }

                // Premium cancellation
                if (log.old_data?.user_cancelled_premium !== log.new_data?.user_cancelled_premium) {
                    if (log.new_data?.user_cancelled_premium) {
                        return (
                            <>
                                {userRefYou} cancelled {userRefYour} {renderProfileLink({ children: "Premium" })} subscription
                            </>
                        )
                    } else {
                        return (
                            <>
                                {userRefYou} reactivated {userRefYour} {renderProfileLink({ children: "Premium" })} subscription
                            </>
                        )
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
                    return (
                        <>{userRefYou} updated {userRef} {renderProfileLink({ children: `profile` })}</>
                    );
                }

                return (
                    <div className="space-y-1">
                        <span className="font-medium">
                            {userRefYou} updated {userRef} {renderProfileLink({ children: `profile` })}:
                        </span>
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

    const getAdditionalDetails = (log: AllLog) => {
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
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-w-md w-full p-6 text-center">
                    <FaExclamationCircle className="mx-auto text-red-500 text-5xl mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Logs not found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Error fetching logs
                    </p>
                    <button
                        onClick={() => navigate("/dashboard", { replace: true })}
                        className="inline-flex items-center cursor-pointer justify-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium rounded-lg shadow-sm transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-24 h-24 mb-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <FaInfoCircle className="text-4xl text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No activity found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                    {selectedTables.length > 0
                        ? "No logs match your current filters. Try adjusting your filters or reset to see all activities."
                        : "There are no activity logs to display at this time."}
                </p>
                {selectedTables.length > 0 && (
                    <button
                        onClick={clearAllFilters}
                        className="inline-flex items-center cursor-pointer justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <FaFilter className="mr-2" />
                        Reset all filters
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header with filter button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer"
                    >
                        <FaArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Track all changes and activities across your projects
                        </p>
                    </div>
                </div>

                <div className="relative w-full sm:w-auto" ref={filterRef}>
                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <FaFilter className="text-indigo-500 dark:text-indigo-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filters
                            </span>
                            {selectedTables.length > 0 && (
                                <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {selectedTables.length}
                                </span>
                            )}
                        </div>
                        {filterOpen ? (
                            <FaChevronUp className="text-gray-500 dark:text-gray-400 text-xs" />
                        ) : (
                            <FaChevronDown className="text-gray-500 dark:text-gray-400 text-xs" />
                        )}
                    </button>

                    {/* Filter dropdown */}
                    {filterOpen && (
                        <div className="absolute right-0 mt-2 w-full sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium text-gray-900 dark:text-white">Filter Activity</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline cursor-pointer transition-colors"
                                        >
                                            Clear all
                                        </button>
                                        <button
                                            onClick={selectAllFilters}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline cursor-pointer transition-colors"
                                        >
                                            Select all
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 max-h-96 overflow-y-auto">
                                {filterGroups.map((group) => {
                                    const groupSelected = group.tables.some(table => selectedTables.includes(table));
                                    const allSelected = group.tables.every(table => selectedTables.includes(table));

                                    return (
                                        <div key={group.name} className="mb-4 last:mb-0">
                                            <button
                                                onClick={() => toggleGroupFilter(group.tables)}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${groupSelected ? group.color : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${group.color}`}>
                                                        {group.icon}
                                                    </div>
                                                    <span className={`font-medium ${groupSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {group.name}
                                                    </span>
                                                </div>
                                                <div className={`h-2 w-2 rounded-full ${allSelected ? 'bg-indigo-500' : groupSelected ? 'bg-indigo-300' : 'bg-gray-300'}`}></div>
                                            </button>

                                            <div className="mt-2 pl-4 space-y-2">
                                                {group.tables.map((table) => (
                                                    <div
                                                        key={table}
                                                        className="flex items-center pl-4 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                                        onClick={() => toggleTableFilter(table)}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id={`filter-${table}`}
                                                            checked={selectedTables.includes(table)}
                                                            onChange={() => toggleTableFilter(table)}
                                                            className="h-4 w-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 cursor-pointer"
                                                        />
                                                        <label
                                                            htmlFor={`filter-${table}`}
                                                            className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                                                        >
                                                            {getChangedItemType({ table_name: table } as AllLog)}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Active filters chips */}
            {selectedTables.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    {selectedTables.map((table) => (
                        <div
                            key={table}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200"
                        >
                            {getChangedItemType({ table_name: table } as AllLog)}
                            <button
                                onClick={() => toggleTableFilter(table)}
                                className="ml-2 -mr-1 cursor-pointer text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                    {selectedTables.length > 1 && (
                        <button
                            onClick={clearAllFilters}
                            className="inline-flex cursor-pointer items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            )}

            {/* Logs list */}
            <div className="space-y-4">
                {logs.map((log) => (
                    <div
                        key={log.id}
                        className="group relative p-5 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all duration-200"
                    >
                        <div className="flex gap-4">
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
                                        {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                                    </span>
                                    {getAdditionalDetails(log) && (
                                        <span className="bg-gray-100 dark:bg-gray-700/50 rounded-full px-2.5 py-0.5">
                                            {getAdditionalDetails(log)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load more button */}
            {hasMore && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        className="px-5 py-2.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        disabled={loadingMore}
                    >
                        {loadingMore ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Loading...
                            </>
                        ) : (
                            'Load More Activity'
                        )}
                    </button>
                </div>
            )}

            {!hasMore && logs.length > 0 && (
                <div className="flex flex-col items-center gap-4 mt-8">
                    <div className="text-center text-gray-500 dark:text-gray-400 py-2">
                        You've reached the end of activity logs
                    </div>
                    {limit > 20 && (
                        <button
                            onClick={handleShowLess}
                            className="px-5 py-2.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                            disabled={loadingMore}
                        >
                            {loadingMore ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                    Loading...
                                </>
                            ) : (
                                'Show Less Activity'
                            )}
                        </button>
                    )}
                </div>
            )}

            {showScrollToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed right-6 cursor-pointer bottom-6 p-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-full shadow-lg transition-all duration-200 z-50"
                    aria-label="Scroll to top"
                >
                    <FaArrowUp className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};