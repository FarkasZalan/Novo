import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaCircle, FaPaperclip, FaFlag, FaBan, FaTag } from 'react-icons/fa';
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
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { useAuth } from '../../../../../hooks/useAuth';

// status column styles
const statusLabels: Record<string, { label: string, icon: React.ReactNode, color: string }> = {
    'not-started': {
        label: 'To Do',
        icon: <FaCircle className="text-gray-400" />,
        color: 'bg-gray-200/50 dark:bg-gray-700/50'
    },
    'in-progress': {
        label: 'In Progress',
        icon: <FaClock className="text-yellow-600" />,
        color: 'bg-yellow-100/60 dark:bg-yellow-900/30'
    },
    'blocked': {
        label: 'Blocked',
        icon: <FaBan className="text-red-600" />,
        color: 'bg-red-100/60 dark:bg-red-900/30'
    },
    'completed': {
        label: 'Completed',
        icon: <FaCheckCircle className="text-green-600" />,
        color: 'bg-green-100/60 dark:bg-green-900/30'
    },
};

interface TaskBoardProps {
    tasks: Task[]; // list of all tasks
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>; // update the list of tasks
    onTaskUpdate?: (updatedTask: Task) => void; // when a task is moviving update it
    canManageTasks: boolean; // if the user can manage tasks (admin or owner role) that checked in the TaskManaggerPage
}

// the main task board
export const TaskBoard: React.FC<TaskBoardProps> = React.memo(({ tasks, setTasks, onTaskUpdate, canManageTasks }) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const [activeTask, setActiveTask] = useState<Task | null>(null); // the task currently being dragged
    const [_scrollLeft, setScrollLeft] = useState(0);

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
        const updatedTask: Task = { ...activeTask, status: newStatus };

        try {
            // update task status on local state first with calling the parent setTasks to update the local task list for smooth UI (optimistic update)
            setTasks(currentTasks =>
                currentTasks.map(task =>
                    task.id === updatedTask.id ? updatedTask : task
                )
            );

            // update task status on backend
            await updateTaskStatus(activeTask.id, projectId!, authState.accessToken!, newStatus);
            toast.success(`${activeTask.title} moved to ${statusLabels[newStatus].label}`);

            // Notify parent of successful update
            onTaskUpdate?.(updatedTask);
        } catch (error) {
            console.error("Error updating task status:", error);
            toast.error("Failed to update task status");

            // Revert optimistic update
            setTasks(currentTasks =>
                currentTasks.map(task =>
                    task.id === originalTask.id ? originalTask : task
                )
            );

            // Notify parent of failed update
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

    const getLabelTextColor = (hexColor: string) => {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? 'text-gray-900' : 'text-white';
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
                className="flex  pb-4"
                onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
            >
                <div className="flex flex-nowrap overflow-x-auto scroll-container gap-4 w-full">
                    {Object.entries(statusLabels).map(([statusKey, statusInfo]) => (
                        <div key={statusKey} className="flex-1 min-w-[300px]">
                            <StatusColumn
                                statusKey={statusKey}
                                statusInfo={statusInfo}
                                tasks={tasks.filter(t => t.status === statusKey)}
                                onAddTask={handleAddTask}
                                canManageTasks={canManageTasks}
                                activeTask={activeTask}
                            />
                        </div>
                    ))}
                </div>
            </motion.div>

            <DragOverlay>
                {activeTask && (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-grab border-2 border-indigo-400 opacity-90">
                        {/* Header: Title + Priority */}
                        <div className="flex justify-between items-start gap-3">
                            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex-1 truncate">
                                {activeTask.title}
                            </h4>
                            {getPriorityBadge(activeTask.priority)}
                        </div>

                        {/* Labels */}
                        {activeTask.labels && activeTask.labels.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {activeTask.labels.slice(0, 3).map((label: any) => {
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

                                {/* +X more labels indicator with hover popup */}
                                {activeTask.labels.length > 3 && (
                                    <div className="relative inline-block">
                                        <span
                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors peer"
                                        >
                                            +{activeTask.labels.length - 3}
                                        </span>

                                        {/* Hidden labels popup - appears ONLY on +X hover */}
                                        <div className="absolute z-50 hidden peer-hover:block bottom-full mb-2 left-0 min-w-max bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border border-gray-200 dark:border-gray-700">
                                            <div className="flex flex-wrap gap-1">
                                                {activeTask.labels.slice(3).map((label: any) => {
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
                                            {/* Tooltip arrow */}
                                            <div className="absolute -bottom-1 left-2 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45 -z-10"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Row: Milestone & Attachments */}
                        <div className="flex justify-between items-center mt-4 gap-2">
                            {activeTask.milestone_id && (
                                <button
                                    className="inline-flex cursor-pointer hover:underline items-center text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/30 transition"
                                >
                                    <FaFlag className="mr-1.5 h-3 w-3" />
                                    {activeTask.milestone_name || 'Milestone'}
                                </button>
                            )}


                        </div>

                        <div className="flex justify-between items-center mt-4 gap-2">
                            {/* Left side - Due date and attachments */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Due Date */}
                                {activeTask.due_date && (
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${activeTask.status !== 'completed'
                                        ? isPast(new Date(activeTask.due_date)) || isToday(new Date(activeTask.due_date))
                                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                            : isTomorrow(new Date(activeTask.due_date))
                                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                                : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                        }`}>
                                        {format(new Date(activeTask.due_date), 'MMM d')}
                                        {activeTask.status !== 'completed' && isToday(new Date(activeTask.due_date)) && " • Today"}
                                        {activeTask.status !== 'completed' && isTomorrow(new Date(activeTask.due_date)) && " • Tomorrow"}
                                    </span>
                                )}

                                {/* Attachments */}
                                {activeTask.attachments_count > 0 && (
                                    <span className="inline-flex items-center text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2.5 py-1 rounded-full">
                                        <FaPaperclip className="mr-1 h-3 w-3" />
                                        {activeTask.attachments_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
});