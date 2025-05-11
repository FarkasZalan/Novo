import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaFlag, FaList, FaPlus, FaTags, FaThLarge } from 'react-icons/fa';
import { fetchAllTasksForProject } from '../../../services/taskService';
import { TaskBoard } from './taskComponents/board/TaskBoard';
import { TaskList } from './taskComponents/list/TaskList';
import { fetchProjectById } from '../../../services/projectService';
import { getProjectMembers } from '../../../services/projectMemberService';
import { useAuth } from '../../../hooks/useAuth';
import { Task } from '../../../types/task';
import { MilestonesManagerPage } from './taskComponents/milestones/MilestonesManaggerPage';
import { LabelsManagerPage } from './taskComponents/labels/LabelsManagger';

export const TasksManagerPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const location = useLocation();
    const [project, setProject] = useState<any>(null);
    const { authState } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'board' | 'list' | 'milestones' | 'labels'>('board');
    const [canManageTasks, setCanManageTasks] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.has('milestones')) {
            setView('milestones');
            // Clean the URL by replacing it without the query parameters
            navigate(location.pathname, { replace: true });
        } else if (searchParams.has('labels')) {
            setView('labels');
            // Clean the URL by replacing it without the query parameters
            navigate(location.pathname, { replace: true });
        }
    }, [location.search, location.pathname, navigate]);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                setLoading(true);
                const data = await fetchAllTasksForProject(projectId!, authState.accessToken!, "priority", "asc");
                const projectData = await fetchProjectById(projectId!, authState.accessToken!);
                setProject(projectData);
                const tasksWithNoParent = data.filter((task: Task) => !task.parent_task_id);
                console.log(data);
                setTasks(tasksWithNoParent);

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

    const handleTaskUpdate = (updatedTask: Task) => {
        setTasks(currentTasks =>
            currentTasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
            )
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 md:px-12 transition-colors duration-300">
            <div className="max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(`/projects/${projectId}`)}
                                className="mr-4 p-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                            >
                                <FaArrowLeft />
                            </button>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{project?.name}</h1>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400 ml-10">
                            Managing tasks for <span className="font-semibold">{project?.name}</span>
                        </p>
                    </div>
                    {canManageTasks && (
                        <button
                            onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
                            className="inline-flex cursor-pointer items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow transition-all"
                        >
                            <FaPlus className="mr-2" /> New Task
                        </button>
                    )}
                </div>

                {/* View Toggle */}
                <div className="flex flex-wrap bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
                    {[
                        { label: 'Board', icon: <FaThLarge />, key: 'board' },
                        { label: 'List', icon: <FaList />, key: 'list' },
                        { label: 'Milestones', icon: <FaFlag />, key: 'milestones' },
                        { label: 'Labels', icon: <FaTags />, key: 'labels' }
                    ].map(({ label, icon, key }) => (
                        <button
                            key={key}
                            onClick={() => setView(key as typeof view)}
                            className={`flex items-center px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all cursor-pointer flex-1 min-w-[100px] sm:min-w-0 justify-center ${view === key
                                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {icon}
                            <span className="ml-1 sm:ml-2">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-80 flex-col">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-500 dark:text-gray-300">Loading tasks...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
                        {error}
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {view === 'board' ? (
                            <TaskBoard tasks={tasks} setTasks={setTasks} onTaskUpdate={handleTaskUpdate} canManageTasks={canManageTasks} />
                        ) : view === 'list' ? (
                            <TaskList tasks={tasks} setTasks={setTasks} canManageTasks={canManageTasks} />
                        ) : view === 'milestones' ? (
                            <MilestonesManagerPage />
                        ) : (
                            <LabelsManagerPage />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};