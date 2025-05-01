import { useState } from 'react';
import { FaTrash, FaPlus, FaSpinner, FaTimes, FaSearch, FaCheck, FaPaperclip, FaCalendarDay } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../../../../types/task';
import { TaskAssignments } from '../../taskHandler/assignments/TaskAssignments';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

interface MilestoneTasksProps {
    milestone: Milestone;
    tasks: Task[];
    milestoneTasks: Task[];
    canManage: boolean;
    onAddTasks: (taskIds: string[]) => Promise<void>;
    onRemoveTask: (taskId: string) => Promise<void>;
}

export const MilestoneTasks: React.FC<MilestoneTasksProps> = ({
    milestone,
    tasks,
    milestoneTasks,
    canManage,
    onAddTasks,
    onRemoveTask,
}) => {
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showTaskSelector, setShowTaskSelector] = useState(false);
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

    const formatDate = (dateString: string) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

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

    const statusColors: Record<string, string> = {
        'not-started': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
        'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
    };

    const priorityColors: Record<string, string> = {
        'low': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
        'high': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    };

    const getDueDateColor = (dueDate: string, status: string) => {
        if (status === 'completed') return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

        const date = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date < today) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
        if (date.toDateString() === today.toDateString()) return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200";
        if (date.toDateString() === tomorrow.toDateString()) return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200";

        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
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

                    {canManage && (
                        <button
                            onClick={() => setShowTaskSelector(!showTaskSelector)}
                            className="flex items-center px-4 py-2.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                        >
                            <FaPlus className="mr-2" />
                            Add Tasks
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
                                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedTaskIds.includes(task.id)
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                                                }`}
                                            onClick={() => toggleTaskSelection(task.id)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="mt-1">
                                                    <div className={`flex items-center justify-center h-5 w-5 rounded border transition-colors ${selectedTaskIds.includes(task.id)
                                                        ? 'bg-indigo-600 border-indigo-600'
                                                        : 'border-gray-300 dark:border-gray-500'
                                                        }`}>
                                                        {selectedTaskIds.includes(task.id) && (
                                                            <FaCheck className="h-3 w-3 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {task.title}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
                                                            {task.status.replace('-', ' ')}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                                                            {task.priority}
                                                        </span>
                                                        {task.due_date && (
                                                            <span className={`text-xs px-2 py-1 rounded-full ${getDueDateColor(task.due_date, task.status)}`}>
                                                                <FaCalendarDay className="inline mr-1" />
                                                                {formatDate(task.due_date)}
                                                            </span>
                                                        )}
                                                        {task.attachments_count > 0 && (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                                                <FaPaperclip className="inline mr-1" />
                                                                {task.attachments_count}
                                                            </span>
                                                        )}
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
                    <div className="space-y-3">
                        {milestoneTasks.map(task => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={(e) => handleTaskClick(task.id, e)}
                                className="group flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer"
                            >
                                <div className="flex items-start space-x-4 w-full">
                                    <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${task.status === 'completed' ? 'bg-green-500' :
                                        task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                            {task.title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}>
                                                {task.status.replace('-', ' ')}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                                                {task.priority}
                                            </span>
                                            {task.due_date && (
                                                <span className={`text-xs px-2 py-1 rounded-full ${getDueDateColor(task.due_date, task.status)}`}>
                                                    <FaCalendarDay className="inline mr-1" />
                                                    {formatDate(task.due_date)}
                                                </span>
                                            )}
                                            {task.attachments_count > 0 && (
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                                    <FaPaperclip className="inline mr-1" />
                                                    {task.attachments_count}
                                                </span>
                                            )}
                                            <TaskAssignments
                                                compactMode={true}
                                                taskIdFromCompactMode={task.id}
                                                showAssignButtonInCompactMode={false}
                                                pendingUsers={[]}
                                                setPendingUsers={() => { }}
                                            />
                                        </div>
                                    </div>
                                    {canManage && (
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
                            {canManage && (
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