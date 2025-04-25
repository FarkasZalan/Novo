import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDrag } from 'react-dnd';
import { Task } from '../../../../../types/task';

// Drag item type
const ITEM_TYPE = 'TASK';

interface Props {
    task: Task;
    setDraggedTask: (task: Task | null) => void;
}

// one task card which is draggable
// when drop this card on a column, that card's taskId is passed to the column's drop function, which updates the status of the task
const DraggableTaskCard: React.FC<Props> = React.memo(({ task, setDraggedTask }) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

    // Create a ref for the drag element
    const cardRef = useRef<HTMLDivElement>(null);

    // Make this card draggable
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: ITEM_TYPE, // what kind of item it is
        item: () => {
            setDraggedTask(task);  // Set the dragged task when drag starts
            return { taskId: task.id };  // Return the drag data
        },
        end: () => {
            setDraggedTask(null);  // Reset when drag ends
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    dragRef(cardRef); // connect drag behavior to this card

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
            ref={cardRef}
            onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${projectId}/tasks/${task.id}`);
            }}
            className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
            {task.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>}

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
