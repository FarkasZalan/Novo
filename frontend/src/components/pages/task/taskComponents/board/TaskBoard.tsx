import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaCircle, FaPaperclip, FaFlag, FaBan, FaTag, FaChevronDown, FaTasks } from 'react-icons/fa';
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
import { ConfirmationDialog } from '../../../project/ConfirmationDialog';

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
    project: Project | null;
    milestones: Milestone[];
    selectedMilestone: string | null;
    onMilestoneChange: (milestoneId: string | null) => void;
}

// the main task board
export const TaskBoard: React.FC<TaskBoardProps> = React.memo(({ tasks, setTasks, onTaskUpdate, canManageTasks, project, milestones, selectedMilestone, onMilestoneChange }) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const [activeTask, setActiveTask] = useState<Task | null>(null); // the task currently being dragged
    const [_scrollLeft, setScrollLeft] = useState(0);
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
    const [pendingTaskUpdate, setPendingTaskUpdate] = useState<{ task: Task, newStatus: string } | null>(null);
    const [isMilestoneDropdownOpen, setIsMilestoneDropdownOpen] = useState(false);
    const milestoneWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMilestoneDropdownOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            // If ref.current is mounted AND the click target is NOT inside, close the menu
            if (
                milestoneWrapperRef.current &&
                !milestoneWrapperRef.current.contains(e.target as Node)
            ) {
                setIsMilestoneDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMilestoneDropdownOpen]);

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
        if (project?.read_only) {
            toast.error("Can't add tasks to a read-only project.");
            return;
        }
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

        if (project?.read_only) {
            toast.error('This project is read-only. You cannot modify its tasks.');
            return;
        }

        // if there is no task being dragged or there is no place to drop the task
        if (!over || !activeTask) return;

        // ?? -> if the left side is undefinied or null so misssing then use the right side
        const newStatus = over.data.current?.status ?? activeTask.status;

        // if the new status is the same as the old status so stay in the original column then exit
        if (newStatus === activeTask.status) {
            setActiveTask(null);
            return;
        }

        if (newStatus === 'completed' && activeTask.subtasks && activeTask.subtasks.length > 0) {
            for (const subtask of activeTask.subtasks) {

                if (subtask.status !== 'completed') {
                    setPendingTaskUpdate({ task: activeTask, newStatus });
                    setShowCompleteConfirm(true);
                    setActiveTask(null);
                    return;
                }
            }

        }

        // update the task status if the status is not completed and no subtasks
        await proceedTaskUpdate(activeTask, newStatus);
    };

    const proceedTaskUpdate = async (activeTask: Task, newStatus: string) => {
        const originalTask = activeTask;
        let updatedTask: Task = { ...activeTask, status: newStatus };

        // If moving to completed, mark all subtasks as completed too
        if (newStatus === 'completed' && activeTask.subtasks && activeTask.subtasks.length > 0) {
            updatedTask = {
                ...updatedTask,
                subtasks: activeTask.subtasks.map(subtask => ({
                    ...subtask,
                    status: 'completed'
                }))
            };
        }

        try {
            // update task status on local state first with calling the parent setTasks to update the local task list for smooth UI (optimistic update)
            setTasks(currentTasks =>
                currentTasks.map(task =>
                    task.id === updatedTask.id ? updatedTask : task
                )
            );


            // update task status on backend
            await updateTaskStatus(activeTask.id, projectId!, authState.accessToken!, newStatus);

            // Show success toast
            toast.success(`${activeTask.title} moved to ${statusLabels[newStatus].label}`);

            // Notify parent of successful update
            onTaskUpdate?.(updatedTask);
        } catch (error) {
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
    }

    const handleConfirmComplete = async () => {
        if (pendingTaskUpdate) {
            await proceedTaskUpdate(pendingTaskUpdate.task, pendingTaskUpdate.newStatus);
            setPendingTaskUpdate(null);
            setShowCompleteConfirm(false);
        }
    };

    const handleCancelComplete = () => {
        setPendingTaskUpdate(null);
        setShowCompleteConfirm(false);
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
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Milestone dropdown section */}

                {/* Board Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                    {/* Left side - Title and description */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <FaTasks className="text-indigo-500 dark:text-indigo-400" />
                            Task Management
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {selectedMilestone === 'all'
                                ? 'Showing all tasks'
                                : milestones.find(m => m.id === selectedMilestone)
                                    ? `Tasks for ${milestones.find(m => m.id === selectedMilestone)?.name} milestone`
                                    : 'Select a milestone to filter tasks'}
                        </p>
                    </div>

                    {/* Right side - Milestone Selector */}
                    <div className="w-full sm:w-auto" ref={milestoneWrapperRef}>
                        <div className="relative w-full sm:w-56">
                            {/* Dropdown Button */}
                            <button
                                onClick={() => setIsMilestoneDropdownOpen(!isMilestoneDropdownOpen)}
                                className="w-full inline-flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                            >
                                <span className="flex items-center max-w-[calc(100%-24px)] truncate">
                                    <FaFlag
                                        className="flex-shrink-0 mr-2.5"
                                        style={{
                                            color: selectedMilestone && selectedMilestone !== 'all'
                                                ? milestones.find(m => m.id === selectedMilestone)?.color || '#8b5cf6'
                                                : '#8b5cf6'
                                        }}
                                    />
                                    <span className="truncate">
                                        {selectedMilestone === 'all'
                                            ? 'All Milestones'
                                            : milestones.find(m => m.id === selectedMilestone)?.name || 'Select Milestone'}
                                    </span>
                                </span>
                                <FaChevronDown
                                    className={`ml-2 h-3 w-3 flex-shrink-0 transition-transform ${isMilestoneDropdownOpen ? 'transform rotate-180' : ''}`}
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isMilestoneDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-full sm:w-64 origin-top-right rounded-lg shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1 max-h-[60vh] overflow-y-auto">
                                        {/* All Tasks Option */}
                                        <button
                                            onClick={() => {
                                                onMilestoneChange('all')
                                                setIsMilestoneDropdownOpen(false)
                                            }}
                                            className={`flex w-full cursor-pointer items-center px-4 py-2.5 text-sm text-left transition-colors ${selectedMilestone === 'all'
                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                        >
                                            <FaTasks className="mr-3 opacity-70 flex-shrink-0" />
                                            <span>All Tasks</span>
                                        </button>

                                        {/* Milestone Options */}
                                        {milestones.map(milestone => {
                                            const milestoneColor = milestone.color || '#8b5cf6';
                                            const isActive = selectedMilestone === milestone.id;

                                            return (
                                                <button
                                                    key={milestone.id}
                                                    onClick={() => {
                                                        onMilestoneChange(milestone.id)
                                                        setIsMilestoneDropdownOpen(false)
                                                    }}
                                                    className={`flex w-full cursor-pointer items-center px-4 py-2.5 text-sm text-left transition-colors ${isActive
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                                    style={isActive ? {
                                                        backgroundColor: `${milestoneColor}20`,
                                                        color: milestoneColor,
                                                        borderLeft: `3px solid ${milestoneColor}`,
                                                    } : undefined}
                                                >
                                                    <FaFlag className="mr-3 flex-shrink-0" style={{ color: milestoneColor }} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="truncate text-gray-800 dark:text-gray-100">{milestone.name}</p>
                                                        {milestone.due_date && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                Due {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex pb-4 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 pt-4"
                    onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
                >
                    <div className="flex flex-nowrap overflow-x-auto scroll-container gap-4 w-full">
                        {Object.entries(statusLabels).map(([statusKey, statusInfo]) => (
                            <div key={statusKey} className="flex-1 min-w-[330px]">
                                <StatusColumn
                                    statusKey={statusKey}
                                    statusInfo={statusInfo}
                                    tasks={tasks.filter(t => t.status === statusKey)}
                                    onAddTask={handleAddTask}
                                    canManageTasks={canManageTasks}
                                    activeTask={activeTask}
                                    onTaskUpdate={onTaskUpdate}
                                    project={project}
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

            <ConfirmationDialog
                isOpen={showCompleteConfirm}
                onClose={handleCancelComplete}
                onConfirm={handleConfirmComplete}
                title="Complete Task with Incomplete Subtasks?"
                message="This task has incomplete subtasks. Completing it will mark all subtasks as completed too. Do you want to proceed?"
                confirmText="Complete Task"
                confirmColor="green"
            />
        </>
    );
});