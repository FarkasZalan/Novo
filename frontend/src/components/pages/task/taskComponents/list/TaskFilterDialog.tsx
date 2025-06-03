import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { FaFilter, FaSortAmountDown, FaTag, FaTimes, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface TaskFilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: {
        status?: string;
        priority?: string;
        labelIds?: string[];
        orderBy?: 'due_date' | 'updated_at';
        orderDirection?: 'asc' | 'desc';
    }) => void;
    initialFilters?: {
        status?: string;
        priority?: string;
        labelIds?: string[];
        orderBy?: 'due_date' | 'updated_at';
        orderDirection?: 'asc' | 'desc';
    };
    projectLabels: Label[];
    projectId: string;
}

export const TaskFilterDialog = ({
    isOpen,
    onClose,
    onApply,
    initialFilters,
    projectLabels
}: TaskFilterDialogProps) => {
    const [filters, setFilters] = useState({
        status: initialFilters?.status || '',
        priority: initialFilters?.priority || '',
        labelIds: initialFilters?.labelIds || [],
        orderBy: initialFilters?.orderBy || 'due_date',
        orderDirection: initialFilters?.orderDirection || 'desc',
    });

    const handleLabelToggle = (labelId: string) => {
        setFilters(prev => ({
            ...prev,
            labelIds: prev.labelIds.includes(labelId)
                ? prev.labelIds.filter(id => id !== labelId)
                : [...prev.labelIds, labelId]
        }));
    };

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            status: initialFilters?.status || '',
            priority: initialFilters?.priority || '',
            labelIds: initialFilters?.labelIds || [],
            orderBy: initialFilters?.orderBy || 'due_date',
            orderDirection: initialFilters?.orderDirection || 'desc'
        }));
    }, [initialFilters]);

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        setFilters({
            status: '',
            priority: '',
            labelIds: [],
            orderBy: 'due_date',
            orderDirection: 'desc'
        });
        onApply({
            status: '',
            priority: '',
            labelIds: [],
            orderBy: 'due_date',
            orderDirection: 'desc'
        });
        onClose();
    };

    const getLabelTextColor = (hexColor: string) => {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? 'text-gray-900' : 'text-white';
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 px-2 sm:px-4 py-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-xl mx-auto max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <FaFilter className="text-indigo-600 dark:text-indigo-400" />
                                Filter & Sort Tasks
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Apply filters to narrow down your tasks
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Status Filter */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Status</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { value: 'not-started', label: 'Not Started' },
                                { value: 'in-progress', label: 'In Progress' },
                                { value: 'blocked', label: 'Blocked' },
                                { value: 'completed', label: 'Completed' },
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() =>
                                        setFilters(prev => ({
                                            ...prev,
                                            status: prev.status === value ? '' : value,
                                        }))
                                    }
                                    className={`w-full cursor-pointer px-2 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${filters.status === value
                                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
                                        }`}
                                >
                                    {filters.status === value && <FaCheck className="h-3 w-3" />}
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority Filter */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Priority
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'low', label: 'Low', color: 'blue' },
                                { value: 'medium', label: 'Medium', color: 'yellow' },
                                { value: 'high', label: 'High', color: 'red' }
                            ].map(({ value, label, color }) => (
                                <button
                                    key={value}
                                    onClick={() =>
                                        setFilters(prev => ({
                                            ...prev,
                                            priority: prev.priority === value ? '' : value
                                        }))
                                    }
                                    className={`px-3 py-2 cursor-pointer rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${filters.priority === value
                                        ? `bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-300 border border-${color}-200 dark:border-${color}-700`
                                        : `bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent`
                                        }`}
                                >
                                    {filters.priority === value && <FaCheck className="h-3 w-3" />}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Labels Filter */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Labels
                        </h4>
                        {projectLabels && projectLabels.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {projectLabels.map(label => {
                                    const hexColor = label.color.startsWith('#') ? label.color : `#${label.color}`;
                                    const textColor = getLabelTextColor(hexColor);

                                    return (
                                        <motion.button
                                            key={label.id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleLabelToggle(label.id)}
                                            className={`inline-flex cursor-pointer items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filters.labelIds.includes(label.id)
                                                ? 'ring-2 ring-offset-1 ring-indigo-500 dark:ring-indigo-400'
                                                : ''
                                                }`}
                                            style={{
                                                backgroundColor: hexColor,
                                                color: textColor === 'text-gray-900' ? '#111827' : '#fff'
                                            }}
                                        >
                                            <FaTag className="mr-1.5" size={10} />
                                            {label.name}
                                            {filters.labelIds.includes(label.id) && (
                                                <span className="ml-1.5">✓</span>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No labels available for this project
                            </p>
                        )}
                    </div>

                    {/* Sort Options */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <FaSortAmountDown className="text-indigo-600 dark:text-indigo-400" />
                            Sort By
                        </h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    Due Date
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() =>
                                            setFilters(prev => ({
                                                ...prev,
                                                orderBy: 'due_date',
                                                orderDirection: 'asc'
                                            }))
                                        }
                                        className={`px-3 py-2 cursor-pointer rounded-lg text-xs font-medium flex items-center justify-center gap-2 ${filters.orderBy === 'due_date' && filters.orderDirection === 'asc'
                                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
                                            }`}
                                    >
                                        {filters.orderBy === 'due_date' && filters.orderDirection === 'asc' && <FaCheck className="h-3 w-3" />}
                                        Oldest First
                                    </button>
                                    <button
                                        onClick={() =>
                                            setFilters(prev => ({
                                                ...prev,
                                                orderBy: 'due_date',
                                                orderDirection: 'desc'
                                            }))
                                        }
                                        className={`px-3 py-2 cursor-pointer rounded-lg text-xs font-medium flex items-center justify-center gap-2 ${filters.orderBy === 'due_date' && filters.orderDirection === 'desc'
                                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
                                            }`}
                                    >
                                        {filters.orderBy === 'due_date' && filters.orderDirection === 'desc' && <FaCheck className="h-3 w-3" />}
                                        Newest First
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    Last Updated
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() =>
                                            setFilters(prev => ({
                                                ...prev,
                                                orderBy: 'updated_at',
                                                orderDirection: 'asc'
                                            }))
                                        }
                                        className={`px-3 py-2 cursor-pointer rounded-lg text-xs font-medium flex items-center justify-center gap-2 ${filters.orderBy === 'updated_at' && filters.orderDirection === 'asc'
                                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
                                            }`}
                                    >
                                        {filters.orderBy === 'updated_at' && filters.orderDirection === 'asc' && <FaCheck className="h-3 w-3" />}
                                        Oldest First
                                    </button>
                                    <button
                                        onClick={() =>
                                            setFilters(prev => ({
                                                ...prev,
                                                orderBy: 'updated_at',
                                                orderDirection: 'desc'
                                            }))
                                        }
                                        className={`px-3 py-2 cursor-pointer rounded-lg text-xs font-medium flex items-center justify-center gap-2 ${filters.orderBy === 'updated_at' && filters.orderDirection === 'desc'
                                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-transparent'
                                            }`}
                                    >
                                        {filters.orderBy === 'updated_at' && filters.orderDirection === 'desc' && <FaCheck className="h-3 w-3" />}
                                        Newest First
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t cursor-pointer border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="px-6 py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                        Reset All
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-6 py-3.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors text-sm shadow-md"
                    >
                        Apply Filters
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};