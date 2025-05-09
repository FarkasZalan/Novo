import React, { useState } from 'react';
import { FaPlus, FaTasks } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { createTask, deleteTask, updateTask, updateTaskStatus } from '../../../../../services/taskService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../hooks/useAuth';
import { Task } from '../../../../../types/task';
import { SubtaskItem } from './SubtaskItem';

interface SubtaskListProps {
    subtasks: Task[];
    parentTaskId: string;
    onSubtaskUpdated: () => void;
    canManageTasks: boolean;
    projectId: string;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
    subtasks,
    parentTaskId,
    onSubtaskUpdated,
    canManageTasks,
    projectId
}) => {
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { authState } = useAuth();
    const navigate = useNavigate();

    const handleAddSubtask = async () => {
        if (!newSubtaskTitle.trim()) return;

        setIsLoading(true);
        try {
            await createTask(
                projectId,
                authState.accessToken!,
                newSubtaskTitle,
                '',
                undefined,
                'low',
                'not-started',
                [],
                parentTaskId
            );

            setNewSubtaskTitle('');
            setIsAdding(false);
            onSubtaskUpdated();
        } catch (error) {
            console.error('Error adding subtask:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const completedCount = subtasks.filter(s => s.status === 'completed').length;
    const progressPercentage = subtasks.length > 0
        ? Math.round((completedCount / subtasks.length) * 100)
        : 0;

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Subtasks</h3>
                    {subtasks.length > 0 && (
                        <span className="text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            {completedCount} of {subtasks.length}
                        </span>
                    )}
                </div>

                {canManageTasks && !isAdding && (
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsAdding(true)}
                        className="flex items-center cursor-pointer space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
                    >
                        <FaPlus size={12} />
                        <span>Add subtask</span>
                    </motion.button>
                )}
            </div>

            {/* Add subtask input */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4"
                    >
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Add new subtask
                            </h4>
                            <div className="flex flex-col space-y-3">
                                <input
                                    type="text"
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    placeholder="e.g. Research competitors, Draft initial design"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                                        className="px-4 py-2 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddSubtask}
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
            </AnimatePresence>

            {/* Progress bar */}
            {subtasks.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Progress
                        </span>
                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            {progressPercentage}%
                        </span>
                    </div>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`h-full rounded-full ${progressPercentage === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <AnimatePresence>
                    {subtasks.length > 0 ? (
                        subtasks.map((subtask) => (
                            <SubtaskItem
                                key={subtask.id}
                                subtask={subtask}
                                onToggleComplete={(id, completed) => {
                                    updateTaskStatus(
                                        id,
                                        projectId,
                                        authState.accessToken!,
                                        completed ? 'completed' : 'not-started'
                                    ).then(onSubtaskUpdated);
                                }}
                                onDelete={(id) => {
                                    deleteTask(id, projectId, authState.accessToken!).then(onSubtaskUpdated);
                                }}
                                onEdit={(id) => navigate(`/projects/${projectId}/tasks/${id}/edit`)}
                                onUpdate={async (updates) => {
                                    await updateTask(
                                        updates.id,
                                        projectId,
                                        authState.accessToken!,
                                        updates.title,
                                        updates.description || '',
                                        updates.due_date ? new Date(updates.due_date) : undefined,
                                        updates.priority || undefined,
                                        updates.status || undefined,
                                        updates.labels || []
                                    ).then(onSubtaskUpdated);
                                }}
                                canManageTasks={canManageTasks}
                                onNavigateToTask={() => navigate(`/projects/${projectId}/tasks/${subtask.id}`)}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="py-8 text-center rounded-xl bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 border border-dashed border-gray-300 dark:border-gray-700"
                        >
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="p-3 rounded-full bg-indigo-100/80 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                    <FaTasks size={20} />
                                </div>
                                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                    No subtasks yet
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                                    Break this task down into smaller, manageable steps
                                </p>
                                {canManageTasks && (
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIsAdding(true)}
                                        className="mt-2 flex cursor-pointer items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
                                    >
                                        <FaPlus size={12} />
                                        <span>Create your first subtask</span>
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};