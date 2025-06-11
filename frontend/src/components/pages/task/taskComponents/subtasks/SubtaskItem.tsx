import React, { useState } from 'react';
import {
    FaTrash,
    FaEdit,
    FaChevronRight,
    FaChevronDown,
    FaTag,
    FaPaperclip,
    FaBan,
    FaFlag
} from 'react-icons/fa';
import { isToday, isTomorrow, isPast, format } from 'date-fns';
import { TaskAssignments } from '../assignments/TaskAssignments';
import { Task } from '../../../../../types/task';
import { ConfirmationDialog } from '../../../project/ConfirmationDialog';

interface SubtaskItemProps {
    subtask: Task;
    onToggleComplete: (id: string, completed: boolean) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onUpdate: (updatedTask: Task) => Promise<void>;
    canManageTasks: boolean;
    onNavigateToTask?: () => void;
    openFromEdit?: boolean;
    project: Project | null
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
    subtask,
    onToggleComplete,
    onDelete,
    onEdit,
    onUpdate,
    canManageTasks,
    onNavigateToTask,
    openFromEdit,
    project
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const getLabelTextColor = (hexColor: string) => {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? 'text-gray-900' : 'text-white';
    };

    const handleClick = (e: React.MouseEvent) => {
        // Only navigate if not clicking on a button or other control
        if (
            !(e.target as HTMLElement).closest('button') &&
            !(e.target as HTMLElement).closest('select') &&
            !(e.target as HTMLElement).closest('textarea') &&
            onNavigateToTask
        ) {
            onNavigateToTask();
        }
    };

    const getStatusIcon = () => {
        switch (subtask.status) {
            case 'completed':
                return <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>;
            case 'in-progress':
                return <svg className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>;
            case 'blocked':
                return <FaBan className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />;
            default: // not-started
                return <svg className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>;
        }
    };

    const getDueDateColor = () => {
        if (subtask.status === 'completed') {
            return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }

        if (!subtask.due_date) return '';

        const dueDate = new Date(subtask.due_date);

        if (isPast(dueDate) || isToday(dueDate)) {
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        } else if (isTomorrow(dueDate)) {
            return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
        }
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    };

    const getPriorityColor = () => {
        switch (subtask.priority) {
            case 'high':
                return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300";
            case 'medium':
                return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300";
            default: // low
                return "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300";
        }
    };

