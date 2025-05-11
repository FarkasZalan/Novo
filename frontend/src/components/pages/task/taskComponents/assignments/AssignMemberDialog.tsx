import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaSpinner, FaCheck, FaUserPlus, FaTrash, FaStar } from 'react-icons/fa';
import { useAuth } from '../../../../../hooks/useAuth';
import { getProjectMembers } from '../../../../../services/projectMemberService';
import ProjectMember from '../../../../../types/projectMember';
import { motion, AnimatePresence } from 'framer-motion';

interface AddTaskAssignmentDialogProps {
    projectId: string;
    currentAssignments: ProjectMember[];
    onClose: () => void;
    onAdd: (users: ProjectMember[]) => void;
    onUnassign?: (userId: string) => void;
}

export const AddTaskAssignmentDialog = ({
    projectId,
    currentAssignments,
    onClose,
    onAdd,
    onUnassign
}: AddTaskAssignmentDialogProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<ProjectMember[]>([]);
    const { authState } = useAuth();
    const dialogRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const members = await getProjectMembers(projectId!, authState.accessToken!);
                const activeMembers: ProjectMember[] = members[0].map((member: any) => member.user);
                setUsers(activeMembers);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [projectId, authState.accessToken]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const filteredUsers = users.filter(user => {
        if (!user?.name || !user?.email) return false;

        const query = searchQuery.toLowerCase();
        return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    });

    const isUserAlreadyAssigned = (userId: string) => {
        return currentAssignments.some(assigned => assigned.id === userId);
    };

    const isUserSelected = (userId: string) => {
        return selectedUsers.some(selected => selected.id === userId);
    };

    const handleSelectUser = (user: ProjectMember) => {
        if (isUserSelected(user.id)) {
            setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleRemoveSelected = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
    };

    const handleSubmit = () => {
        onAdd(selectedUsers);
        onClose();
    };

    const resetSearch = () => {
        setSearchQuery('');
        searchInputRef.current?.focus();
    };

    const getUserInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleUnassignUser = (userId: string) => {
        if (onUnassign) {
            onUnassign(userId);
            // Also remove from selected users if present
            setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 px-2 sm:px-4 py-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                ref={dialogRef}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-xl sm:max-w-2xl mx-auto max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Assign Team Members</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Select members to assign to this task
                            </p>
                        </div>
                        <button
                            type='button'
                            onClick={onClose}
                            className="p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {/* Selected Users */}
                    <AnimatePresence>
                        {selectedUsers.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-4"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map(user => (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full pl-3 pr-2 py-1 flex items-center text-sm font-medium shadow-sm"
                                        >
                                            <span className="flex items-center">
                                                <span className="h-5 w-5 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium text-xs mr-2">
                                                    {getUserInitials(user.name)}
                                                </span>
                                                {user.name}
                                            </span>
                                            <button
                                                type='button'
                                                onClick={() => handleRemoveSelected(user.id)}
                                                className="ml-1 h-5 w-5 rounded-full cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 flex items-center justify-center"
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Search Input */}
                    <div className="relative mb-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                placeholder="Search team members..."
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    type='button'
                                    onClick={resetSearch}
                                    className="absolute inset-y-0 cursor-pointer right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Team Members ({filteredUsers.length})
                        </h4>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <FaSpinner className="animate-spin text-gray-400 text-2xl" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredUsers.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-8"
                                    >
                                        <div className="flex flex-col items-center py-2">
                                            <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-4 mb-4">
                                                <FaSearch className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 font-medium">No members found</p>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                                {searchQuery ? "Try adjusting your search" : "No active members in this project"}
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredUsers.map(user => {
                                            const isAssigned = isUserAlreadyAssigned(user.id);
                                            const isSelected = isUserSelected(user.id);

                                            return (
                                                <li
                                                    key={user.id}
                                                    className={`py-3 ${isAssigned ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                                                >
                                                    <div className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}>
                                                        <div
                                                            onClick={isAssigned ? undefined : () => handleSelectUser(user)}
                                                            className="flex-1 flex items-center"
                                                        >
                                                            <div className="relative">
                                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-medium text-sm mr-3 ${user.id === authState.user?.id
                                                                    ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                                                                    : isSelected
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300'
                                                                    }`}>
                                                                    {getUserInitials(user.name)}
                                                                    {user.id === authState.user?.id && (
                                                                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-indigo-600 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                                            <FaStar className="text-white text-xs" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-left flex-1 min-w-0">
                                                                <p className={`text-sm font-medium ${user.id === authState.user?.id
                                                                    ? 'text-indigo-800 dark:text-indigo-200'
                                                                    : isSelected
                                                                        ? 'text-indigo-700 dark:text-indigo-300'
                                                                        : 'text-gray-900 dark:text-gray-100'
                                                                    } truncate`}>
                                                                    {user.name}
                                                                    {user.id === authState.user?.id && (
                                                                        <span className="ml-1 text-xs text-indigo-600 dark:text-indigo-300">(You)</span>
                                                                    )}
                                                                </p>
                                                                <p className={`text-xs truncate ${isSelected ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                    {user.email}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {isAssigned ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded-full whitespace-nowrap">
                                                                    {user.id === authState.user?.id ? 'You are assigned' : 'Assigned'}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUnassignUser(user.id)}
                                                                    className="p-1.5 cursor-pointer text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                                    title="Unassign"
                                                                >
                                                                    <FaTrash className="h-4 w-4 text-red-600" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={() => handleSelectUser(user)}
                                                                className={`h-5 w-5 rounded border cursor-pointer flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-500 hover:border-indigo-500'
                                                                    }`}
                                                            >
                                                                {isSelected && <FaCheck className="h-3 w-3 text-white" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                        {selectedUsers.length > 0 ? (
                            <span className="flex items-center">
                                <FaCheck className="mr-2 text-green-500" />
                                {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <FaUserPlus className="mr-2" />
                                Select members to assign
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            type='button'
                            onClick={onClose}
                            className="px-4 py-2 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type='button'
                            onClick={handleSubmit}
                            disabled={selectedUsers.length === 0}
                            className={`px-4 cursor-pointer py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${selectedUsers.length > 0
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <FaCheck className="mr-2" />
                            Assign Members
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};