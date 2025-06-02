import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaBan, FaCrown, FaFlag, FaList, FaPlus, FaTags, FaThLarge, FaUsers } from 'react-icons/fa';
import { fetchAllTasksForProjectWithNoParent } from '../../../services/taskService';
import { TaskBoard } from './taskComponents/board/TaskBoard';
import { TaskList } from './taskComponents/list/TaskList';
import { fetchProjectById } from '../../../services/projectService';
import { getProjectMembers } from '../../../services/projectMemberService';
import { useAuth } from '../../../hooks/useAuth';
import { Task } from '../../../types/task';
import { MilestonesManagerPage } from './taskComponents/milestones/MilestonesManaggerPage';
import { LabelsManagerPage } from './taskComponents/labels/LabelsManagger';
import { getAllMilestonesForProject, getAllTaskForMilestoneWithSubtasks } from '../../../services/milestonesService';
import toast from 'react-hot-toast';

export const TasksManagerPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const location = useLocation();
    const [project, setProject] = useState<Project | null>(null);
    const { authState } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);

    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

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

    // Load tasks when milestone selection changes
    useEffect(() => {
        const loadTasksForMilestone = async () => {
            if (!selectedMilestone || selectedMilestone === 'all') {
                setFilteredTasks(tasks);
                return;
            }

            try {
                const milestoneTasks = await getAllTaskForMilestoneWithSubtasks(
                    selectedMilestone,
                    projectId!,
                    authState.accessToken!,
                    "priority",
                    "asc"
                );
                setFilteredTasks(milestoneTasks);
                console.log(milestoneTasks);
            } catch (error) {
                console.error("Failed to load tasks for milestone:", error);
                toast.error("Failed to load tasks for milestone");
                setFilteredTasks([]);
            }
        };

        loadTasksForMilestone();
    }, [selectedMilestone, projectId, authState.accessToken, tasks]);

    // Set initial milestone selection
    useEffect(() => {
        if (milestones.length > 0 && !selectedMilestone) {
            // Find milestones with future due dates
            const futureMilestones = milestones.filter(m =>
                m.due_date && new Date(m.due_date) > new Date()
            ).sort((a, b) =>
                new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
            );

            if (futureMilestones.length > 0) {
                setSelectedMilestone(futureMilestones[0].id);
            } else {
                // If no future milestones, sort by creation date (newest first)
                const sortedByCreation = [...milestones].sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setSelectedMilestone(sortedByCreation[0].id);
            }
        }
    }, [milestones]);

    // Update filtered tasks when main tasks change and no specific milestone is selected
    useEffect(() => {
        if (!selectedMilestone || selectedMilestone === 'all') {
            setFilteredTasks(tasks);
        }
    }, [tasks]);

    useEffect(() => {
        const loadTasks = async () => {
            try {

                const [projectData, allTasks, allMilestones] = await Promise.all([
                    fetchProjectById(projectId!, authState.accessToken!),
                    fetchAllTasksForProjectWithNoParent(projectId!, authState.accessToken!, "priority", "asc"),
                    getAllMilestonesForProject(projectId!, authState.accessToken!),
                ]);



                setLoading(true);
                setProject(projectData);
                setTasks(allTasks);
                setMilestones(allMilestones);

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
                    <div className='flex-1 min-w-0'>
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(`/projects/${projectId}`)}
                                className="mr-4 p-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                            >
                                <FaArrowLeft />
                            </button>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{project?.name}</h1>
                                {project?.read_only && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-300">
                                        <FaBan className="mr-1" size={10} />
                                        Read Only
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400 ml-10">
                            Managing tasks for <span className="font-semibold">{project?.name}</span>
                        </p>
                    </div>
                    {canManageTasks && !project?.read_only && (
                        <button
                            onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
                            className="inline-flex cursor-pointer items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow transition-all"
                        >
                            <FaPlus className="mr-2" /> New Task
                        </button>
                    )}
                </div>

                {/* Read-only Warning Banner */}
                {project?.read_only && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-xl p-6 mb-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <FaBan className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Read-Only Project</h3>
                                <div className="mt-2 text-red-700 dark:text-red-200">
                                    <p>This project is currently in read-only mode because:</p>
                                    <ul className="list-disc list-inside mt-2 ml-4">
                                        <li>The premium subscription for this project has been canceled</li>
                                        <li>This project is using premium features (more than 5 team members)</li>
                                    </ul>

                                    {authState.user.id === project!.owner_id ? (
                                        <div className="mt-4">
                                            <div className="flex items-center mb-3">
                                                <FaUsers className="mr-2" />
                                                <p>To unlock task management, reduce the number of project members to 5 or fewer</p>
                                            </div>
                                            <button
                                                onClick={() => navigate('/profile')}
                                                className="inline-flex cursor-pointer items-center justify-center gap-2 mt-4 px-5 py-2.5 border border-transparent text-white bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-xl font-medium shadow-sm hover:shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                            >
                                                <FaCrown className="text-yellow-300 dark:text-yellow-200" />
                                                Upgrade to Premium
                                            </button>

                                        </div>
                                    ) : (
                                        <div className="mt-4 flex items-center">
                                            <FaUsers className="mr-2" />
                                            <p>Contact the project owner to unlock task management</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                            <TaskBoard tasks={tasks} setTasks={setTasks} onTaskUpdate={handleTaskUpdate} canManageTasks={canManageTasks} project={project} />
                        ) : view === 'list' ? (
                            <TaskList filteredTasks={filteredTasks} setTasks={setTasks} canManageTasks={canManageTasks} project={project} milestones={milestones} selectedMilestone={selectedMilestone} onMilestoneChange={setSelectedMilestone} />
                        ) : view === 'milestones' ? (
                            <MilestonesManagerPage project={project} />
                        ) : (
                            <LabelsManagerPage project={project} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};