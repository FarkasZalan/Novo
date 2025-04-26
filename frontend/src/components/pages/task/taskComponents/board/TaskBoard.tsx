import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaCircle } from 'react-icons/fa';
import { useAuth } from '../../../../../context/AuthContext';
import toast from 'react-hot-toast';
import { Task } from '../../../../../types/task';
import StatusColumn from './StatusColumn';
import { motion } from 'framer-motion';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { updateTaskStatus } from '../../../../../services/taskService';

const statusLabels: Record<string, { label: string, icon: React.ReactNode, color: string }> = {
    'not-started': {
        label: 'Not Started',
        icon: <FaCircle className="text-gray-400" />,
        color: 'bg-gray-200/50 dark:bg-gray-700/50'
    },
    'in-progress': {
        label: 'In Progress',
        icon: <FaClock className="text-yellow-600" />,
        color: 'bg-yellow-100/60 dark:bg-yellow-900/30'
    },
    'completed': {
        label: 'Completed',
        icon: <FaCheckCircle className="text-green-600" />,
        color: 'bg-green-100/60 dark:bg-green-900/30'
    },
};

interface TaskBoardProps {
    tasks: Task[];
    onTaskUpdate?: (updatedTask: Task) => void;
    canManageTasks: boolean;
}

export const TaskBoard: React.FC<TaskBoardProps> = React.memo(({ tasks, onTaskUpdate, canManageTasks }) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleAddTask = (statusKey: string) => {
        navigate(`/projects/${projectId}/tasks/new?status=${statusKey}`);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
        task && setActiveTask(task);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { over } = event;
        if (!over || !activeTask) return;

        const newStatus = over.data.current?.status ?? activeTask.status;
        if (newStatus === activeTask.status) {
            setActiveTask(null);
            return;
        }

        // Save original task for potential rollback
        const originalTask = activeTask;

        try {
            // Optimistic update
            const updatedTask: Task = { ...activeTask, status: newStatus };
            onTaskUpdate?.(updatedTask);

            // API call
            await updateTaskStatus(activeTask.id, projectId!, authState.accessToken!, newStatus);
            toast.success(`${activeTask.title} moved to ${statusLabels[newStatus].label}`);
        } catch (error) {
            console.error("Error updating task status:", error);
            toast.error("Failed to update task status");
            // Revert optimistic update
            onTaskUpdate?.(originalTask);
        } finally {
            setActiveTask(null);
        }
    };

    const getPriorityBadge = (priority: string) => {
        const colors = {
            low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };

        return (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[priority as keyof typeof colors]}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        );
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
            >
                {Object.entries(statusLabels).map(([statusKey, statusInfo]) => (
                    <StatusColumn
                        key={statusKey}
                        statusKey={statusKey}
                        statusInfo={statusInfo}
                        tasks={tasks.filter(t => t.status === statusKey)}
                        onAddTask={handleAddTask}
                        canManageTasks={canManageTasks}
                        activeTask={activeTask}
                    />
                ))}
            </motion.div>

            <DragOverlay>
                {activeTask && (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-grab border-2 border-indigo-400 opacity-90">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{activeTask.title}</h4>
                        {activeTask.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {activeTask.description}
                            </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                            {activeTask.due_date && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Due {new Date(activeTask.due_date).toLocaleDateString()}
                                </span>
                            )}
                            {getPriorityBadge(activeTask.priority)}
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
});