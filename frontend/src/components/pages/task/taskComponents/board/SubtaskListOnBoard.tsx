import React, { useState } from 'react';
import { FaChevronDown, FaCheckCircle, FaCircle, FaTasks, FaFlag, FaTag, FaPlus } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { updateTaskStatus, createTask } from '../../../../../services/taskService';
import { useAuth } from '../../../../../hooks/useAuth';
import { Task } from '../../../../../types/task';
import { useNavigate } from 'react-router-dom';
import { TaskAssignments } from '../../taskHandler/assignments/TaskAssignments';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import toast from 'react-hot-toast';

interface SubtaskListProps {
    task: Task;
    onTaskUpdate?: (updatedTask: Task) => void;
    projectId: string;
    canManageTasks: boolean;
}

export const SubtaskListOnBoard: React.FC<SubtaskListProps> = ({
    task,
    onTaskUpdate,
    projectId,
    canManageTasks
}) => {
    const [expanded, setExpanded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { authState } = useAuth();
    const navigate = useNavigate();

    // Derive counts
    const completedSubtasks = task.subtasks?.filter(s => s.status === 'completed').length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const handleToggleComplete = async (subtask: Task, e: React.MouseEvent) => {
        e.stopPropagation();

        const newStatus = subtask.status === 'completed' ? 'not-started' : 'completed';
        try {
            // Optimistic update
            const updatedSubtasks = task.subtasks?.map(s =>
                s.id === subtask.id ? { ...s, status: newStatus } : s
            ) || [];

            const updatedTask: Task = { ...task, subtasks: updatedSubtasks };
            onTaskUpdate?.(updatedTask);

            // Persist change
            await updateTaskStatus(subtask.id, projectId, authState.accessToken!, newStatus);
        } catch (error) {
            console.error('Error updating subtask:', error);
            // Revert on error if needed
            onTaskUpdate?.(task);
        }
    };

    const handleSubtaskClick = (e: React.MouseEvent, subtaskId: string) => {
        e.stopPropagation();
        navigate(`/projects/${projectId}/tasks/${subtaskId}`);
    };

    const handleMilestoneClick = (e: React.MouseEvent, milestoneId: string) => {
        e.stopPropagation();
        navigate(`/projects/${projectId}/milestones/${milestoneId}`);
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim()) return;

        setIsLoading(true);
        try {
            const newSubtask = await createTask(
                projectId,
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
                // Ensure we include milestone information if it exists in the parent task
                milestone_id: task.milestone_id,
                milestone_name: task.milestone_name
            }];

            const updatedTask = {
                ...task,
                subtasks: updatedSubtasks
            };

            onTaskUpdate?.(updatedTask);

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

    if (totalSubtasks === 0 && !canManageTasks) {
        return null;
    }

    return (
        <div className="mt-3 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header with toggle button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                }}
                className="w-full flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
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
                    {/* Progress bar */}
                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-full rounded-full ${completedSubtasks === totalSubtasks
                                ? 'bg-green-500'
                                : 'bg-indigo-500'
                                }`}
                        />
                    </div>

                    {/* Chevron icon */}
                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
                    >
                        <FaChevronDown size={10} className="text-gray-500 dark:text-gray-400" />
                    </motion.div>
                </div>
            </button>

            {/* Subtasks list - animated */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-gray-100 dark:border-gray-700"
                    >

                        {canManageTasks && !isAdding && totalSubtasks > 0 && (
                            <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAdding(true);
                                    }}
                                    className="w-full flex items-center cursor-pointer justify-center gap-2 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-md transition-colors"
                                >
                                    <FaPlus size={12} />
                                    Add subtask
                                </motion.button>
                            </div>
                        )}

                        {/* Add subtask form */}
                        {canManageTasks && isAdding && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 border-b border-gray-100 dark:border-gray-700 cursor-default"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer mb-3">
                                        Add new subtask
                                    </h4>
                                    <div className="flex flex-col space-y-3">
                                        <input
                                            type="text"
                                            value={newSubtaskTitle}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                setNewSubtaskTitle(e.target.value)
                                            }}
                                            placeholder="e.g. Research competitors, Draft initial design"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => {
                                                e.stopPropagation();
                                                if (e.key === 'Enter') handleAddSubtask();
                                                if (e.key === 'Escape') {
                                                    setIsAdding(false);
                                                    setNewSubtaskTitle('');
                                                }
                                            }}
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsAdding(false);
                                                    setNewSubtaskTitle('');
                                                }}
                                                className="px-4 py-2 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddSubtask();
                                                }}
                                                disabled={isLoading || !newSubtaskTitle.trim()}
                                                className="px-4 py-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Adding...
                                                    </>
                                                ) : 'Add Subtask'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {totalSubtasks > 0 ? (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {task.subtasks?.map(subtask => (
                                    <motion.li
                                        key={subtask.id}
                                        layout
                                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                        onClick={(e) => handleSubtaskClick(e, subtask.id)}
                                    >
                                        <div className="flex flex-col gap-2">
                                            {/* Top row - Checkbox, title, and arrow */}
                                            <div className="flex items-start gap-3">
                                                <button
                                                    onClick={(e) => handleToggleComplete(subtask, e)}
                                                    className={`flex-shrink-0 cursor-pointer h-5 w-5 rounded-md flex items-center justify-center transition-all mt-1 ${subtask.status === 'completed'
                                                        ? 'bg-green-100 dark:bg-green-900/40 border border-green-400 dark:border-green-600'
                                                        : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
                                                        }`}
                                                >
                                                    {subtask.status === 'completed' ? (
                                                        <FaCheckCircle className="text-green-600 dark:text-green-400" size={12} />
                                                    ) : (
                                                        <FaCircle className="text-gray-400 dark:text-gray-500" size={8} />
                                                    )}
                                                </button>

                                                <div className="flex-1 min-w-0 cursor-pointer">
                                                    <div className={`font-medium text-sm ${subtask.status === 'completed'
                                                        ? 'text-gray-500 dark:text-gray-500 line-through'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {subtask.title}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => handleSubtaskClick(e, subtask.id)}
                                                    className="p-1.5 rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Middle row - Labels */}
                                            {subtask.labels && subtask.labels.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 ml-8">
                                                    {subtask.labels.slice(0, 3).map((label: any) => {
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
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <FaTag className="mr-1" size={10} />
                                                                {label.name}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Bottom row - Milestone, due date, and assignments */}
                                            <div className="flex justify-between items-center ml-8">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {subtask.milestone_id && (
                                                        <button
                                                            onClick={(e) => handleMilestoneClick(e, subtask.milestone_id!)}
                                                            className="inline-flex cursor-pointer hover:underline items-center text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/30 transition"
                                                        >
                                                            <FaFlag className="mr-1.5 h-3 w-3" />
                                                            {subtask.milestone_name || 'Milestone'}
                                                        </button>
                                                    )}

                                                    {subtask.due_date && (
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${subtask.status !== 'completed'
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
                                                </div>

                                                {/* Assignments moved to bottom right */}
                                                <div className="flex-shrink-0">
                                                    <TaskAssignments
                                                        taskIdFromCompactMode={subtask.id}
                                                        pendingUsers={[]}
                                                        setPendingUsers={() => { }}
                                                        compactMode={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-center">

                                {canManageTasks && !isAdding && (
                                    <div className="p-3  dark:border-gray-700">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsAdding(true);
                                            }}
                                            className="w-full flex items-center cursor-pointer justify-center gap-2 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-md transition-colors"
                                        >
                                            <FaPlus size={12} />
                                            Add subtask
                                        </motion.button>
                                    </div>
                                )}
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    No subtasks yet
                                </p>
                            </div>


                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};