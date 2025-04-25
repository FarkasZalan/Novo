import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import DraggableTaskCard from './DraggableTaskCard';
import { FaPlus } from 'react-icons/fa';
import { Task } from '../../../../../types/task';
import { motion } from 'framer-motion';

const ITEM_TYPE = 'TASK';

interface Props {
    statusKey: string;
    statusInfo: { label: string; icon: React.ReactNode; color: string };
    tasks: Task[];
    onAddTask: (status: string) => void;
    onTaskUpdate: (taskId: string, newStatus: string) => Promise<void>;
    draggedTask: Task | null;
    setDraggedTask: (task: Task | null) => void;
    canManageTasks: boolean;
}

// Droppable Column Component representing a task status column
const StatusColumn: React.FC<Props> = React.memo(({
    statusKey,
    statusInfo,
    tasks,
    onAddTask,
    onTaskUpdate,
    draggedTask,
    setDraggedTask,
    canManageTasks
}) => {
    // Create a ref for the column element
    const columnRef = useRef<HTMLDivElement>(null);

    // Enable this column as a drop target
    const [{ isOver }, dropRef] = useDrop(() => ({
        // Accept only tasks
        accept: ITEM_TYPE,

        // called when task is dropped -> it's triggers the task update
        drop: (item: { taskId: string }) => {
            onTaskUpdate(item.taskId, statusKey);
        },

        // just a flag (isOver) so change the style while hovering
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    // Apply the drop ref to our element ref
    dropRef(columnRef);

    const taskCards = React.useMemo(() => {
        return tasks.map((task) => (
            <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                <DraggableTaskCard
                    task={task}
                    setDraggedTask={setDraggedTask}
                />
            </motion.div>
        ));
    }, [tasks, onTaskUpdate, setDraggedTask]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center space-x-2">
                    {statusInfo.icon}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{statusInfo.label}</h3>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
            </div>

            <motion.div
                ref={columnRef}
                className={`flex-1 rounded-xl p-4 ${statusInfo.color} min-h-64 transition-all duration-200`}
                animate={{
                    scale: isOver ? 1.02 : 1,
                    border: isOver ? '2px solid #818cf8' : '2px solid transparent'
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                <div className="space-y-3">
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

                    {taskCards}

                    {isOver && (
                        <div className="rounded-xl bg-white dark:bg-gray-700/50 border-2 border-dashed border-indigo-400 p-4 mb-3">
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                {draggedTask ? `Move "${draggedTask.title}" here` : "Drop here"}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
});

export default StatusColumn;
