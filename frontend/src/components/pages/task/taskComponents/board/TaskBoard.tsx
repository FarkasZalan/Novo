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
    TouchSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { updateTaskStatus } from '../../../../../services/taskService';
import { isPast, isToday, isTomorrow } from 'date-fns';

// status column styles
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
    tasks: Task[]; // list of all tasks
    onTaskUpdate?: (updatedTask: Task) => void; // when a task is moviving update it
    canManageTasks: boolean; // if the user can manage tasks (admin or owner role) that checked in the TaskManaggerPage
}

// the main task board
export const TaskBoard: React.FC<TaskBoardProps> = React.memo(({ tasks, onTaskUpdate, canManageTasks }) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const [activeTask, setActiveTask] = useState<Task | null>(null); // the task currently being dragged

    // detect when user dragging with mouse, touch or keyboard
    const sensors = useSensors(

        // mouse
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8 // how many pixels the user needs to drag before the drag operation starts
            }
        }),

        // keyboard
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        }),

        // touch
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // how long the user needs to hold the touch before the drag operation starts
                tolerance: 5 // how many pixels the user can move before the drag operation starts
            }
        }),
    );

    // if the user have permission to add tasks
    // this will be checked on the StatusColumn component
    const handleAddTask = (statusKey: string) => {
        navigate(`/projects/${projectId}/tasks/new?status=${statusKey}`);
    };

    // when the drag starts save the task being active (dragged)
    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
        task && setActiveTask(task);
    };

    // when the drag ends
    const handleDragEnd = async (event: DragEndEvent) => {
        const { over } = event; // where the task is dropped

        // if there is no task being dragged or there is no place to drop the task
        if (!over || !activeTask) return;

        // ?? -> if the left side is undefinied or null so misssing then use the right side
        const newStatus = over.data.current?.status ?? activeTask.status;

        // if the new status is the same as the old status so stay in the original column then exit
        if (newStatus === activeTask.status) {
            setActiveTask(null);
            return;
        }

        // Save original task for potential rollback in case of error
        const originalTask = activeTask;

        try {
            // update task status on local state first with calling the parent callback to update the local task list for smooth UI (optimistic update)
            const updatedTask: Task = { ...activeTask, status: newStatus };
            onTaskUpdate?.(updatedTask);

            // update task status on backend
            await updateTaskStatus(activeTask.id, projectId!, authState.accessToken!, newStatus);
            toast.success(`${activeTask.title} moved to ${statusLabels[newStatus].label}`);
        } catch (error) {
            console.error("Error updating task status:", error);
            toast.error("Failed to update task status");
            // Revert optimistic update
            onTaskUpdate?.(originalTask);
        } finally {
            // clean up
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

    // DnD Context = wraps the whole board in drag and drop context
    // motion.div = animated layout for the 3 columns
    // StatusColumn = render each column separately
    // DragOverlay = when we grab the task this is the preview, the floating card at the cursor
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
                                <div className="flex items-center gap-1">
                                    <span className={
                                        `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activeTask.status !== 'completed'
                                            ? isPast(new Date(activeTask.due_date)) || isToday(new Date(activeTask.due_date))
                                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" // Overdue/Today
                                                : isTomorrow(new Date(activeTask.due_date))
                                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" // Tomorrow
                                                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" // Future
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" // Completed
                                        }`
                                    }>
                                        Due {new Date(activeTask.due_date).toLocaleDateString()}
                                        {/* status indicator */}
                                        {activeTask.status !== 'completed' && isToday(new Date(activeTask.due_date)) && " • Today"}
                                        {activeTask.status !== 'completed' && isTomorrow(new Date(activeTask.due_date)) && " • Tomorrow"}
                                    </span>
                                </div>
                            )}
                            {getPriorityBadge(activeTask.priority)}
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
});