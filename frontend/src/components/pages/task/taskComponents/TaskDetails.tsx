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
    FaFlag
} from 'react-icons/fa';
import { fetchTask } from '../../../../services/taskService';
import { fetchProjectById } from '../../../../services/projectService';
import { getProjectMembers } from '../../../../services/projectMemberService';
import { useAuth } from '../../../../hooks/useAuth';
import { TaskFiles } from '../taskHandler/TaskFiles';
import { TaskAssignments } from '../taskHandler/assignments/TaskAssignments';

export const TaskDetails: React.FC = () => {
    const { taskId, projectId } = useParams<{ taskId: string; projectId: string }>();
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [canManageTasks, setCanManageTasks] = useState(false);

    useEffect(() => {
        const loadTask = async () => {
            try {
                const fetched = await fetchTask(taskId!, projectId!, authState.accessToken!);
                setTask(fetched);

                // Check permissions
                const project = await fetchProjectById(projectId!, authState.accessToken!);
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
                console.error(err);
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
            <div className="text-center flex flex-col py-8 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</div>
                <button
                    onClick={() => navigate(`/projects/${projectId}/tasks`)}
                    className="px-4 cursor-pointer py-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg transition-colors"
                >
                    Go Back
                </button>
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
                    {canManageTasks && (
                        <button
                            onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/edit`)}
                            className="flex items-center cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-xl shadow transition-colors"
                        >
                            <FaEdit className="mr-2" />
                            Edit Task
                        </button>
                    )}
                </div>

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
                                {task.due_date
                                    ? new Date(task.due_date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })
                                    : 'No due date'}
                            </p>
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

                        {/* Milestone */}
                        <div className="bg-gray-50/70 dark:bg-gray-700/60 p-4 rounded-lg backdrop-blur-sm">
                            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                                <FaFlag className="mr-2" />
                                <h3 className="font-medium">Milestone</h3>
                            </div>

                            {task.milestone_id ? (
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center hover:cursor-pointer hover:text-indigo-800 hover:dark:text-indigo-300 px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-sm"
                                        onClick={() =>
                                            navigate(`/projects/${projectId}/milestones/${task.milestone_id}`)
                                        }>
                                        <FaFlag className="mr-2"
                                        />
                                        {task.milestone_name || 'View Milestone'}
                                    </span>
                                </div>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-sm">
                                    <FaFlag className="mr-2" />
                                    No milestone
                                </span>
                            )}
                        </div>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="bg-gray-50/70 dark:bg-gray-700/60 p-4 rounded-lg backdrop-blur-sm">
                                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                                    <FaTag className="mr-2" />
                                    <h3 className="font-medium">Tags</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {task.tags.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attachments */}
                        <div className="md:col-span-2">
                            <TaskFiles
                                canManageFiles={false}
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
