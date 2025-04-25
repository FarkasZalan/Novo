import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaCircle } from 'react-icons/fa';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { updateTaskStatus } from '../../../../../services/taskService';
import { useAuth } from '../../../../../context/AuthContext';
import toast from 'react-hot-toast';
import { Task } from '../../../../../types/task';
import StatusColumn from './StatusColumn';
import { motion } from 'framer-motion';

interface TaskBoardProps {
    tasks: Task[];
    onTaskUpdate?: (updatedTask: Task) => void;
    canManageTasks: boolean;
}

const statusLabels: Record<string, { label: string, icon: React.ReactNode, color: string }> = {
    'not-started': {
        label: 'Not Started',
        icon: <FaCircle className="text-gray-400" />,
        color: 'bg-gray-200/50 dark:bg-gray-700/50'
    },
    'in-progress': {
        label: 'In Progress',
        icon: <FaClock className="text-yellow-500" />,
        color: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    'completed': {
        label: 'Completed',
        icon: <FaCheckCircle className="text-green-500" />,
        color: 'bg-green-50 dark:bg-green-900/20'
    },
};

// tasks = list of all tasks
// onTaskUpdate = function to pass the task id and the new status when a task is moved
export const TaskBoard: React.FC<TaskBoardProps> = React.memo(({ tasks, onTaskUpdate, canManageTasks }) => {
    const navigate = useNavigate();

    // useParams to get the project id from the url
    const { projectId } = useParams<{ projectId: string }>();

    // give the current logged-in user's info (id and token)
    const { authState } = useAuth();
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);

    const handleSetDraggedTask = useCallback((task: Task | null) => {
        setDraggedTask(task);
    }, []);

    // when user clicks 'Add Task'
    const handleAddTask = (statusKey: string) => {
        navigate(`/projects/${projectId}/tasks/new?status=${statusKey}`);
    };

    // called when the task is dropped into a new column
    const handleTaskUpdate = useCallback(
        async (taskId: string, newStatus: string) => {
            try {
                // Find the task that is being dragged
                const taskToUpdate = tasks.find(task => task.id === taskId);

                if (!taskToUpdate) {
                    return; // Skip if the task not found
                }

                // Create the updated task with the new status
                const updatedTask: Task = {
                    ...taskToUpdate,
                    status: newStatus
                };

                // Call the service to update the task on the backend
                await updateTaskStatus(taskId, projectId!, authState.accessToken!, newStatus);

                // Call tha parent component's (TaskManaggerPage.tsx) onTaskUpdate so the parent can update it's copy of the task list
                onTaskUpdate?.(updatedTask);

                // Show a success toast
                toast.success(`${taskToUpdate.title} moved to ${statusLabels[newStatus].label}`);
            } catch (error) {
                console.error("Error updating task status:", error);
                toast.error("Failed to update task status");
            }
        },

        // only re-run if the tasks or projectId or accessToken or onTaskUpdate changes
        [tasks, projectId, authState.accessToken, onTaskUpdate]
    );

    // Memoize the status columns to prevent unnecessary re-renders
    const statusColumns = React.useMemo(() => {
        // loop through the status labels (created at the top of the file) and create a column for each
        return Object.entries(statusLabels).map(([statusKey, statusInfo]) => {

            // split tasks by status
            const statusTasks = tasks.filter(task => task.status === statusKey);
            return (
                <StatusColumn
                    key={statusKey}
                    statusKey={statusKey}
                    statusInfo={statusInfo}
                    tasks={statusTasks}
                    onAddTask={handleAddTask}
                    onTaskUpdate={handleTaskUpdate}
                    draggedTask={draggedTask}
                    setDraggedTask={handleSetDraggedTask}
                    canManageTasks={canManageTasks}
                />
            );
        });
    }, [tasks, handleTaskUpdate, draggedTask, handleSetDraggedTask]);


    // Dnd Provider = drag and drop react component
    // HTML5Backend = use the browser drag and drop system (like dragging and dropping files in a browser)
    // the HTML5Backend is the engine that makes the drag and drop work because react alone can't handle drag and drop
    // the react-dnd (libary) connect to the browser's drag and drop system
    // it's like the DndProvider is the controller that lets us move things around
    // and the HTML5Backend is the wiring that connects the controller to the game
    return (
        <DndProvider backend={HTML5Backend}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
            >
                {statusColumns}
            </motion.div>
        </DndProvider>
    );
});