import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { FaFilter, FaSortAmountDown, FaTag, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../../../../hooks/useAuth';
import { getAllLabelForProject } from '../../../../../services/labelService';

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
    projectId: string;
}

export const TaskFilterDialog = ({
    isOpen,
    onClose,
    onApply,
    initialFilters,
    projectId
}: TaskFilterDialogProps) => {
    const { authState } = useAuth();
    const [labels, setLabels] = useState<Label[]>([]);
    const [loadingLabels, setLoadingLabels] = useState(false);
    const [filters, setFilters] = useState({
        status: initialFilters?.status || '',
        priority: initialFilters?.priority || '',
        labelIds: initialFilters?.labelIds || [],
        orderBy: initialFilters?.orderBy || 'due_date',
        orderDirection: initialFilters?.orderDirection || 'desc'
    });

    useEffect(() => {
        if (isOpen && projectId && authState.accessToken) {
            setLoadingLabels(true);
            getAllLabelForProject(projectId, authState.accessToken)
                .then(setLabels)
                .catch(console.error)
                .finally(() => setLoadingLabels(false));
        }
    }, [isOpen, projectId, authState.accessToken]);

    const handleLabelToggle = (labelId: string) => {
        setFilters(prev => ({
            ...prev,
            labelIds: prev.labelIds.includes(labelId)
                ? prev.labelIds.filter(id => id !== labelId)
                : [...prev.labelIds, labelId]
        }));
    };

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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <FaFilter className="text-indigo-600 dark:text-indigo-400" />
                        Filter & Sort Tasks
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Status
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                        {['not-started', 'in-progress', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() =>
                                    setFilters(prev => ({
                                        ...prev,
                                        status: prev.status === status ? '' : status
                                    }))
                                }
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${filters.status === status
                                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {status === 'not-started'
                                    ? 'Not Started'
                                    : status === 'in-progress'
                                        ? 'In Progress'
                                        : 'Completed'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority Filter */}
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Priority
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                        {['low', 'medium', 'high'].map(priority => (
                            <button
                                key={priority}
                                onClick={() =>
                                    setFilters(prev => ({
                                        ...prev,
                                        priority: prev.priority === priority ? '' : priority
                                    }))
                                }
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${filters.priority === priority
                                    ? priority === 'low'
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                        : priority === 'medium'
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Labels Filter */}
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Labels
                    </h4>
                    {loadingLabels ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                        </div>
                    ) : labels.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {labels.map(label => {
                                const hexColor = label.color.startsWith('#') ? label.color : `#${label.color}`;
                                const textColor = getLabelTextColor(hexColor);

                                return (
                                    <button
                                        key={label.id}
                                        onClick={() => handleLabelToggle(label.id)}
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all ${filters.labelIds.includes(label.id)
                                            ? 'ring-2 ring-offset-1 ring-indigo-500 dark:ring-indigo-400'
                                            : ''
                                            }`}
                                        style={{
                                            backgroundColor: hexColor,
                                            color: textColor === 'text-gray-900' ? '#111827' : '#fff'
                                        }}
                                    >
                                        <FaTag className="mr-1" size={10} />
                                        {label.name}
                                    </button>
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
                <div className="mb-8">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FaSortAmountDown className="text-indigo-600 dark:text-indigo-400" />
                        Sort By
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-700 dark:text-gray-300">
                                Due Date
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        setFilters(prev => ({
                                            ...prev,
                                            orderBy: 'due_date',
                                            orderDirection: 'asc'
                                        }))
                                    }
                                    className={`px-3 py-1 rounded-md text-xs font-medium ${filters.orderBy === 'due_date' && filters.orderDirection === 'asc'
                                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
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
                                    className={`px-3 py-1 rounded-md text-xs font-medium ${filters.orderBy === 'due_date' && filters.orderDirection === 'desc'
                                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Newest First
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-700 dark:text-gray-300">
                                Last Updated
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        setFilters(prev => ({
                                            ...prev,
                                            orderBy: 'updated_at',
                                            orderDirection: 'asc'
                                        }))
                                    }
                                    className={`px-3 py-1 rounded-md text-xs font-medium ${filters.orderBy === 'updated_at' && filters.orderDirection === 'asc'
                                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
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
                                    className={`px-3 py-1 rounded-md text-xs font-medium ${filters.orderBy === 'updated_at' && filters.orderDirection === 'desc'
                                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Newest First
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between gap-4">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
                    >
                        Reset All
                    </button>
                    <button
                        onClick={handleApply}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors flex-1"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};