    return (
        <>
            <div
                className={`${isExpanded && !openFromEdit ? 'cursor-default bg-gray-50 dark:bg-gray-700' : 'cursor-pointer '} group p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 ${subtask.status === 'completed' ? 'bg-green-50/30 dark:bg-green-900/10 border-green-100 dark:border-green-900/20' : ''}`}
                onClick={
                    (isExpanded && !openFromEdit) ? undefined : handleClick
                }
            >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    {/* Left section with completion indicator and title */}
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        {/* Status indicator */}
                        <div
                            className={`flex-shrink-0 mt-0.5 sm:mt-1 h-5 w-5 sm:h-6 sm:w-6 rounded-md flex items-center justify-center transition-all duration-300 ease-in-out
                            ${subtask.status === "completed"
                                    ? "bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-600"
                                    : subtask.status === "in-progress"
                                        ? "bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-600"
                                        : subtask.status === "blocked"
                                            ? "bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-600"
                                            : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (canManageTasks) {
                                    onToggleComplete(subtask.id, subtask.status !== 'completed');
                                }
                            }}
                        >
                            {getStatusIcon()}
                        </div>

                        {/* Title and metadata */}
                        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <h3 className={`font-medium text-gray-900 dark:text-gray-100 truncate text-base ${subtask.status === "completed" ? "line-through opacity-70" : ""}`}>
                                    {subtask.title}
                                </h3>

                                {canManageTasks && !project?.read_only && !openFromEdit && (
                                    <div className="flex items-center">
                                        <button
                                            type='button'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsExpanded(!isExpanded);
                                            }}
                                            aria-expanded={isExpanded ? "true" : "false"}
                                            aria-label={isExpanded ? "Collapse details" : "Expand more options"}
                                            className="inline-flex cursor-pointer items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none rounded-lg py-1 px-2 text-sm"
                                        >
                                            <span className="font-medium">
                                                {isExpanded ? 'Less' : 'More'} Options
                                            </span>
                                            {isExpanded ? (
                                                <FaChevronDown size={12} />
                                            ) : (
                                                <FaChevronRight size={12} />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Labels and milestone row */}
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                                {/* Milestone */}
                                {subtask.milestone_id && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/70"
                                        style={{
                                            backgroundColor: `${subtask.milestone_color}20`,
                                            border: `1px solid ${subtask.milestone_color}40`
                                        }}
                                    >
                                        <FaFlag className="mr-1.5" style={{ color: subtask.milestone_color }} />
                                        <span className="truncate max-w-[100px] sm:max-w-none">
                                            {subtask.milestone_name || "Milestone"}
                                        </span>
                                    </span>
                                )}
                                {/* Labels */}
                                {subtask.labels && subtask.labels.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {/* First 3 visible labels */}
                                        {subtask.labels.slice(0, 3).map((label: any) => {
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
                                                    <span className="truncate max-w-[80px] sm:max-w-none">
                                                        {label.name}
                                                    </span>
                                                </span>
                                            );
                                        })}

                                        {/* +X more labels indicator */}
                                        {subtask.labels.length > 3 && (
                                            <div className="relative inline-block">
                                                <span
                                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 cursor-default hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors peer"
                                                >
                                                    +{subtask.labels.length - 3}
                                                </span>

                                                {/* Hidden labels popup - appears ONLY on +X hover */}
                                                <div className="absolute z-50 hidden peer-hover:block bottom-full mb-2 left-0 min-w-max bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border border-gray-200 dark:border-gray-700">
                                                    <div className="flex flex-wrap gap-1">
                                                        {subtask.labels.slice(3).map((label: any) => {
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
                            </div>

                            {/* Second row with due date, attachments, assignments */}
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                {/* Due date */}
                                {subtask.due_date && (
                                    <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium ${getDueDateColor()}`}>
                                        {format(new Date(subtask.due_date), 'MMM d')}
                                        {subtask.status !== 'completed' && isToday(new Date(subtask.due_date)) && " • Today"}
                                        {subtask.status !== 'completed' && isTomorrow(new Date(subtask.due_date)) && " • Tomorrow"}
                                    </span>
                                )}

                                {/* Status badge */}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${subtask.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : subtask.status === "in-progress"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                        : subtask.status === "blocked"
                                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                    }`}>
                                    {subtask.status.replace('-', ' ')}
                                </span>

                                {/* Attachments */}
                                {subtask.attachments_count > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                        <FaPaperclip className="mr-1" size={10} />
                                        {subtask.attachments_count}
                                    </span>
                                )}

                                {/* Assignments */}
                                <div className="flex items-center">
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
                    </div>

                    {/* Right section with priority, delete button (when openFromEdit), and chevron */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 sm:self-center">
                        {/* Priority Badge - moved to top on mobile */}
                        {subtask.priority && (
                            <div className={`px-2 py-0.5 sm:px-3 sm:py-1 text-xs rounded-full font-semibold ${getPriorityColor()}`}>
                                {subtask.priority}
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            {/* Delete button (only shown when openFromEdit is true) */}
                            {openFromEdit && canManageTasks && (
                                <button
                                    type='button'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteConfirm(true);
                                    }}
                                    className="p-1.5 sm:p-2 cursor-pointer text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Delete subtask"
                                >
                                    <FaTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                            )}

                            {/* Arrow indicator */}
                            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                                <FaChevronRight className="text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" size={12} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expanded details (hidden when openFromEdit is true) */}
                {isExpanded && !openFromEdit && (
                    <div className="mt-4 sm:mt-6 ml-0 sm:ml-10 border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
                        {canManageTasks && (
                            <div className="space-y-4 sm:space-y-6 text-sm">
                                {/* Dropdowns Row */}
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Fast Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Status */}
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={subtask.status || 'not-started'}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onUpdate({ ...subtask, status: e.target.value });
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition text-sm sm:text-base"
                                        >
                                            <option value="not-started">Not Started</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="blocked">Blocked</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                                            Priority
                                        </label>
                                        <select
                                            id="priority"
                                            name="priority"
                                            value={subtask.priority || 'low'}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onUpdate({ ...subtask, priority: e.target.value as 'low' | 'medium' | 'high' });
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full cursor-pointer px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition text-sm sm:text-base"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Buttons Row */}
                                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-3 pt-1 sm:pt-2">
                                    <button
                                        type='button'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(subtask.id);
                                        }}
                                        className="inline-flex cursor-pointer items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition"
                                    >
                                        <FaEdit size={12} />
                                        Go to Edit
                                    </button>
                                    <button
                                        type='button'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDeleteConfirm(true);
                                        }}
                                        className="inline-flex cursor-pointer items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition"
                                    >
                                        <FaTrash size={12} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete confirmation dialog */}
            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => {
                    onDelete(subtask.id);
                    setShowDeleteConfirm(false);
                }}
                title="Delete Subtask?"
                message="Are you sure you want to delete this subtask? This action cannot be undone."
                confirmText="Delete"
                confirmColor="red"
            />
        </>
    );
};