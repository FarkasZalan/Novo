import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { Task } from '../../../../../types/task';
import { FaFlag, FaPaperclip, FaTag } from 'react-icons/fa';
import { TaskAssignments } from '../../taskHandler/assignments/TaskAssignments';
import { SubtaskListOnBoard } from './SubtaskListOnBoard';

// one task card
const DraggableTaskCard: React.FC<{ task: Task, onTaskUpdate?: (updatedTask: Task) => void, canManageTasks: boolean }> = React.memo(({ task, onTaskUpdate, canManageTasks }) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

    const {
        attributes, // keyboard accessibility
        listeners, // click/touch accessibility
        setNodeRef, // which element to make draggable
        transform, // movement animations
        isDragging, // style differently when dragging
    } = useDraggable({ // makes the element draggable
        id: task.id,
        data: {
            type: 'task',
            status: task.status,
            task: task
        }
    });

    // the original task card, the 'shadow' card that stays in the original column until the drag ends
    const style = {
        transform: isDragging ? undefined : CSS.Translate.toString(transform),
    };

    const handleMilestoneClick = (e: React.MouseEvent, milestoneId: string) => {
        e.stopPropagation();
        navigate(`/projects/${projectId}/milestones/${milestoneId}`);
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${projectId}/tasks/${task.id}`);
            }}
            className={`p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 ${isDragging ? 'opacity-40' : 'opacity-100'}`}
        >
            {/* Header: Title + Priority */}
            <div className="flex justify-between items-start gap-3">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex-1 truncate">
                    {task.title}
                </h4>
                {getPriorityBadge(task.priority)}
            </div>

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {task.labels.slice(0, 3).map((label: any) => {
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
                    {task.labels.length > 3 && (
                        <div className="relative inline-block">
                            <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors peer"
                            >
                                +{task.labels.length - 3}
                            </span>

                            {/* Hidden labels popup - appears ONLY on +X hover */}
                            <div className="absolute z-50 hidden peer-hover:block bottom-full mb-2 left-0 min-w-max bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 border border-gray-200 dark:border-gray-700">
                                <div className="flex flex-wrap gap-1">
                                    {task.labels.slice(3).map((label: any) => {
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

            {/* Subtask list */}
            {task.subtasks && task.subtasks.length > 0 && (
                <SubtaskListOnBoard
                    task={task}
                    onTaskUpdate={onTaskUpdate}
                    projectId={projectId!}
                    canManageTasks={canManageTasks}
                />
            )}

            {/* Row: Milestone & Attachments */}
            <div className="flex justify-between items-center mt-4 gap-2">
                {task.milestone_id && (
                    <button
                        onClick={(e) => handleMilestoneClick(e, task.milestone_id!)}
                        className="inline-flex cursor-pointer hover:underline items-center text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/30 transition"
                    >
                        <FaFlag className="mr-1.5 h-3 w-3" />
                        {task.milestone_name || 'Milestone'}
                    </button>
                )}


            </div>

            <div className="flex justify-between items-center mt-4 gap-2">
                {/* Left side - Due date and attachments */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Due Date */}
                    {task.due_date && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${task.status !== 'completed'
                            ? isPast(new Date(task.due_date)) || isToday(new Date(task.due_date))
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : isTomorrow(new Date(task.due_date))
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}>
                            {format(new Date(task.due_date), 'MMM d')}
                            {task.status !== 'completed' && isToday(new Date(task.due_date)) && " • Today"}
                            {task.status !== 'completed' && isTomorrow(new Date(task.due_date)) && " • Tomorrow"}
                        </span>
                    )}

                    {/* Attachments */}
                    {task.attachments_count > 0 && (
                        <span className="inline-flex items-center text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2.5 py-1 rounded-full">
                            <FaPaperclip className="mr-1 h-3 w-3" />
                            {task.attachments_count}
                        </span>
                    )}
                </div>

                {/* Right side - Assignments */}
                <TaskAssignments
                    taskIdFromCompactMode={task.id}
                    pendingUsers={[]}
                    setPendingUsers={() => { }}
                    compactMode={true}
                />
            </div>
        </div>
    );

});

export default DraggableTaskCard;