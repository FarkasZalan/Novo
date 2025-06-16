import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTasks, FaChevronRight, FaPlus, FaPaperclip, FaFlag, FaTag, FaBan, FaCalendarDay, FaUsers, FaCrown } from "react-icons/fa";
import { fetchAllTasksForProject } from "../../../../../services/taskService";
import { fetchProjectById } from "../../../../../services/projectService";
import { getProjectMembers } from "../../../../../services/projectMemberService";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { useAuth } from "../../../../../hooks/useAuth";
import { TaskAssignments } from "../../../task/taskComponents/assignments/TaskAssignments";
import { Task } from "../../../../../types/task";
import { CommentComponent } from "../../../task/taskComponents/taskDetails/Comments/Comments";

export const TasksTab = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const navigate = useNavigate();
    const [canManageTasks, setCanManageTasks] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                setLoading(true);
                const data = await fetchAllTasksForProject(projectId!, authState.accessToken!, "updated_at", "desc");
                const projectData = await fetchProjectById(projectId!, authState.accessToken!);
                setTasks(data);
                setProject(projectData);

                // Check if current user is owner or admin
                if (projectData.owner_id === authState.user?.id) {
                    setCanManageTasks(true);
                } else {
                    // Check if user is admin
                    const members = await getProjectMembers(projectId!, authState.accessToken!);
                    const [activeMembers = []] = members;
                    const currentUserMember = activeMembers.find(
                        (member: any) => member.user_id === authState.user?.id
                    );
                    if (currentUserMember && currentUserMember.role === "admin") {
                        setCanManageTasks(true);
                    }
                }
            } catch (err) {
                setError('Failed to load tasks');
            } finally {
                setLoading(false);
            }
        };

        if (projectId && authState.accessToken) loadTasks();
    }, [projectId, authState.accessToken]);

    const handleNavigateToTaskManager = () => {
        navigate(`/projects/${projectId}/tasks`);
    };

    const handleCreateNewTask = () => {
        navigate(`/projects/${projectId}/tasks/new`);
    };

    const getLabelTextColor = (hexColor: string) => {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? 'text-gray-900' : 'text-white';
    };

    const renderParentTaskInfo = (task: Task) => {
        if (!task.parent_task_id) return null;

        return (
            <div className="mt-2.5 group/parent relative">
                <div
                    className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg p-1.5 max-w-fit"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${projectId}/tasks/${task.parent_task_id}`);
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
                        <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[120px] sm:max-w-[150px]">
                            {task.parent_task_name || 'Parent Task'}
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

    return (
        <div className="p-3 sm:p-6">

            {/* Read-only Warning Banner */}
            {project?.read_only && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 sm:p-6 mb-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <FaBan className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-base sm:text-lg font-medium text-red-800 dark:text-red-300">Read-Only Project</h3>
                            <div className="mt-2 text-sm sm:text-base text-red-700 dark:text-red-200">
                                <p>This project is currently in read-only mode because:</p>
                                <ul className="list-disc list-inside mt-2 ml-2 sm:ml-4 space-y-1">
                                    <li>The premium subscription for this project has been canceled</li>
                                    <li>This project is using premium features (more than 5 team members)</li>
                                </ul>

                                {authState.user.id === project!.owner_id ? (
                                    <div className="mt-4">
                                        <div className="flex items-start sm:items-center mb-3">
                                            <FaUsers className="mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
                                            <p className="text-sm sm:text-base">To unlock task management, reduce the number of project members to 5 or fewer</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="inline-flex cursor-pointer items-center justify-center gap-2 mt-4 px-4 py-2 sm:px-5 sm:py-2.5 border border-transparent text-white bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-xl font-medium shadow-sm hover:shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm sm:text-base"
                                        >
                                            <FaCrown className="text-yellow-300 dark:text-yellow-200" />
                                            Upgrade to Premium
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex items-start sm:items-center">
                                        <FaUsers className="mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
                                        <p className="text-sm sm:text-base">Contact the project owner to unlock task management</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section - Responsive */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6 sm:mb-8">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-0">
                            Recent Tasks
                        </h2>
                        {tasks.length > 0 && (
                            <span className="inline-flex items-center text-xs sm:text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full sm:ml-3 self-start">
                                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                            </span>
                        )}
                    </div>
                </div>

                {canManageTasks && !project?.read_only && (
                    <button
                        onClick={handleCreateNewTask}
                        className="px-3 py-2 sm:px-4 sm:py-2 cursor-pointer flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md text-sm sm:text-base w-full sm:w-auto"
                    >
                        <FaPlus className="text-sm" />
                        <span>New Task</span>
                    </button>
                )}
            </div>

            {/* Tasks Preview */}
            <div className="space-y-3 sm:space-y-4">
                {loading ? (
                    <div className="py-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-red-500 dark:text-red-400">
                        <p>{error}</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-center">
                        <FaTasks className="text-3xl sm:text-4xl mb-3" />
                        <p className="text-base sm:text-lg">No tasks found for this project</p>
                        {canManageTasks && <p className="text-sm mt-1">Create a task to get started</p>}
                        {canManageTasks && (
                            <button
                                onClick={handleNavigateToTaskManager}
                                className="mt-4 px-4 py-2 cursor-pointer flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                            >
                                <FaPlus />
                                <span>Open Task Manager</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Display only first 3 tasks */}
                        {tasks.slice(0, 3).map((task, index) => (
                            <div
                                key={task.id || index}
                                className="cursor-pointer group p-3 sm:p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                                    {/* Left section with completion indicator and title */}
                                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                                        {/* Enhanced completion status indicator */}
                                        <div
                                            className={`flex-shrink-0 mt-0.5 sm:mt-1 h-5 w-5 sm:h-6 sm:w-6 rounded-md flex items-center justify-center transition-all duration-300 ease-in-out
                                                ${task.status === "completed"
                                                    ? "bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-600"
                                                    : task.status === "in-progress"
                                                        ? "bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-600"
                                                        : task.status === "blocked"
                                                            ? "bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-600"
                                                            : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                                }`}
                                        >
                                            {task.status === "completed" ? (
                                                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : task.status === "in-progress" ? (
                                                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            ) : task.status === "not-started" ? (
                                                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : task.status === "blocked" ? (
                                                <FaBan className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-600 dark:text-red-400" />
                                            ) : null}
                                        </div>

                                        {/* Title and metadata */}
                                        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3
                                                    className={`font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base pr-2
                                                    ${task.status === "completed" ? "line-through opacity-70" : ""}`}
                                                >
                                                    {task.title || `Task ${index + 1}`}
                                                </h3>

                                                {/* Priority Badge - Mobile positioned next to title */}
                                                <div className="sm:hidden flex-shrink-0">
                                                    <div
                                                        className={`px-2 py-0.5 text-xs rounded-full font-semibold
                                                            ${task.priority === "high"
                                                                ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                                                                : task.priority === "medium"
                                                                    ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                                                                    : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                                                            }`}
                                                    >
                                                        {task.priority || "normal"}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Milestone and Labels row */}
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                {/* Milestone */}
                                                {task.milestone_id && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 hover:underline cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/projects/${projectId}/milestones/${task.milestone_id}`)
                                                        }}
                                                        style={{
                                                            backgroundColor: `${task.milestone_color}20`,
                                                            border: `1px solid ${task.milestone_color}40`
                                                        }}
                                                    >
                                                        <FaFlag className="mr-1 h-2.5 w-2.5 sm:mr-1.5 sm:h-3 sm:w-3" style={{ color: task.milestone_color }} />
                                                        <span className="truncate max-w-[80px] sm:max-w-none">{task.milestone_name || "Milestone"}</span>
                                                    </span>
                                                )}

                                                {/* Labels */}
                                                {task.labels && task.labels.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {/* Show fewer labels on mobile */}
                                                        {task.labels.slice(0, window.innerWidth < 640 ? 2 : 3).map((label: any) => {
                                                            const hexColor = label.color.startsWith('#') ? label.color : `#${label.color}`;
                                                            const textColor = getLabelTextColor(hexColor);
                                                            return (
                                                                <span
                                                                    key={label.id}
                                                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${textColor}`}
                                                                    style={{
                                                                        backgroundColor: hexColor,
                                                                        border: `1px solid ${hexColor}80`
                                                                    }}
                                                                >
                                                                    <FaTag className="mr-1" size={8} />
                                                                    <span className="truncate max-w-[60px] sm:max-w-none">{label.name}</span>
                                                                </span>
                                                            );
                                                        })}

                                                        {/* +X more labels indicator */}
                                                        {task.labels.length > (window.innerWidth < 640 ? 2 : 3) && (
                                                            <div className="relative inline-block">
                                                                <span
                                                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 cursor-default hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors peer"
                                                                >
                                                                    +{task.labels.length - (window.innerWidth < 640 ? 2 : 3)}
                                                                </span>

                                                                {/* Hidden labels popup - Hidden on mobile for simplicity */}
                                                                <div className="absolute z-50 hidden sm:peer-hover:block bottom-full mb-2 left-0 min-w-max bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border border-gray-200 dark:border-gray-700">
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {task.labels.slice(3).map((label: any) => {
                                                                            const hexColor = label.color.startsWith('#') ? label.color : `#${label.color}`;
                                                                            const textColor = getLabelTextColor(hexColor);
                                                                            return (
                                                                                <span
                                                                                    key={label.id}
                                                                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${textColor}`}
                                                                                    style={{
                                                                                        backgroundColor: hexColor,
                                                                                        border: `1px solid ${hexColor}80`
                                                                                    }}
                                                                                >
                                                                                    <FaTag className="mr-1" size={10} />
                                                                                    {label.name}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    {/* Tooltip arrow */}
                                                                    <div className="absolute -bottom-1 left-2 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45 -z-10"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {renderParentTaskInfo(task)}

                                            {/* Second row with due date, attachments, assignments */}
                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                {/* Due Date */}
                                                {task.due_date && (
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${task.status !== 'completed'
                                                            ? isPast(new Date(task.due_date)) || isToday(new Date(task.due_date))
                                                                ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                                                                : isTomorrow(new Date(task.due_date))
                                                                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
                                                                    : "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                                            }`}
                                                    >
                                                        <FaCalendarDay className="mr-1" size={8} />
                                                        <span className="whitespace-nowrap">
                                                            {format(new Date(task.due_date), 'MMM d')}
                                                            {task.status !== 'completed' && isToday(new Date(task.due_date)) && (
                                                                <span className="hidden sm:inline"> • Today</span>
                                                            )}
                                                            {task.status !== 'completed' && isTomorrow(new Date(task.due_date)) && (
                                                                <span className="hidden sm:inline"> • Tomorrow</span>
                                                            )}
                                                        </span>
                                                    </span>
                                                )}

                                                {/* Attachments */}
                                                {task.attachments_count > 0 && (
                                                    <span className="inline-flex items-center text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                                        <FaPaperclip className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                        {task.attachments_count}
                                                    </span>
                                                )}

                                                {/* Comments */}
                                                <CommentComponent
                                                    taskId={task.id}
                                                    projectId={projectId!}
                                                    canManageTasks={canManageTasks}
                                                    compactMode={true}
                                                    project={project!}
                                                />

                                                {/* Assignments */}
                                                <div className="flex items-center">
                                                    <TaskAssignments
                                                        showAssignButtonInCompactMode={true}
                                                        taskIdFromCompactMode={task.id}
                                                        pendingUsers={[]}
                                                        setPendingUsers={() => { }}
                                                        compactMode={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right section with priority and arrow - Desktop only */}
                                    <div className="hidden sm:flex items-center space-x-2 self-center">
                                        {/* Priority Badge */}
                                        <div
                                            className={`px-3 py-1 text-xs rounded-full font-semibold
                                                ${task.priority === "high"
                                                    ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                                                    : task.priority === "medium"
                                                        ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                                                        : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                                                }`}
                                        >
                                            {task.priority || "normal"}
                                        </div>

                                        {/* Arrow indicator */}
                                        <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                                            <FaChevronRight className="text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" size={12} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Enhanced View All section */}
                        <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                                Showing {Math.min(3, tasks.length)} of {tasks.length} tasks
                            </span>
                            <button
                                onClick={handleNavigateToTaskManager}
                                className="px-4 py-2 cursor-pointer flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md text-sm sm:text-base w-full sm:w-auto"
                            >
                                <span>Open Task Manager</span>
                                <FaChevronRight className="ml-2" size={12} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};