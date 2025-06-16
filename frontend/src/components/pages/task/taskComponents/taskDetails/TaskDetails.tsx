import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaCheckCircle,
    FaClock,
    FaCircle,
    FaEdit,
    FaCalendarAlt,
    FaArrowLeft,
    FaExclamation,
    FaAlignLeft,
    FaTag,
    FaFlag,
    FaBan,
    FaChevronRight,
    FaTasks,
    FaCalendarDay,
    FaUsers,
    FaCrown,
    FaExclamationCircle
} from 'react-icons/fa';
import { fetchTask } from '../../../../../services/taskService';
import { fetchProjectById } from '../../../../../services/projectService';
import { getProjectMembers } from '../../../../../services/projectMemberService';
import { useAuth } from '../../../../../hooks/useAuth';
import { TaskFiles } from '../TaskFiles';
import { TaskAssignments } from '../assignments/TaskAssignments';
import { SubtaskList } from '../subtasks/SubtaskList';
import { Task } from '../../../../../types/task';
import { isPast, isToday, isTomorrow, format } from 'date-fns';
import { CommentComponent } from './Comments/Comments';
import { TaskLogsComponent } from './TaskLog';

export const TaskDetails: React.FC = () => {
    const { taskId, projectId } = useParams<{ taskId: string; projectId: string }>();
    const [task, setTask] = useState<Task>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [canManageTasks, setCanManageTasks] = useState(false);
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        const loadTask = async () => {
            try {
                const fetched = await fetchTask(taskId!, projectId!, authState.accessToken!);
                setTask(fetched);

                // Check permissions
                const project = await fetchProjectById(projectId!, authState.accessToken!);
                setProject(project);
                if (project.owner_id === authState.user?.id) {
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
                setError('Failed to load task.');
            } finally {
                setLoading(false);
            }
        };
        if (taskId && projectId) loadTask();
    }, [taskId, projectId]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    icon: <FaCheckCircle className="text-green-500" />,
                    text: 'Completed',
                    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                };
            case 'in-progress':
                return {
                    icon: <FaClock className="text-yellow-500" />,
                    text: 'In Progress',
                    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                };
            case 'blocked':
                return {
                    icon: <FaBan className="text-red-500" />,
                    text: 'Blocked',
                    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }
            default:
                return {
                    icon: <FaCircle className="text-gray-400" />,
                    text: 'Not Started',
                    badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300'
                };
        }
    };

    const getPriorityInfo = (priority: string) => {
        switch (priority) {
            case 'high':
                return {
                    icon: <FaExclamation className="text-red-500" />,
                    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                };
            case 'medium':
                return {
                    icon: <FaExclamation className="text-yellow-500" />,
                    badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                };
            default:
                return {
                    icon: <FaExclamation className="text-blue-500" />,
                    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                };
        }
    };

    const getLabelTextColor = (hexColor: string) => {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? 'text-gray-900' : 'text-white';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading task...</p>
                </div>
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-w-md w-full p-6 text-center">
                    <FaExclamationCircle className="mx-auto text-red-500 text-5xl mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Oops! Something went wrong
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We couldn’t load the task you were looking for. Try refreshing or go back to your dashboard.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard', { replace: true })}
                        className="inline-flex items-center cursor-pointer justify-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium rounded-lg shadow-sm transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(task.status);
    const priorityInfo = getPriorityInfo(task.priority);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200  py-8 px-4 md:px-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(`/projects/${projectId}/tasks`)}
                        className="flex items-center cursor-pointer text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to tasks
                    </button>
                    {canManageTasks && !project?.read_only && (
                        <button
                            onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/edit`)}
                            className="flex items-center cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-xl shadow transition-colors"
                        >
                            <FaEdit className="mr-2" />
                            Edit Task
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

                {/* Task Card */}
                <div className="bg-white/80 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden transition-all duration-200 backdrop-blur-sm">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    {task.title}
                                </h1>
                                <div className="flex flex-wrap gap-3">
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.badgeClass}`}
                                    >
                                        {statusInfo.icon}
                                        <span className="ml-2">{statusInfo.text}</span>
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityInfo.badgeClass}`}
                                    >
                                        {priorityInfo.icon}
                                        <span className="ml-2">
                                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        {/* Description */}
                        <div className="md:col-span-2">
                            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
                                <FaAlignLeft className="mr-2" />
                                <h3 className="font-medium">Description</h3>
                            </div>
                            <div className="prose dark:prose-invert max-w-none bg-gray-50/70 dark:bg-gray-700/60 p-4 rounded-lg backdrop-blur-sm">
                                {task.description ? (
                                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
                                        {task.description}
                                    </p>
                                ) : (
                                    <p className="text-gray-400 dark:text-gray-500 italic">
                                        No description provided
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="bg-gray-50/70 dark:bg-gray-700/60 p-4 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                                <FaCalendarAlt className="mr-2" />
                                <h3 className="font-medium">Due Date</h3>
                            </div>
                            <p className="text-gray-900 dark:text-gray-100">
                                {task.due_date && new Date(task.due_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>

                            {!task.due_date && (
                                <div className="text-gray-500 mt-5 dark:text-gray-400 italic">
                                    No due date set
                                </div>
                            )}
                        </div>

                        {/* Assigned To */}
                        <div className="bg-gray-50/70 dark:bg-gray-700/60 p-4 rounded-lg backdrop-blur-sm">
                            <TaskAssignments
                                isOpenForm={false}
                                pendingUsers={[]}
                                setPendingUsers={() => { }}
                                compactMode={false}
                            />
                        </div>

                        {task.parent_task_id && (
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-3">
                                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                                        <FaTasks className="mr-2" />
                                    </div>
                                    <h3 className="font-medium text-sm">Parent Task</h3>
                                </div>

                                <div
                                    onClick={() => navigate(`/projects/${projectId}/tasks/${task.parent_task_id}`)}
                                    className="group relative p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700/30 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Status indicator */}
                                        <div className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-full ${task.parent_status === "completed"
                                            ? "bg-green-500 dark:bg-green-400"
                                            : task.parent_status === "in-progress"
                                                ? "bg-yellow-500 dark:bg-yellow-400"
                                                : task.parent_status === "blocked"
                                                    ? "bg-red-500 dark:bg-red-400"
                                                    : "bg-gray-300 dark:bg-gray-500"
                                            }`} />

                                        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {task.parent_task_name || 'Parent Task'}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className={`text-xs px-2 py-1 rounded-md ${task.parent_status === "completed"
                                                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                                        : task.parent_status === "in-progress"
                                                            ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                                                            : task.parent_status === "blocked"
                                                                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                                                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                        }`}>
                                                        {task.parent_status?.replace('-', ' ') || 'Not started'}
                                                    </span>

                                                    {task.parent_due_date && (
                                                        <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${task.parent_status !== 'completed'
                                                            ? isPast(new Date(task.parent_due_date)) || isToday(new Date(task.parent_due_date))
                                                                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                                                : isTomorrow(new Date(task.parent_due_date))
                                                                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                                                                    : "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                                                            : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                            }`}>
                                                            <FaCalendarDay size={10} />
                                                            {format(new Date(task.parent_due_date), 'MMM d')}
                                                            {task.parent_status !== 'completed' && isToday(new Date(task.parent_due_date)) && ' • Today'}
                                                            {task.parent_status !== 'completed' && isTomorrow(new Date(task.parent_due_date)) && ' • Tomorrow'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <FaChevronRight className="flex-shrink-0 text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" size={12} />
                                        </div>
                                    </div>

                                    {/* Subtle hover effect */}
                                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-indigo-100 dark:group-hover:border-indigo-900/30 transition-all pointer-events-none" />
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <SubtaskList
                                subtasks={task.subtasks || []}
                                parentTaskId={task.id}
                                onSubtaskUpdated={async () => {
                                    // Refetch task data
                                    const updatedTask = await fetchTask(taskId!, projectId!, authState.accessToken!);
                                    setTask(updatedTask);
                                }}
                                canManageTasks={canManageTasks}
                                projectId={projectId!}
                                isParentTask={!task.parent_task_id}
                                project={project}
                            />
                        </div>

                        {/* Milestone */}
                        <div className="bg-gray-50/70 dark:bg-gray-700/60 p-4 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                                <FaFlag className="mr-2" />
                                <h3 className="font-medium">Milestone</h3>
                            </div>

                            {task.milestone_id ? (
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center hover:cursor-pointer  text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 hover:underline px-2 py-1 rounded-full text-sm"
                                        onClick={() =>
                                            navigate(`/projects/${projectId}/milestones/${task.milestone_id}`)
                                        }

                                        style={{
                                            backgroundColor: `${task.milestone_color}20`,
                                            border: `1px solid ${task.milestone_color}40`
                                        }}
                                    >
                                        <FaFlag className="mr-2" style={{ color: task.milestone_color }} />
                                        {task.milestone_name || 'View Milestone'}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-gray-500 mt-5 dark:text-gray-400 italic">
                                    No milestone assigned yet
                                </div>
                            )}
                        </div>

                        {/* Labels */}
                        <div className="space-y-2 bg-gray-50/70 dark:bg-gray-700/60 p-4 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                                <FaTag className="mr-2" />
                                <h3 className="font-medium">Labels</h3>
                            </div>

                            {task.labels && task.labels.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {task.labels.slice(0, 3).map((label: any) => {
                                        const hexColor = label.color.startsWith('#') ? label.color : `#${label.color}`;
                                        const textColor = getLabelTextColor(hexColor);
                                        const borderColor = `${hexColor}${textColor === 'text-gray-900' ? '80' : 'b3'}`;

                                        return (
                                            <span
                                                key={label.id}
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${textColor}`}
                                                style={{
                                                    backgroundColor: hexColor,
                                                    border: `1px solid ${borderColor}`,
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                <FaTag className="mr-1" size={10} />
                                                {label.name}
                                            </span>
                                        );
                                    })}

                                    {/* +X more labels indicator with hover popup */}
                                    {task.labels.length > 3 && (
                                        <div className="relative inline-block">
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors peer"
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
                            ) : (
                                <div className="text-gray-500 mt-5 dark:text-gray-400 italic">
                                    No labels assigned yet
                                </div>
                            )}
                        </div>

                        {/* Attachments */}
                        <div className="md:col-span-2">
                            <TaskFiles
                                displayNoFileIfEmpty={true}
                                canManageFiles={false}
                                project={project}
                            />
                        </div>

                        {/* Comments */}
                        <div className="md:col-span-2">
                            <CommentComponent
                                projectId={projectId!}
                                taskId={taskId!}
                                canManageTasks={canManageTasks}
                                project={project}
                            />
                        </div>

                    </div>

                    {/* Recent Activity Section */}
                    <div className="mt-8 bg-white/80 dark:bg-gray-800/90 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Activity</h2>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            <TaskLogsComponent
                                projectId={projectId!}
                                taskId={taskId!}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50/70 dark:bg-gray-700/60 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-wrap justify-between">
                            <div>
                                Created:{' '}
                                {new Date(task.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                            <div>
                                Last updated:{' '}
                                {new Date(task.updated_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
