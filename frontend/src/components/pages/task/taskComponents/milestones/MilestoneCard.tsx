import { motion } from 'framer-motion';
import { FaFlag, FaEdit, FaTrash } from 'react-icons/fa';

interface MilestoneCardProps {
    milestone: Milestone;
    isSelected: boolean;
    onSelect: (milestone: Milestone) => void;
    onEdit: (milestone: Milestone) => void;
    onDelete: (milestoneId: string) => void;
    canManage: boolean;
    project: Project | null;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
    milestone,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    canManage,
    project
}) => {
    const isOverdue = milestone.due_date && new Date(milestone.due_date) < new Date();
    const progress = milestone.all_tasks_count > 0
        ? Math.round((milestone.completed_tasks_count / milestone.all_tasks_count) * 100)
        : 0;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    const milestoneColor = milestone.color || '#6366f1'; // indigo-500 as fallback
    const progressColor = isOverdue ? '#ef4444' : milestoneColor; // red-500 if overdue

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            onClick={() => onSelect(milestone)}
            className={`p-4 rounded-xl transition-all duration-200 cursor-pointer ${isSelected
                ? 'border-l-4'
                : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/30'
                }`}
            style={isSelected ? {
                backgroundColor: `${milestoneColor}20`,
                borderLeftColor: milestoneColor
            } : {}}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-start space-x-3">
                        <div
                            className="mt-1 flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: isOverdue ? '#ef4444' : `${milestoneColor}30`
                            }}
                        >
                            <FaFlag
                                className="text-lg"
                                style={{
                                    color: isOverdue ? 'white' : milestoneColor
                                }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3
                                className={`text-lg font-semibold truncate ${isSelected
                                    ? 'dark:text-gray-100'
                                    : 'text-gray-900 dark:text-gray-100'
                                    }`}
                                style={isSelected ? { color: milestoneColor } : {}}
                            >
                                {milestone.name}
                            </h3>
                            <p
                                className={`text-sm truncate ${isSelected
                                    ? 'dark:text-gray-300'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                style={isSelected ? {
                                    color: `${milestoneColor}80`
                                } : {}}
                            >
                                {milestone.description || 'No description'}
                            </p>

                            <div className="mt-3 flex items-center justify-between">
                                <span className={`text-xs ${isOverdue
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {formatDate(milestone.due_date!)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {milestone.completed_tasks_count}/{milestone.all_tasks_count} tasks
                                </span>
                            </div>

                            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${progress}%`,
                                        backgroundColor: progressColor
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {canManage && !project?.read_only && (
                    <div className="flex space-x-2 ml-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(milestone);
                            }}
                            className={`p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors`}
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(milestone.id);
                            }}
                            className={`p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors`}
                        >
                            <FaTrash />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};