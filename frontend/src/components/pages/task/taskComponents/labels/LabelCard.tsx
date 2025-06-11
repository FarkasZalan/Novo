import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface LabelCardProps {
    label: Label;
    onEdit: (label: Label) => void;
    onDelete: (id: string) => void;
    canManage: boolean;
    project: Project | null;
}

export const LabelCard: React.FC<LabelCardProps> = ({
    label,
    onEdit,
    onDelete,
    canManage,
    project
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                {/* Left section: Color + Label Info */}
                <div className="flex items-start sm:items-center space-x-4">
                    <div
                        className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 mt-1 sm:mt-0"
                        style={{ backgroundColor: label.color }}
                    />
                    <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{label.name}</h3>
                        {label.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {label.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right section: Task count and buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-center w-fit">
                        {label.task_count} {label.task_count === 1 ? 'task' : 'tasks'}
                    </span>

                    {canManage && !project?.read_only && (
                        <div className="flex justify-end sm:justify-start space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(label);
                                }}
                                className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(label.id);
                                }}
                                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};