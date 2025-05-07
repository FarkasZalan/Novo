import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface LabelCardProps {
    label: Label;
    onEdit: (label: Label) => void;
    onDelete: (id: string) => void;
    canManage: boolean;
}

export const LabelCard: React.FC<LabelCardProps> = ({
    label,
    onEdit,
    onDelete,
    canManage,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div
                        className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
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

                <div className="flex items-center space-x-4">
                    <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                        {label.task_count} {label.task_count === 1 ? 'task' : 'tasks'}
                    </span>

                    {canManage && (
                        <div className="flex space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(label);
                                }}
                                className="text-gray-500 cursor-pointer dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(label.id);
                                }}
                                className="text-gray-500 cursor-pointer dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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