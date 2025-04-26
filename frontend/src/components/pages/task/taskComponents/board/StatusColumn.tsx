import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Task } from '../../../../../types/task';
import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import DraggableTaskCard from './DraggableTaskCard';

interface Props {
    statusKey: string;
    statusInfo: { label: string; icon: React.ReactNode; color: string };
    tasks: Task[];
    onAddTask: (status: string) => void;
    canManageTasks: boolean;
    activeTask: Task | null;
}

// represent a column in the task board
const StatusColumn: React.FC<Props> = React.memo(({
    statusKey,
    statusInfo,
    tasks,
    onAddTask,
    canManageTasks,
    activeTask
}) => {
    // useDroppable make the element accept draggable items
    // setNodeRef where we want to drop the draggable items
    // isOver is a boolean that is true when the user is hovering over a task over a column
    const { setNodeRef, isOver } = useDroppable({
        id: statusKey, // the id of the column (not-started, in-progress, completed)
        data: {
            type: 'column',
            status: statusKey
        }
    });

    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center space-x-2">
                    {statusInfo.icon}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{statusInfo.label}</h3>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
            </div>

            {/* dropable area*/}
            <motion.div
                ref={setNodeRef}
                className={`flex-1 rounded-xl p-4 ${statusInfo.color} min-h-64 transition-all duration-200`}
                animate={{
                    scale: isOver ? 1.02 : 1,
                    border: isOver ? '2px solid #818cf8' : '2px solid transparent'
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                <div className="space-y-3">
                    {/* add task button if the user have permission */}
                    {canManageTasks && (
                        <motion.button
                            onClick={() => onAddTask(statusKey)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex cursor-pointer items-center justify-center gap-2 p-3 text-sm font-medium rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all mb-3"
                        >
                            <FaPlus />
                            <span>Add Task</span>
                        </motion.button>
                    )}

                    {isOver && activeTask?.status !== statusKey && (
                        <div className="rounded-xl bg-white dark:bg-gray-700/50 border-2 border-dashed border-indigo-400 p-4 mb-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                Move "{activeTask?.title}" to {statusInfo.label}
                            </p>
                        </div>
                    )}

                    {/* tasks in the column */}
                    {tasks.map((task) => (
                        <motion.div
                            key={task.id}
                            layout
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* one task card */}
                            <DraggableTaskCard task={task} />
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
});

export default StatusColumn;