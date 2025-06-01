import { useState } from 'react';
import { FaTrash, FaPlus, FaSpinner, FaTimes, FaSearch, FaCheck, FaPaperclip, FaCalendarDay, FaTag, FaChevronRight, FaBan } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../../../../types/task';
import { TaskAssignments } from '../assignments/TaskAssignments';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { CommentComponent } from '../taskDetails/Comments/Comments';

interface MilestoneTasksProps {
    milestone: Milestone;
    tasks: Task[];
    milestoneTasks: Task[];
    canManage: boolean;
    onAddTasks: (taskIds: string[]) => Promise<void>;
    onRemoveTask: (taskId: string) => Promise<void>;
    project: Project | null;
}

export const MilestoneTasks: React.FC<MilestoneTasksProps> = ({
    milestone,
    tasks,
    milestoneTasks,
    canManage,
    onAddTasks,
    onRemoveTask,
    project
}) => {
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showTaskSelector, setShowTaskSelector] = useState(false);
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

    const handleAddTasks = async () => {
        if (selectedTaskIds.length === 0) {
            toast.error('Please select at least one task');
            return;
        }

        setIsAdding(true);
        try {
            await onAddTasks(selectedTaskIds);
            setSelectedTaskIds([]);
            setSearchQuery('');
            setShowTaskSelector(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsAdding(false);
        }
    };

    const handleTaskClick = (taskId: string, e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('input[type="checkbox"]')) {
            e.stopPropagation();
            return;
        }
        navigate(`/projects/${projectId}/tasks/${taskId}`);
    };

    const toggleTaskSelection = (taskId: string) => {
        setSelectedTaskIds(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    const availableTasks = tasks.filter(
        task => !milestoneTasks.some(mt => mt.id === task.id)
    );

    const filteredAvailableTasks = availableTasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Milestone Tasks
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {milestoneTasks.length} of {milestone.all_tasks_count} tasks completed
                        </p>
                    </div>

                    {canManage && !project?.read_only && (
                        <button
                            onClick={() => setShowTaskSelector(!showTaskSelector)}
                            className="flex items-center px-4 py-2.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                        >
                            {showTaskSelector ? (
                                <>
                                    <FaTimes className="mr-2" />
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <FaPlus className="mr-2" />
                                    Add Tasks
                                </>
                            )}

                        </button>
                    )}
                </div>
            </div>

            {/* Task Selector */}
            <AnimatePresence>
                {showTaskSelector && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-b border-gray-100 dark:border-gray-700"
                    >
                        <div className="p-6">
                            <div className="relative mb-4">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search available tasks..."
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>

                            {filteredAvailableTasks.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {filteredAvailableTasks.map(task => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedTaskIds.includes(task.id)
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md'
                                                }`}
                                            onClick={() => toggleTaskSelection(task.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Checkbox */}
                                                <div className="mt-0.5 flex-shrink-0">
                                                    <div
                                                        className={`flex items-center justify-center h-5 w-5 rounded-md border transition-all ${selectedTaskIds.includes(task.id)
                                                            ? 'bg-indigo-600 border-indigo-600 scale-110'
                                                            : 'border-gray-300 dark:border-gray-500 group-hover:border-indigo-400'
                                                            }`}
                                                    >
                                                        {selectedTaskIds.includes(task.id) && (
                                                            <FaCheck className="h-3 w-3 text-white" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Task Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col space-y-2">
                                                        {/* Title */}
                                                        <h4 className={`font-medium text-gray-900 dark:text-gray-100 ${task.status === "completed" ? "line-through opacity-70" : ""
                                                            }`}>
                                                            {task.title}
                                                        </h4>

                                                        {/* First row - labels */}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {/* Labels */}
                                                            {task.labels && task.labels.length > 0 && (
                                                                <div className="flex flex-wrap items-center gap-1.5">
                                                                    {task.labels.slice(0, 2).map((label: any) => {
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

                                                                    {task.labels.length > 2 && (
                                                                        <div className="relative inline-block">
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors peer">
                                                                                +{task.labels.length - 2}
                                                                            </span>
                                                                            <div className="absolute z-50 hidden peer-hover:block bottom-full mb-2 left-0 min-w-max bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border border-gray-200 dark:border-gray-700">
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {task.labels.slice(2).map((label: any) => {
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
                                                        </div>

                                                        {/* Second row - status and priority */}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${task.status === "completed"
                                                                ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                                                                : task.status === "in-progress"
                                                                    ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200"
                                                                    : task.status === "blocked"
                                                                        ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                                                                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                                                }`}>
                                                                {task.status.replace('-', ' ')}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${task.priority === "high"
                                                                ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                                                                : task.priority === "medium"
                                                                    ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200"
                                                                    : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                                                                }`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>

                                                        {/* Third row - due date, attachments */}
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {task.due_date && (
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${task.status !== 'completed'
                                                                    ? isPast(new Date(task.due_date)) || isToday(new Date(task.due_date))
                                                                        ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                                                                        : isTomorrow(new Date(task.due_date))
                                                                            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
                                                                            : "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200"
                                                                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                                                    }`}>
                                                                    <FaCalendarDay className="mr-1" size={10} />
                                                                    {format(new Date(task.due_date), 'MMM d')}
                                                                    {task.status !== 'completed' && isToday(new Date(task.due_date)) && (
                                                                        <span className="ml-1">(Today)</span>
                                                                    )}
                                                                    {task.status !== 'completed' && isTomorrow(new Date(task.due_date)) && (
                                                                        <span className="ml-1">(Tomorrow)</span>
                                                                    )}
                                                                </span>
                                                            )}
                                                            {task.attachments_count > 0 && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                                    <FaPaperclip className="mr-1" size={10} />
                                                                    {task.attachments_count}
                                                                </span>
                                                            )}

                                                            {/* Comments */}
                                                            <CommentComponent
                                                                taskId={task.id}
                                                                projectId={projectId!}
                                                                canManageTasks={false}
                                                                compactMode={true}
                                                                project={project}
                                                            />
                                                        </div>

                                                        {renderParentTaskInfo(task)}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    {availableTasks.length === 0
                                        ? 'All tasks are assigned to milestones'
                                        : 'No matching tasks found'}
                                </div>
                            )}

                            {selectedTaskIds.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 flex justify-end space-x-3"
                                >
                                    <button
                                        onClick={() => {
                                            setSelectedTaskIds([]);
                                            setSearchQuery('');
                                        }}
                                        className="px-4 py-2 cursor-pointer border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={handleAddTasks}
                                        disabled={isAdding}
                                        className="px-4 py-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center"
                                    >
                                        {isAdding ? (
                                            <FaSpinner className="animate-spin mr-2" />
                                        ) : (
                                            <FaPlus className="mr-2" />
                                        )}
                                        Add {selectedTaskIds.length} Task{selectedTaskIds.length !== 1 ? 's' : ''}
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Task List */}
            <div className="p-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Assigned Tasks ({milestoneTasks.length})
                </h4>

                {milestoneTasks.length > 0 ? (
                    <div className="space-y-4">
                        {milestoneTasks.map(task => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={(e) => handleTaskClick(task.id, e)}
                                className="group flex items-start justify-between p-5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer"
                            >
                                <div className="flex items-start space-x-4 w-full">
                                    {/* Status indicator */}
                                    <div
                                        className={`flex-shrink-0 mt-1 h-6 w-6 rounded-md flex items-center justify-center transition-all duration-300 ease-in-out
                                            ${task.status === "completed"
                                                ? "bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-600"
                                                : task.status === "in-progress"
                                                    ? "bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-600"
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
                                        ) : task.status === "blocked" ? (
                                            <FaBan className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                        ) : (
                                            <svg className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col space-y-2">
                                            <h3 className={`font-medium text-gray-900 dark:text-gray-100 truncate text-base ${task.status === "completed" ? "line-through opacity-70" : ""
                                                }`}>
                                                {task.title}
                                            </h3>

                                            {/* First row - labels */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {/* Labels */}
                                                {task.labels && task.labels.length > 0 && (
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {task.labels.slice(0, 2).map((label: any) => {
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

                                                        {task.labels.length > 2 && (
                                                            <div className="relative inline-block">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors peer">
                                                                    +{task.labels.length - 2}
                                                                </span>
                                                                <div className="absolute z-50 hidden peer-hover:block bottom-full mb-2 left-0 min-w-max bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border border-gray-200 dark:border-gray-700">
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {task.labels.slice(2).map((label: any) => {
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
                                            </div>

                                            {/* Second row - status, priority, and due date */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${task.status === "completed"
                                                    ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                                                    : task.status === "in-progress"
                                                        ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200"
                                                        : task.status === "blocked"
                                                            ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                                                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                                    }`}>
                                                    {task.status.replace('-', ' ')}
                                                </span>

                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${task.priority === "high"
                                                    ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                                                    : task.priority === "medium"
                                                        ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200"
                                                        : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                                                    }`}>
                                                    {task.priority}
                                                </span>

                                                {task.due_date && (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${task.status !== 'completed'
                                                        ? isPast(new Date(task.due_date)) || isToday(new Date(task.due_date))
                                                            ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                                                            : isTomorrow(new Date(task.due_date))
                                                                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
                                                                : "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200"
                                                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                                        }`}>
                                                        <FaCalendarDay className="mr-1" size={10} />
                                                        {format(new Date(task.due_date), 'MMM d')}
                                                        {task.status !== 'completed' && isToday(new Date(task.due_date)) && (
                                                            <span className="ml-1">(Today)</span>
                                                        )}
                                                        {task.status !== 'completed' && isTomorrow(new Date(task.due_date)) && (
                                                            <span className="ml-1">(Tomorrow)</span>
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Third row - attachments, assignments */}
                                            <div className="flex flex-wrap items-center gap-2">

                                                {/* Attachments */}
                                                {task.attachments_count > 0 && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                                        <FaPaperclip className="mr-1" size={10} />
                                                        {task.attachments_count}
                                                    </span>
                                                )}

                                                {/* Comments */}
                                                <CommentComponent
                                                    taskId={task.id}
                                                    projectId={projectId!}
                                                    canManageTasks={false}
                                                    compactMode={true}
                                                    project={project}
                                                />

                                                <TaskAssignments
                                                    compactMode={true}
                                                    taskIdFromCompactMode={task.id}
                                                    showAssignButtonInCompactMode={false}
                                                    pendingUsers={[]}
                                                    setPendingUsers={() => { }}
                                                />
                                            </div>

                                            {renderParentTaskInfo(task)}
                                        </div>
                                    </div>

                                    {/* Right section with delete button and arrow */}
                                    <div className="flex items-center space-x-2 self-center">
                                        {canManage && !project?.read_only && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemoveTask(task.id);
                                                }}
                                                className="p-2 cursor-pointer text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Remove from milestone"
                                            >
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        )}

                                        <div className="flex items-center h-full">
                                            <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                                                <FaChevronRight className="text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" size={12} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                        <div className="flex flex-col items-center">
                            <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3 mb-3">
                                <FaPlus className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <p className="font-medium">No tasks assigned yet</p>
                            <p className="text-sm mt-1">Add tasks to track progress</p>
                            {canManage && !project?.read_only && (
                                <button
                                    onClick={() => setShowTaskSelector(true)}
                                    className="mt-3 flex items-center cursor-pointer px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                                >
                                    <FaPlus className="mr-1.5" />
                                    Add Tasks
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};