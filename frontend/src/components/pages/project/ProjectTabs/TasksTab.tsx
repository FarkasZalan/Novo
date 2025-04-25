import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaTasks, FaChevronRight, FaPlus } from "react-icons/fa";
import { useAuth } from "../../../../context/AuthContext";
import { fetchAllTasksForProject } from "../../../../services/taskService";
import { fetchProjectById } from "../../../../services/projectService";
import { getProjectMembers } from "../../../../services/projectMemberService";

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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Tasks</h2>
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
                        <p className="text-sm mt-1">Create your first task to get started</p>
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
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 group p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 cursor-pointer"
                                onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4">
                                        {/* Modern completion indicator */}
                                        <div className={`flex-shrink-0 mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200
                                            ${task.status === "completed"
                                                ? "bg-indigo-500 border-indigo-500 dark:bg-indigo-600 dark:border-indigo-600"
                                                : "border-gray-300 dark:border-gray-500 group-hover:border-indigo-400"}`}
                                        >
                                            {task.status === "completed" && (
                                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-medium text-gray-900 dark:text-gray-100 truncate ${task.status === "completed" ? "line-through opacity-80" : ""}`}>
                                                {task.title || `Task ${index + 1}`}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {task.assigned_to && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        {task.assigned_to}
                                                    </span>
                                                )}
                                                {task.due_date && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                        Due {new Date(task.due_date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`px-2.5 py-1 text-xs rounded-full font-medium
                                            ${task.priority === "high"
                                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                                : task.priority === "medium"
                                                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                                                    : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                            }`}>
                                            {task.priority || "normal"}
                                        </div>
                                        <FaChevronRight className="text-gray-400 group-hover:text-indigo-500 transition-colors" size={12} />
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