import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaCircle, FaClock, FaCheckCircle, FaPlus, FaTasks, FaTrash, FaPaperclip, FaFlag, FaTag, FaChevronDown, FaFilter, FaBan } from 'react-icons/fa';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { ConfirmationDialog } from '../../../project/ConfirmationDialog';
import { deleteTask } from '../../../../../services/taskService';
import { useAuth } from '../../../../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Task } from '../../../../../types/task';
import { TaskAssignments } from '../assignments/TaskAssignments';
import { SubtaskList } from './SubtaskSectionForList';
import { CommentComponent } from '../taskDetails/Comments/Comments';
import { TaskFilterDialog } from './TaskFilterDialog';

interface TaskListProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    canManageTasks: boolean;
    project: Project | null;
    milestones: Milestone[];
    selectedMilestone: string | null;
    onMilestoneChange: (milestoneId: string | null) => void;
    onTaskDelete?: (taskId: string) => void;
    activeFilters: Filter;
    setActiveFilters: React.Dispatch<React.SetStateAction<Filter>>;
    onFilterChange: (filters: Filter) => void;
    projectLabels: Label[]
}

export const TaskList: React.FC<TaskListProps> = React.memo(({
    tasks,
    setTasks,
    canManageTasks,
    project,
    milestones,
    selectedMilestone,
    onMilestoneChange,
    onTaskDelete,
    activeFilters,
    setActiveFilters,
    onFilterChange,
    projectLabels
}) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
    const [isMilestoneDropdownOpen, setIsMilestoneDropdownOpen] = useState(false);
    const milestoneWrapperRef = useRef<HTMLDivElement>(null);

    const [visibleTasks, setVisibleTasks] = useState<Task[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 5;
    const [showAllTasks, setShowAllTasks] = useState(false);

    const [showFilterDialog, setShowFilterDialog] = useState(false);

    useEffect(() => {
        if (!isMilestoneDropdownOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            // If ref.current is mounted AND the click target is NOT inside, close the menu
            if (
                milestoneWrapperRef.current &&
                !milestoneWrapperRef.current.contains(e.target as Node)
            ) {
                setIsMilestoneDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMilestoneDropdownOpen]);

    useEffect(() => {
        if (showAllTasks) {
            setVisibleTasks(tasks);
        } else {
            const endIndex = currentPage * tasksPerPage;
            setVisibleTasks(tasks.slice(0, endIndex));
        }
    }, [tasks, currentPage, tasksPerPage, showAllTasks]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilters, selectedMilestone]);

    const toggleTaskExpansion = (taskId: string) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <FaCheckCircle className="text-green-500" />;
            case 'in-progress':
                return <FaClock className="text-yellow-500" />;
            case 'blocked':
                return <FaBan className="text-red-500" />;
            default:
                return <FaCircle className="text-gray-400" />;
        }
    };

    const getPriorityBadge = (priority: string) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        );
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            'not-started': 'Not Started',
            'in-progress': 'In Progress',
            'completed': 'Completed'
        };
        return statusMap[status] || status;
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            if (!projectId || !authState.accessToken) return;

            setLoading(true);
            await deleteTask(taskId, projectId, authState.accessToken);

            // Update local state
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

            // Notify parent component if needed
            if (onTaskDelete) {
                onTaskDelete(taskId);
            }

            toast.success('Task deleted successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete task');
        } finally {
            setLoading(false);
        }
    };

    const initiateDelete = (e: React.MouseEvent, taskId: string) => {
        e.stopPropagation();
        setTaskToDelete(taskId);
        setShowDeleteConfirm(true);
    };

    const getLabelTextColor = (hexColor: string) => {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? 'text-gray-900' : 'text-white';
    };

    const handleSubtaskStatusChange = (taskId: string, subtaskId: string, newStatus: string) => {
        setTasks(prevTasks => prevTasks.map(task => {
            if (task.id === taskId) {
                const updatedSubtasks = task.subtasks?.map(subtask =>
                    subtask.id === subtaskId ? { ...subtask, status: newStatus } : subtask
                ) || [];
                return { ...task, subtasks: updatedSubtasks };
            }
            return task;
        }));
    };

    const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
        try {
            if (!projectId || !authState.accessToken) return;

            await deleteTask(subtaskId, projectId, authState.accessToken);

            setTasks(prevTasks => prevTasks.map(task => {
                if (task.id === taskId) {
                    const updatedSubtasks = task.subtasks?.filter(subtask => subtask.id !== subtaskId) || [];
                    return { ...task, subtasks: updatedSubtasks };
                }
                return task;
            }));

            toast.success('Subtask deleted successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete subtask');
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm">
                <div className="w-full max-w-sm text-center">
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                                    <svg
                                        className="animate-spin h-6 w-6 text-indigo-600 dark:text-indigo-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                </div>
                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
                            </div>

                            <div>
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {taskToDelete ? 'Deleting task...' : 'Loading tasks...'}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Please wait while we complete this action
                                </p>
                            </div>

                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4">
                                <div
                                    className="bg-indigo-600 dark:bg-indigo-400 h-1.5 rounded-full animate-pulse"
                                    style={{ width: '70%' }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-700/50 overflow-visible transition-all duration-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                {/* Title */}
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tasks</h2>

                {/* Controls Group - Milestone Dropdown and Filter Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    {/* Milestone Selector Dropdown */}
                    <div className="w-full sm:w-auto" ref={milestoneWrapperRef}>
                        <div className="relative w-full sm:w-56">
                            {/* Dropdown Button */}
                            <button
                                onClick={() => setIsMilestoneDropdownOpen(!isMilestoneDropdownOpen)}
                                className="w-full inline-flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                            >
                                <span className="flex items-center max-w-[calc(100%-24px)] truncate">
                                    <FaFlag
                                        className="flex-shrink-0 mr-2.5"
                                        style={{
                                            color: selectedMilestone && selectedMilestone !== 'all'
                                                ? milestones.find(m => m.id === selectedMilestone)?.color || '#8b5cf6'
                                                : '#8b5cf6'
                                        }}
                                    />
                                    <span className="truncate">
                                        {selectedMilestone === 'all'
                                            ? 'All Milestones'
                                            : milestones.find(m => m.id === selectedMilestone)?.name || 'Select Milestone'}
                                    </span>
                                </span>
                                <FaChevronDown
                                    className={`ml-2 h-3 w-3 flex-shrink-0 transition-transform ${isMilestoneDropdownOpen ? 'transform rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isMilestoneDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-full sm:w-64 origin-top-right rounded-lg shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1 max-h-[60vh] overflow-y-auto">
                                        {/* All Tasks Option */}
                                        <button
                                            onClick={() => {
                                                onMilestoneChange('all')
                                                setIsMilestoneDropdownOpen(false)
                                            }}
                                            className={`flex w-full cursor-pointer items-center px-4 py-2.5 text-sm text-left transition-colors ${selectedMilestone === 'all'
                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                        >
                                            <FaTasks className="mr-3 opacity-70 flex-shrink-0" />
                                            <span>All Tasks</span>
                                        </button>

                                        {/* Milestone Options */}
                                        {milestones.map(milestone => {
                                            const milestoneColor = milestone.color || '#8b5cf6';
                                            const isActive = selectedMilestone === milestone.id;

                                            return (
                                                <button
                                                    key={milestone.id}
                                                    onClick={() => {
                                                        onMilestoneChange(milestone.id)
                                                        setIsMilestoneDropdownOpen(false)
                                                    }}
                                                    className={`flex w-full cursor-pointer items-center px-4 py-2.5 text-sm text-left transition-colors ${isActive
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                                    style={isActive ? {
                                                        backgroundColor: `${milestoneColor}20`,
                                                        color: milestoneColor,
                                                        borderLeft: `3px solid ${milestoneColor}`,
                                                    } : undefined}
                                                >
                                                    <FaFlag className="mr-3 flex-shrink-0" style={{ color: milestoneColor }} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate text-gray-800 dark:text-gray-100">{milestone.name}</p>
                                                        {milestone.due_date && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                Due {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFilterDialog(true)}
                        className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 whitespace-nowrap"
                    >
                        <FaFilter className="mr-2" />
                        Filter & Sort
                    </button>
                </div>
            </div>

            {/* Active Filters */}
            {(activeFilters.status! || activeFilters.priority! || activeFilters.labelIds!.length > 0) && (
                <div className="flex flex-wrap gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl mb-4 border border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">Active filters:</span>

                    {activeFilters.status && (
                        <span
                            onClick={() => setActiveFilters(prev => ({ ...prev, status: '' }))}
                            className={`
                                    inline-flex cursor-pointer cursor-pointer items-center px-3 py-1 rounded-full text-xs font-medium
                                    ${activeFilters.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                    activeFilters.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                        activeFilters.status === 'not-started' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' :
                                            activeFilters.status === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'}
                                    `}
                        >
                            Status: {getStatusText(activeFilters.status)}
                            <button
                                onClick={() => setActiveFilters(prev => ({ ...prev, status: '' }))}
                                className="ml-1.5 p-0.5 rounded-full cursor-pointer dark:hover:bg-opacity-75"
                            >
                                ×
                            </button>
                        </span>
                    )}

                    {activeFilters.priority && (
                        <span
                            onClick={() => setActiveFilters(prev => ({ ...prev, priority: '' }))}
                            className={`
                                    inline-flex cursor-pointer items-center px-3 py-1 rounded-full text-xs font-medium
                                    ${activeFilters.priority === 'low' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                    activeFilters.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                        activeFilters.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                            'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'}
                                    `}
                        >
                            Priority: {activeFilters.priority.charAt(0).toUpperCase() + activeFilters.priority.slice(1)}
                            <button
                                onClick={() => setActiveFilters(prev => ({ ...prev, priority: '' }))}
                                className="ml-1.5 p-0.5 cursor-pointer rounded-full hover:bg-opacity-75 dark:hover:bg-opacity-75"
                            >
                                ×
                            </button>
                        </span>
                    )}

                    {activeFilters.labelIds?.map(labelId => {
                        const label = projectLabels.find(l => l.id === labelId);
                        if (!label) return null;

                        const hexColor = label.color.startsWith('#') ? label.color : `#${label.color}`;
                        const textColor = getLabelTextColor(hexColor);

                        return (
                            <span
                                key={labelId}
                                className={`inline-flex cursor-pointer items-center px-3 py-1 rounded-full text-xs font-medium ${textColor}`}
                                style={{ backgroundColor: hexColor }}
                                onClick={() => setActiveFilters(prev => ({
                                    ...prev,
                                    labelIds: prev.labelIds?.filter(id => id !== labelId)
                                }))}
                            >
                                <FaTag className="mr-1" size={10} />
                                {label.name}
                                <button
                                    onClick={() => setActiveFilters(prev => ({
                                        ...prev,
                                        labelIds: prev.labelIds?.filter(id => id !== labelId)
                                    }))}
                                    className={`ml-1.5 p-0.5 cursor-pointer rounded-full hover:bg-${textColor === 'text-gray-900' ? 'gray-300' : 'black/20'}`}
                                >
                                    ×
                                </button>
                            </span>
                        );
                    })}

                    <button
                        onClick={() => setActiveFilters({
                            status: '',
                            priority: '',
                            labelIds: [],
                            orderBy: 'due_date',
                            orderDirection: 'desc'
                        })}
                        className="text-xs cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline ml-2"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Task List */}
            {visibleTasks.length === 0 ? (
                <div className="text-center p-12">
                    <FaTasks className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {selectedMilestone === 'all' || !selectedMilestone ? 'No Tasks Yet' : 'No Tasks in This Milestone'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
                        {selectedMilestone === 'all' || !selectedMilestone
                            ? "Create your first task to start tracking your project's progress."
                            : "This milestone doesn't have any tasks yet."}
                    </p>
                    {canManageTasks && (
                        <button
                            onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
                            className="px-6 py-2 bg-indigo-600 cursor-pointer hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors flex items-center mx-auto"
                        >
                            <FaPlus className="mr-2" /> Create New Task
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Task
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Labels
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Assigned to
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Milestone
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Due Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Attachments
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Comments
                                </th>
                                {canManageTasks && !project?.read_only && (
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {visibleTasks.map(task => (
                                <React.Fragment key={task.id}>
                                    <tr
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                                    >
                                        {/* Task Name */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 mr-3">
                                                    {getStatusIcon(task.status)}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</div>
                                            </div>
                                        </td>

                                        {/* Labels */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {task.labels && task.labels.length > 0 && (
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
                                                                <FaTag className={`mr-1 ${textColor}`} size={10} />
                                                                {label.name}
                                                            </span>
                                                        );
                                                    })}

                                                    {task.labels.length > 3 && (
                                                        <div className="relative inline-block">
                                                            <span
                                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors peer"
                                                            >
                                                                +{task.labels.length - 3}
                                                            </span>

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
                                                                <div className="absolute -bottom-1 left-2 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45 -z-10"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        {/* Assigned to */}
                                        <td className="px-6 py-4">
                                            <div className="flex -space-x-1.5">
                                                <TaskAssignments
                                                    showAssignButtonInCompactMode={true}
                                                    taskIdFromCompactMode={task.id}
                                                    pendingUsers={[]}
                                                    setPendingUsers={() => { }}
                                                    compactMode={true}
                                                />
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            ${task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                    task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                        task.status === 'not-started' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' :
                                                            task.status === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                                'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'}
        `}
                                            >
                                                {getStatusText(task.status)}
                                            </span>
                                        </td>

                                        {/* Priority */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getPriorityBadge(task.priority)}
                                        </td>

                                        {/* Milestone */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {task.milestone_name ? (
                                                <span
                                                    className="inline-flex hover:underline items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors text-gray-800 dark:text-gray-100"
                                                    style={{
                                                        backgroundColor: `${task.milestone_color}20`,
                                                        border: `1px solid ${task.milestone_color}40`
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/projects/${projectId}/milestones/${task.milestone_id}`)
                                                    }}
                                                >
                                                    <FaFlag
                                                        className="mr-1"
                                                        style={{ color: task.milestone_color }}
                                                    />
                                                    {task.milestone_name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">—</span>
                                            )}
                                        </td>

                                        {/* Due Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {task.due_date ? (
                                                <div className="flex items-center gap-1">
                                                    <span className={
                                                        `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status !== 'completed'
                                                            ? isPast(new Date(task.due_date)) || isToday(new Date(task.due_date))
                                                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                                : isTomorrow(new Date(task.due_date))
                                                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                                                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                        }`
                                                    }>
                                                        Due {new Date(task.due_date).toLocaleDateString()}
                                                        {task.status !== 'completed' && isToday(new Date(task.due_date)) && " • Today"}
                                                        {task.status !== 'completed' && isTomorrow(new Date(task.due_date)) && " • Tomorrow"}
                                                    </span>
                                                </div>
                                            ) : (
                                                '—'
                                            )}
                                        </td>

                                        {/* Attachments count */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {task.attachments_count > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                        <FaPaperclip className="mr-1" />
                                                        {task.attachments_count}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">—</span>
                                            )}
                                        </td>

                                        {/* Comments */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <CommentComponent
                                                projectId={projectId!}
                                                taskId={task.id}
                                                canManageTasks={canManageTasks}
                                                listCompactMode={true}
                                                project={project}
                                            />
                                        </td>

                                        {/* Actions */}
                                        {canManageTasks && !project?.read_only && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/projects/${projectId}/tasks/${task.id}/edit`);
                                                        }}
                                                        className="p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                        title="Edit task"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={(e) => initiateDelete(e, task.id)}
                                                        className="p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                        title="Delete task"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    {/* Subtasks row */}
                                    {task.subtasks && task.subtasks.length > 0 && (
                                        <tr className="bg-transparent">
                                            <td colSpan={canManageTasks ? 12 : 11} className="px-2 py-1">
                                                <SubtaskList
                                                    task={task}
                                                    expanded={expandedTasks[task.id]}
                                                    onToggleExpand={() => toggleTaskExpansion(task.id)}
                                                    onSubtaskStatusChange={handleSubtaskStatusChange}
                                                    canManageTasks={canManageTasks}
                                                    onDeleteSubtask={handleDeleteSubtask}
                                                    onTaskUpdate={(updatedTask) => {
                                                        setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
                                                    }}
                                                    project={project}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination controls */}
                    {tasks.length > tasksPerPage && (
                        <div className="flex justify-center py-4 gap-2">
                            <div className="flex items-center justify-center gap-3">
                                {/* Show "Load More" button only when not showing all tasks and there are more to load */}
                                {!showAllTasks && tasks.length > visibleTasks.length && (
                                    <button
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap shadow-lg"
                                    >
                                        Load More ({tasks.length - visibleTasks.length} remaining)
                                    </button>
                                )}

                                {/* Show "Show Less" button when showing more than the initial page */}
                                {(showAllTasks || currentPage > 1) && (
                                    <button
                                        onClick={() => {
                                            setShowAllTasks(false);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white cursor-pointer rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap shadow-lg"
                                    >
                                        Show Less
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    if (taskToDelete) {
                        handleDeleteTask(taskToDelete);
                    }
                    setShowDeleteConfirm(false);
                }}
                title="Delete Task?"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete Task"
                confirmColor="red"
            />

            <TaskFilterDialog
                isOpen={showFilterDialog}
                onClose={() => setShowFilterDialog(false)}
                onApply={(filters) => {
                    onFilterChange(filters);
                    setShowFilterDialog(false);
                }}
                initialFilters={activeFilters}
                projectLabels={projectLabels}
                projectId={projectId!}
            />
        </div>
    );
});