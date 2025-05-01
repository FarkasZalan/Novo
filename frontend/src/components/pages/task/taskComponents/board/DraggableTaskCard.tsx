import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { isPast, isToday, isTomorrow } from 'date-fns';
import { Task } from '../../../../../types/task';
import { FaPaperclip } from 'react-icons/fa';
import { TaskAssignments } from '../../taskHandler/assignments/TaskAssignments';

// one task card
const DraggableTaskCard: React.FC<{ task: Task }> = React.memo(({ task }) => {
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
        <div

            // the draggable element setup
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}

            // the e.stopPropagation() is denying the click event from the parent element
            onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${projectId}/tasks/${task.id}`);
            }}
            className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 ${isDragging ? 'opacity-40' : 'opacity-100'
                }`}
        >
            {/* Task Header with Title and Assignments */}
            <div className="flex justify-between items-start gap-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex-1">
                    {task.title}
                </h4>

                {/* Compact Assignments */}
                <div className="flex-shrink-0">
                    {getPriorityBadge(task.priority)}

                </div>
            </div>

            {/* Description */}
            {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {task.description}
                </p>
            )}

            {/* Attachments */}
            {task.attachments_count > 0 && (
                <div className="mt-2">
                    <span className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full">
                        <FaPaperclip className="mr-1" />
                        {task.attachments_count}
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between mt-3">
                {task.due_date && (
                    <div className="flex items-center gap-1">
                        <span className={
                            `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.status !== 'completed'
                                ? isPast(new Date(task.due_date)) || isToday(new Date(task.due_date))
                                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" // Overdue/Today
                                    : isTomorrow(new Date(task.due_date))
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" // Tomorrow
                                        : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" // Future
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" // Completed
                            }`
                        }>
                            Due {new Date(task.due_date).toLocaleDateString()}
                            {/* status indicator */}
                            {task.status !== 'completed' && isToday(new Date(task.due_date)) && " • Today"}
                            {task.status !== 'completed' && isTomorrow(new Date(task.due_date)) && " • Tomorrow"}
                        </span>
                    </div>
                )}

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