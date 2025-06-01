import React, { useState } from 'react';
import { FaTasks, FaCheckCircle, FaCircle, FaChevronDown, FaPlus, FaTrash, FaFlag, FaPaperclip, FaTag, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../../hooks/useAuth';
import { updateTaskStatus, createTask } from '../../../../../services/taskService';
import { Task } from '../../../../../types/task';
import { TaskAssignments } from '../assignments/TaskAssignments';
import { ConfirmationDialog } from '../../../project/ConfirmationDialog';
import toast from 'react-hot-toast';
import { isPast, isToday, isTomorrow, format } from 'date-fns';
import { CommentComponent } from '../taskDetails/Comments/Comments';

interface SubtaskListProps {
    task: Task;
    expanded: boolean;
    onToggleExpand: () => void;
    onSubtaskStatusChange: (taskId: string, subtaskId: string, newStatus: string) => void;
    canManageTasks: boolean;
    onDeleteSubtask: (taskId: string, subtaskId: string) => void;
    onTaskUpdate: (updatedTask: Task) => void;
    project: Project | null;
}

export const SubtaskList: React.FC<SubtaskListProps> = React.memo(({
    task,
    expanded,
    onToggleExpand,
    onSubtaskStatusChange,
    canManageTasks,
    onDeleteSubtask,
    onTaskUpdate,
    project
}) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [subtaskToDelete, setSubtaskToDelete] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const completedSubtasks = task.subtasks?.filter(s => s.status === 'completed').length || 0;
    const totalSubtasks = task.subtasks?.length || 0;

    if (!task.subtasks || task.subtasks.length === 0) {
        return null;
    }

    const handleToggleSubtaskComplete = async (subtaskId: string, currentStatus: string) => {
        if (!projectId || !authState.accessToken) return;

        if (project?.read_only) {
            toast.error('This project is read-only. You cannot modify its tasks.');
            return;
        }

        const newStatus = currentStatus === 'completed' ? 'not-started' : 'completed';
        try {
            onSubtaskStatusChange(task.id, subtaskId, newStatus);
            await updateTaskStatus(subtaskId, projectId, authState.accessToken, newStatus);
        } catch (error) {
            console.error('Error updating subtask:', error);
            toast.error('Failed to update subtask');
        }
    };

    const initiateDelete = (e: React.MouseEvent, subtaskId: string) => {
        e.stopPropagation();
        setSubtaskToDelete(subtaskId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (subtaskToDelete) {
            onDeleteSubtask(task.id, subtaskToDelete);
        }
        setShowDeleteConfirm(false);
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim()) return;

        setIsLoading(true);
        try {
            const newSubtask = await createTask(
                projectId!,
                authState.accessToken!,
                newSubtaskTitle,
                '',
                undefined,
                'low',
                'not-started',
                [],
                task.id
            );

            // Update local state
            const updatedSubtasks = [...(task.subtasks || []), {
                ...newSubtask,
                milestone_id: task.milestone_id,
                milestone_name: task.milestone_name
            }];

            const updatedTask = {
                ...task,
                subtasks: updatedSubtasks
            };

            onTaskUpdate(updatedTask);
            setNewSubtaskTitle('');
            setIsAdding(false);
            toast.success('Subtask added successfully');
        } catch (error) {
            toast.error('Failed to add subtask');
            console.error('Error adding subtask:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getLabelTextColor = (hexColor: string) => {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? 'text-gray-900' : 'text-white';
    };

    const handleSubtaskClick = (e: React.MouseEvent, subtaskId: string) => {
        e.stopPropagation();
        navigate(`/projects/${projectId}/tasks/${subtaskId}`);
    };

    const handleMilestoneClick = (e: React.MouseEvent, milestoneId: string) => {
        e.stopPropagation();
        navigate(`/projects/${projectId}/milestones/${milestoneId}`);
    };

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
            case 'medium':
                return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
            case 'low':
            default:
                return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
        }
    };

    return (
        <div className="py-2">
            <div className="mx-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <button
                    onClick={onToggleExpand}
                    className="w-full cursor-pointer flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                            <FaTasks className="text-indigo-500 dark:text-indigo-400" size={12} />
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            Subtasks ({completedSubtasks}/{totalSubtasks})
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full hidden sm:block">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                                transition={{ duration: 0.6 }}
                                className={`h-full rounded-full ${completedSubtasks === totalSubtasks
                                    ? 'bg-green-500'
                                    : 'bg-indigo-500'
                                    }`}
                            />
                        </div>

                        <motion.div
                            animate={{ rotate: expanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
                        >
                            <FaChevronDown size={10} className="text-gray-500 dark:text-gray-400" />
                        </motion.div>
                    </div>
                </button>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-gray-100 dark:border-gray-700"
                        >
                            {/* Add subtask form */}
                            {canManageTasks && !project?.read_only && isAdding && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 border-b border-gray-100 dark:border-gray-700"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex flex-col space-y-3">
                                        <input
                                            type="text"
                                            value={newSubtaskTitle}
                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                            placeholder="Enter subtask title..."
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddSubtask();
                                                if (e.key === 'Escape') {
                                                    setIsAdding(false);
                                                    setNewSubtaskTitle('');
                                                }
                                            }}
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => {
                                                    setIsAdding(false);
                                                    setNewSubtaskTitle('');
                                                }}
                                                className="px-3 py-1.5 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddSubtask}
                                                disabled={isLoading || !newSubtaskTitle.trim()}
                                                className={`px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-md disabled:opacity-50 flex items-center ${isLoading || !newSubtaskTitle.trim() ? 'cursor-not-allowed' : 'cursor-pointer'
                                                    }`}
                                            >
                                                {isLoading ? 'Adding...' : 'Add Subtask'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Add subtask button */}
                            {canManageTasks && !project?.read_only && !isAdding && (
                                <div className="px-4 py-3 border-t cursor-pointer border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAdding(true);
                                    }}>
                                    <button
                                        className="w-full flex cursor-pointer items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border-2 border-dashed border-indigo-300 dark:border-indigo-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors duration-200 group"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-colors">
                                            <FaPlus className="text-indigo-600 dark:text-indigo-400 group-hover:text-white" size={14} />
                                        </div>
                                        <span className="font-medium text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-800 dark:group-hover:text-indigo-200">
                                            Add New Subtask
                                        </span>
                                    </button>
                                </div>
                            )}

                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {task.subtasks.map(subtask => (
                                    <motion.li
                                        key={subtask.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group cursor-pointer relative"
                                        onClick={(e) => handleSubtaskClick(e, subtask.id)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Left section with checkbox, title, and assignments */}
                                            <div className="flex items-start gap-3 flex-1">
                                                {/* Checkbox */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleSubtaskComplete(subtask.id, subtask.status);
                                                    }}
                                                    className={`flex-shrink-0 cursor-pointer h-5 w-5 rounded-md flex items-center justify-center transition-all mt-1 ${subtask.status === 'completed'
                                                        ? 'bg-green-100 dark:bg-green-900/40 border border-green-400 dark:border-green-600'
                                                        : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 group-hover:border-indigo-300 dark:group-hover:border-indigo-500'
                                                        }`}
                                                >
                                                    {subtask.status === 'completed' ? (
                                                        <FaCheckCircle className="text-green-600 dark:text-green-400" size={12} />
                                                    ) : (
                                                        <FaCircle className="text-gray-400 dark:text-gray-500" size={8} />
                                                    )}
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                    {/* Title */}
                                                    <div
                                                        className={`font-medium text-sm ${subtask.status === 'completed'
                                                            ? 'text-gray-500 dark:text-gray-500 line-through'
                                                            : 'text-gray-700 dark:text-gray-300'
                                                            }`}
                                                    >
                                                        {subtask.title}
                                                    </div>

                                                    {/* Labels and metadata */}
                                                    {(subtask.labels?.length! > 0 || subtask.milestone_id || subtask.due_date || subtask.attachments_count > 0) && (
                                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                                            {/* Labels */}
                                                            {subtask.labels?.slice(0, 2).map((label: any) => {
                                                                const hexColor = label.color.startsWith('#') ? label.color : `#${label.color}`;
                                                                const textColor = getLabelTextColor(hexColor);
                                                                return (
                                                                    <span
                                                                        key={label.id}
                                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${textColor}`}
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

                                                            {/* Milestone */}
                                                            {subtask.milestone_id && (
                                                                <button
                                                                    onClick={(e) => handleMilestoneClick(e, subtask.milestone_id!)}
                                                                    className="inline-flex cursor-pointer items-center text-xs font-medium bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full hover:bg-sky-200 dark:hover:bg-sky-800/30 transition"
                                                                >
                                                                    <FaFlag className="mr-1 h-3 w-3" />
                                                                    {subtask.milestone_name || 'Milestone'}
                                                                </button>
                                                            )}

                                                            {/* Due Date */}
                                                            {subtask.due_date && (
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${subtask.status !== 'completed'
                                                                    ? isPast(new Date(subtask.due_date)) || isToday(new Date(subtask.due_date))
                                                                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                                        : isTomorrow(new Date(subtask.due_date))
                                                                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                                                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                                                    }`}>
                                                                    {format(new Date(subtask.due_date), 'MMM d')}
                                                                    {subtask.status !== 'completed' && isToday(new Date(subtask.due_date)) && " • Today"}
                                                                    {subtask.status !== 'completed' && isTomorrow(new Date(subtask.due_date)) && " • Tomorrow"}
                                                                </span>
                                                            )}

                                                            {/* Attachments */}
                                                            {subtask.attachments_count > 0 && (
                                                                <span className="inline-flex items-center text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                                                    <FaPaperclip className="mr-1 h-3 w-3" />
                                                                    {subtask.attachments_count}
                                                                </span>
                                                            )}

                                                            {/* Comments */}
                                                            <CommentComponent
                                                                projectId={projectId!}
                                                                taskId={subtask.id}
                                                                compactMode={true}
                                                                canManageTasks={canManageTasks}
                                                                project={project}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Assignments - moved to left side */}
                                                    <div className="mt-2">
                                                        <TaskAssignments
                                                            showAssignButtonInCompactMode={true}
                                                            taskIdFromCompactMode={subtask.id}
                                                            pendingUsers={[]}
                                                            setPendingUsers={() => { }}
                                                            compactMode={true}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right section with priority and arrow */}
                                            <div className="flex items-center space-x-2 self-center gap-2">
                                                {/* Priority Badge */}
                                                <div className={`px-2 py-1 text-xs rounded-full font-semibold ${getPriorityBadgeClass(subtask.priority || 'low')}`}>
                                                    {subtask.priority || 'low'}
                                                </div>

                                                {/* Arrow and action buttons container */}
                                                <div className="flex items-center gap-1">
                                                    {/* Action buttons */}
                                                    <div className="flex items-center gap-1 transition-opacity">
                                                        {canManageTasks && !project?.read_only && (
                                                            <button
                                                                onClick={(e) => initiateDelete(e, subtask.id)}
                                                                className="p-1.5 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                                title="Delete subtask"
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleSubtaskClick(e, subtask.id)}
                                                            className="p-1.5 rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
                                                        >
                                                            <FaChevronRight size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Subtask?"
                message="Are you sure you want to delete this subtask? This action cannot be undone."
                confirmText="Delete Subtask"
                confirmColor="red"
            />
        </div>
    );
});