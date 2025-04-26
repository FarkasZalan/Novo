import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../../../../types/task';

const DraggableTaskCard: React.FC<{ task: Task }> = React.memo(({ task }) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: task.id,
        data: {
            type: 'task',
            status: task.status,
            task: task
        }
    });

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
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${projectId}/tasks/${task.id}`);
            }}
            className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 ${isDragging ? 'opacity-40' : 'opacity-100'
                }`}
        >
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
            {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {task.description}
                </p>
            )}

            <div className="flex items-center justify-between mt-3">
                {task.due_date && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Due {new Date(task.due_date).toLocaleDateString()}
                    </span>
                )}
                {getPriorityBadge(task.priority)}
            </div>
        </div>
    );
});

export default DraggableTaskCard;