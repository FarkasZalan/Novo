import { FaPlus, FaSearch, FaFilter, FaEllipsisV } from "react-icons/fa";

interface TasksTabProps {
    project: {
        total_tasks?: number;
        completed_tasks?: number;
    };
}

export const TasksTab = ({ project }: TasksTabProps) => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h2>
                <button className="px-4 py-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center">
                    <FaPlus className="mr-2" />
                    New Task
                </button>
            </div>

            {/* Task Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Search tasks..."
                    />
                </div>
                <button className="px-4 py-2 border cursor-pointer border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center">
                    <FaFilter className="mr-2" />
                    Filter
                </button>
            </div>

            {/* Task List */}
            <div className="space-y-4">
                {[1, 2, 3].map((task) => (
                    <div key={task} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:bg-gray-700 focus:ring-indigo-500 mt-1"
                                />
                                <div>
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                        Task {task} - Implement new feature x {project.total_tasks || ''}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Assigned to John Doe · Due in 3 days
                                    </p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                                <FaEllipsisV />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};