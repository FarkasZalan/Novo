import React, { useState, useEffect, useMemo } from 'react';
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
import { getAllMilestonesForProject } from '../../../services/milestonesService';
import { getAllLabelForProject } from '../../../services/labelService';

export const TasksManagerPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const location = useLocation();
    const [project, setProject] = useState<Project | null>(null);
    const { authState } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'board' | 'list' | 'milestones' | 'labels'>('board');
    const [canManageTasks, setCanManageTasks] = useState(false);
    const [projectLabels, setProjectLabels] = useState<Label[]>([]);
    const [activeFilters, setActiveFilters] = useState<Filter>({
        status: '',
        priority: '',
        labelIds: [],
        orderBy: 'due_date',
        orderDirection: 'desc'
    });

    // Derive filtered tasks from main tasks state
    const filteredTasks = useMemo(() => {
        let result = [...tasks];

        // Apply milestone filter first
        if (selectedMilestone && selectedMilestone !== 'all') {
            result = result.filter(task => task.milestone_id === selectedMilestone);
        }

        // Apply status filter
        if (activeFilters.status) {
            result = result.filter(task => task.status === activeFilters.status);
        }

        // Apply priority filter
        if (activeFilters.priority) {
            result = result.filter(task => task.priority === activeFilters.priority);
        }

        // Apply label filter
        if (activeFilters.labelIds && activeFilters.labelIds.length > 0) {
            result = result.filter(task => {
                const taskLabelIds = task.labels?.map(label => label.id) || [];
                return activeFilters.labelIds!.every(id => taskLabelIds.includes(id))
            });
        }

        // Apply sorting
        if (activeFilters.orderBy) {
            const orderDirection = activeFilters.orderDirection === 'asc' ? 1 : -1;

            result.sort((a, b) => {
                switch (activeFilters.orderBy) {
                    case 'due_date':
                        const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                        const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                        return (aDate - bDate) * orderDirection;

                    case 'updated_at':
                        return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * orderDirection;

                    default:
                        return 0;
                }
            });
        }

        return result;
    }, [tasks, selectedMilestone, activeFilters]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.has('milestones')) {
            setView('milestones');
            navigate(location.pathname, { replace: true });
        } else if (searchParams.has('labels')) {
            setView('labels');
            navigate(location.pathname, { replace: true });
        }
    }, [location.search, location.pathname, navigate]);

    const selectDefaultMilestone = (milestones: Milestone[]) => {
        if (milestones.length === 0) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to 00:00:00

        const futureOrTodayMilestones = milestones.filter(m =>
            m.due_date && new Date(m.due_date) >= today
        ).sort((a, b) =>
            new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
        );

        if (futureOrTodayMilestones.length > 0) {
            return futureOrTodayMilestones[0].id;
        } else {
            const sortedByCreation = [...milestones].sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            return sortedByCreation[0].id;
        }
    };

    useEffect(() => {
        if (milestones.length > 0 && !selectedMilestone) {
            const defaultMilestone = selectDefaultMilestone(milestones);
            setSelectedMilestone(defaultMilestone);
        }
    }, [milestones, selectedMilestone]);

    useEffect(() => {
        setSelectedMilestone(null);
        setActiveFilters({ status: '', priority: '', labelIds: [], orderBy: 'due_date', orderDirection: 'desc' });
    }, [view]);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const [projectData, allTasks, allMilestones, projectLabels] = await Promise.all([
                    fetchProjectById(projectId!, authState.accessToken!),
                    fetchAllTasksForProjectWithNoParent(projectId!, authState.accessToken!, "priority", "asc"),
                    getAllMilestonesForProject(projectId!, authState.accessToken!),
                    getAllLabelForProject(projectId!, authState.accessToken!),
                ]);

                setProject(projectData);
                setTasks(allTasks);
                setMilestones(allMilestones);
                setProjectLabels(projectLabels);

                if (projectData.owner_id === authState.user?.id) {
                    setCanManageTasks(true);
                } else {
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

    const handleTaskUpdate = (updatedTask: Task) => {
        setTasks(currentTasks =>
            currentTasks.map(task =>
                task.id === updatedTask.id ? updatedTask : task
            )
        );
    };

    const handleTaskDelete = (deletedTaskId: string) => {
        setTasks(currentTasks => currentTasks.filter(task => task.id !== deletedTaskId));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6 px-4 sm:px-6 md:px-12 transition-colors duration-300">
            <div className="max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(`/projects/${projectId}`)}
                                className="mr-3 p-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                            >
                                <FaArrowLeft />
                            </button>
                            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{project?.name}</h1>
                                {project?.read_only && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-300">
                                        <FaBan className="mr-1" size={10} />
                                        Read Only
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-10">
                            Managing tasks for <span className="font-semibold">{project?.name}</span>
                        </p>
                    </div>

                    {canManageTasks && !project?.read_only && (
                        <button
                            onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
                            className="inline-flex items-center justify-center w-full md:w-auto px-4 py-2.5 text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow transition-all"
                        >
                            <FaPlus className="mr-2" />
                            New Task
                        </button>
                    )}
                </div>

                {/* Read-only Warning Banner */}
                {project?.read_only && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 sm:p-6 mb-6 text-sm sm:text-base">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <FaBan className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Read-Only Project</h3>
                                <p className="mt-2 text-red-700 dark:text-red-200">
                                    This project is currently in read-only mode because:
                                </p>
                                <ul className="list-disc list-inside mt-2 ml-4 text-red-700 dark:text-red-200">
                                    <li>The premium subscription for this project has been canceled</li>
                                    <li>This project is using premium features (more than 5 team members)</li>
                                </ul>

                                {authState.user.id === project!.owner_id ? (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-start sm:items-center gap-2">
                                            <FaUsers />
                                            <p>
                                                To unlock task management, reduce the number of project members to 5 or fewer
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl font-medium shadow transition"
                                        >
                                            <FaCrown className="text-yellow-300 dark:text-yellow-200" />
                                            Upgrade to Premium
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex items-center gap-2">
                                        <FaUsers />
                                        <p>Contact the project owner to unlock task management</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* View Toggle */}
                <div className="flex flex-wrap bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden mb-6 border border-gray-200 dark:border-gray-700">
                    {[
                        { label: 'Board', icon: <FaThLarge />, key: 'board' },
                        { label: 'List', icon: <FaList />, key: 'list' },
                        { label: 'Milestones', icon: <FaFlag />, key: 'milestones' },
                        { label: 'Labels', icon: <FaTags />, key: 'labels' }
                    ].map(({ label, icon, key }) => (
                        <button
                            key={key}
                            onClick={() => setView(key as typeof view)}
                            className={`flex items-center px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all cursor-pointer flex-1 min-w-[100px] justify-center ${view === key
                                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {icon}
                            <span className="ml-2">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64 sm:h-80 flex-col">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-500 dark:text-gray-300 text-sm">Loading tasks...</p>
                    </div>
                ) : error ? (
                    <div className="p-4 sm:p-6 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm sm:text-base">
                        {error}
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {view === 'board' ? (
                            <TaskBoard
                                tasks={filteredTasks}
                                setTasks={setTasks}
                                onTaskUpdate={handleTaskUpdate}
                                canManageTasks={canManageTasks}
                                project={project}
                                milestones={milestones}
                                selectedMilestone={selectedMilestone}
                                onMilestoneChange={setSelectedMilestone}
                            />
                        ) : view === 'list' ? (
                            <TaskList
                                tasks={filteredTasks}
                                setTasks={setTasks}
                                canManageTasks={canManageTasks}
                                project={project}
                                milestones={milestones}
                                selectedMilestone={selectedMilestone}
                                onMilestoneChange={setSelectedMilestone}
                                onTaskDelete={handleTaskDelete}
                                activeFilters={activeFilters}
                                setActiveFilters={setActiveFilters}
                                onFilterChange={setActiveFilters}
                                projectLabels={projectLabels}
                            />
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