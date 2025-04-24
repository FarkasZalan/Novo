import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaCircle, FaPlus } from 'react-icons/fa';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
}

interface TaskBoardProps {
    tasks: Task[];
}

const statusLabels: Record<string, { label: string, icon: React.ReactNode, color: string }> = {
    'not-started': {
        label: 'Not Started',
        icon: <FaCircle className="text-gray-400" />,
        color: 'bg-gray-50 dark:bg-gray-700/50'
    },
    'in-progress': {
        label: 'In Progress',
        icon: <FaClock className="text-yellow-500" />,
        color: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    'completed': {
        label: 'Completed',
        icon: <FaCheckCircle className="text-green-500" />,
        color: 'bg-green-50 dark:bg-green-900/20'
    },
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {
    const navigate = useNavigate();
    const { projectId } = useParams<{ projectId: string }>();

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(statusLabels).map(([statusKey, { label, icon, color }]) => {
                const statusTasks = tasks.filter(task => task.status === statusKey);

                return (
                    <div key={statusKey} className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center space-x-2">
                                {icon}
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{label}</h3>
                                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                    {statusTasks.length}
                                </span>
                            </div>
                            <button
                                onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
                                className="p-1 cursor-pointer text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title="Add task"
                            >
                                <FaPlus />
                            </button>
                        </div>

                        <div className={`flex-1 rounded-xl p-4 ${color} min-h-64 transition-all duration-200`}>
                            <div className="space-y-3">
                                {statusTasks.length === 0 ? (
                                    <div
                                        onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
                                        className="text-center cursor-pointer py-8 text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 cursor-pointer transition-all"
                                    >
                                        <p>+ Add new task</p>
                                    </div>
                                ) : (
                                    statusTasks.map(task => (
                                        <div
                                            key={task.id}
                                            onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
                                            className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50"
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
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};