import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTasks, FaChevronRight, FaPlus, FaPaperclip, FaFlag, FaTag } from "react-icons/fa";
import { fetchAllTasksForProject } from "../../../../services/taskService";
import { fetchProjectById } from "../../../../services/projectService";
import { getProjectMembers } from "../../../../services/projectMemberService";
import { isPast, isToday, isTomorrow } from "date-fns";
import { useAuth } from "../../../../hooks/useAuth";
import { TaskAssignments } from "../../task/taskHandler/assignments/TaskAssignments";

export const TasksTab = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const navigate = useNavigate();
    const [canManageTasks, setCanManageTasks] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                setLoading(true);
                const data = await fetchAllTasksForProject(projectId!, authState.accessToken!, "updated_at", "desc");
                const projectData = await fetchProjectById(projectId!, authState.accessToken!);
                setTasks(data);

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
                console.error(err);
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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Recent Tasks
                    {tasks.length > 0 && (
                        <span className="ml-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                            {tasks.length} {tasks.length === 1 ? 'task in total' : 'tasks in total'}
                        </span>
                    )}
                </h2>
                {canManageTasks && (
                    <div className="flex space-x-3">
                        <button
                            onClick={handleCreateNewTask}
                            className="px-4 py-2 cursor-pointer flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                            <FaPlus className="text-sm" />
                            <span>New Task</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Tasks Preview */}
            <div className="space-y-3">
                {loading ? (
                    <div className="py-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-red-500 dark:text-red-400">
                        <p>{error}</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <FaTasks className="text-4xl mb-3" />
                        <p className="text-lg">No tasks found for this project</p>
                        {canManageTasks && <p className="text-sm mt-1">Create a task to get started</p>}
                        {canManageTasks && (
                            <button
                                onClick={handleNavigateToTaskManager}
                                className="mt-4 px-4 py-2 cursor-pointer flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200"
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
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 group p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 cursor-pointer"
                                onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    {/* Left section with completion indicator and title */}
                                    <div className="flex items-start space-x-3 flex-1">
                                        {/* Enhanced completion status indicator */}
                                        <div
                                            className={`flex-shrink-0 mt-1 h-6 w-6 rounded-md flex items-center justify-center transition-all duration-300 ease-in-out
                                                ${task.status === "completed"
                                                    ? "bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-600"
                                                    : task.status === "in-progress"
                                                        ? "bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-600"
                                                        : task.status === "not-started"
                                                            ? "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                                            : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                                } 
                                               `}
                                        >
                                            {task.status === "completed" ? (
                                                <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : task.status === "in-progress" ? (
                                                <svg className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            ) : task.status === "not-started" ? (
                                                <svg className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Title and metadata */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center">
                                                <h3
                                                    className={`font-medium text-gray-900 dark:text-gray-100 truncate text-base
                                                    ${task.status === "completed" ? "line-through opacity-70" : ""}`}
                                                >
                                                    {task.title || `Task ${index + 1}`}
                                                </h3>
                                            </div>

                                            {/* Milestone and Labels row */}
                                            <div className="flex flex-wrap gap-2 mt-2.5">
                                                {/* Milestone */}
                                                {task.milestone_id && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/70">
                                                        <FaFlag className="mr-1.5" size={10} />
                                                        {task.milestone_name || "Milestone"}
                                                    </span>
                                                )}

                                                {/* Labels */}
                                                {task.labels && task.labels.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {/* First 3 visible labels */}
                                                        {task.labels.slice(0, 3).map((label: any) => {
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

                                                        {/* +X more labels indicator */}
                                                        {task.labels.length > 3 && (
                                                            <div className="relative inline-block">
                                                                <span
                                                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 cursor-default hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors peer"
                                                                >
                                                                    +{task.labels.length - 3}
                                                                </span>

                                                                {/* Hidden labels popup - appears ONLY on +X hover */}
                                                                <div className="absolute z-50 hidden peer-hover:block bottom-full mb-2 left-0 min-w-max bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border border-gray-200 dark:border-gray-700">
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

                                            {/* Second row with due date, attachments, assignments */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {/* Due Date */}
                                                {task.due_date && (
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
                                                            ${task.status !== 'completed'
                                                                ? isPast(new Date(task.due_date)) || isToday(new Date(task.due_date))
                                                                    ? "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800/50"
                                                                    : isTomorrow(new Date(task.due_date))
                                                                        ? "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50"
                                                                        : "bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                                                                : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                                                            }`}
                                                    >
                                                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M3.5 9.09H20.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        {new Date(task.due_date).toLocaleDateString()}
                                                        {task.status !== 'completed' && isToday(new Date(task.due_date)) && (
                                                            <span className="ml-1 text-xs font-semibold">(Today)</span>
                                                        )}
                                                        {task.status !== 'completed' && isTomorrow(new Date(task.due_date)) && (
                                                            <span className="ml-1 text-xs font-semibold">(Tomorrow)</span>
                                                        )}
                                                    </span>
                                                )}

                                                {/* Attachments */}
                                                {task.attachments_count > 0 && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                                        <FaPaperclip className="mr-1" size={10} />
                                                        {task.attachments_count}
                                                    </span>
                                                )}

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

                                    {/* Right section with priority and arrow */}
                                    <div className="flex items-center space-x-2 self-center">
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
                        <div className="pt-2 flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {Math.min(3, tasks.length)} of {tasks.length} tasks
                            </span>
                            <button
                                onClick={handleNavigateToTaskManager}
                                className="px-4 py-2 cursor-pointer flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                            >
                                Open Task Manager
                                <FaChevronRight className="ml-2" size={12} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};