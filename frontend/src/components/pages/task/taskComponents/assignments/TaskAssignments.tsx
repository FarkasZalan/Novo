import { useEffect, useState } from 'react'
import { FaUser, FaPlus, FaSpinner, FaTimes, FaUserMinus, FaUserPlus } from 'react-icons/fa'
import { useAuth } from '../../../../../hooks/useAuth';
import {
    fetchAssignmentsForTask,
    addAssignmentForMyself,
    deleteOtherUserAssignment,
    deleteAssignmentMyself
} from '../../../../../services/assignmentService';
import { useParams } from 'react-router-dom';
import { AddTaskAssignmentDialog } from './AssignMemberDialog';
import ProjectMember from '../../../../../types/projectMember';
import { motion } from 'framer-motion';
import { fetchProjectById } from '../../../../../services/projectService';

interface TaskAssignmentsProps {
    isOpenForm?: boolean
    pendingUsers: ProjectMember[]
    setPendingUsers: (users: ProjectMember[]) => void
    compactMode: boolean
    taskIdFromCompactMode?: string
    showAssignButtonInCompactMode?: boolean
}

export const TaskAssignments: React.FC<TaskAssignmentsProps> = ({
    isOpenForm,
    pendingUsers,
    setPendingUsers,
    compactMode,
    taskIdFromCompactMode,
    showAssignButtonInCompactMode
}) => {
    const { projectId, taskId: taskIdFromRoute } = useParams<{ projectId: string; taskId: string }>();
    const taskId = taskIdFromCompactMode ?? taskIdFromRoute;
    const [existingUsers, setExistingUsers] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { authState } = useAuth();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [isAssigningSelf, setIsAssigningSelf] = useState(false);
    const [project, setProject] = useState<Project | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!projectId || !taskId || !authState.accessToken) return;
            const users = await fetchAssignmentsForTask(projectId!, taskId!, authState.accessToken!);

            setProject(await fetchProjectById(projectId!, authState.accessToken!));

            const assignedUsers: ProjectMember[] = users.map((user: any) => ({
                id: user.user_id,
                name: user.user_name,
                email: user.user_email
            }));

            setExistingUsers(assignedUsers);
        } catch (err) {
            setError('Failed to fetch assigned users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (taskId) {
            fetchUsers();
        }
    }, [taskId, projectId, authState.accessToken]);

    const handleAddAssignments = (selectedUsers: ProjectMember[]) => {
        // Filter out users that are already in pending or existing
        const newUsers = selectedUsers.filter(
            user => !pendingUsers.some(u => u.id === user.id) &&
                !existingUsers.some(u => u.id === user.id)
        );
        setPendingUsers([...pendingUsers, ...newUsers]);
    };

    const handleRemovePendingUser = (userId: string) => {
        setPendingUsers(pendingUsers.filter(user => user.id !== userId));
    };

    const handleUnassignUser = async (userId: string) => {
        if (!projectId || !authState.accessToken) return;

        try {
            if (pendingUsers.some(u => u.id === userId)) {
                handleRemovePendingUser(userId);
            } else {
                await deleteOtherUserAssignment(projectId, taskId!, userId, authState.accessToken);
                await fetchUsers();
            }
        } catch (err) {
            setError('Failed to unassign user');
        }
    };

    const handleAssignMyself = async () => {
        if (!projectId || !authState.accessToken) return;

        if (!taskId) {
            if (pendingUsers.some(user => user.id === authState.user?.id)) {
                handleRemovePendingUser(authState.user!.id);
            } else {
                setPendingUsers([...pendingUsers, authState.user!]);
            }
        } else {
            try {
                setIsAssigningSelf(true);
                if (isAssignedMyself) {
                    await deleteAssignmentMyself(projectId, taskId!, authState.user!.id, authState.accessToken);
                } else {
                    await addAssignmentForMyself(projectId, taskId!, authState.accessToken);
                }
                await fetchUsers();
            } catch (err) {
                setError('Failed to update assignment');
            } finally {
                setIsAssigningSelf(false);
            }
        }
    };

    const isAssignedMyself = existingUsers.some(user => user.id === authState.user?.id) ||
        pendingUsers.some(user => user.id === authState.user?.id);
    const showAssignSelfButton = authState.user;

    const getUserInitials = (name: string) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };


    if (compactMode) {
        const allAssignments = [...existingUsers, ...pendingUsers];
        const uniqueAssignments = allAssignments.filter(
            (user, index, self) => index === self.findIndex(u => u.id === user.id)
        );

        return (
            <div className="flex items-center gap-2">
                {loading && taskId ? (
                    <FaSpinner className="animate-spin text-gray-400" size={12} />
                ) : error ? (
                    <span className="text-red-500 text-xs">Error</span>
                ) : (
                    <div className="flex items-center gap-1.5">
                        {/* Assignments display */}

                        <div className="flex -space-x-1.5">
                            {uniqueAssignments.slice(0, 3).map((user) => {
                                const initials = getUserInitials(user.name);
                                const isCurrentUser = user.id === authState.user?.id;

                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className={`relative h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ring-2 ring-white dark:ring-gray-800 ${isCurrentUser
                                            ? 'bg-indigo-500 text-white shadow-sm'
                                            : 'bg-indigo-200 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-200'
                                            }`}
                                        title={`${user.name}${isCurrentUser ? ' (You)' : ''}`}
                                    >
                                        {initials}
                                        {isCurrentUser && (
                                            <motion.span
                                                className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-green-400 border border-white dark:border-gray-800"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2 }}
                                            />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                        {uniqueAssignments.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{uniqueAssignments.length - 3}
                            </span>
                        )}

                        {/* Assign button - only shown when enabled and there's a user */}
                        {showAssignButtonInCompactMode && showAssignSelfButton && !project?.read_only && (
                            <button
                                type='button'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssignMyself();
                                }}
                                disabled={isAssigningSelf}
                                className={`p-1 rounded-full cursor-pointer transition-colors ${isAssignedMyself
                                    ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20'
                                    : 'text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/20'
                                    }`}
                                title={isAssignedMyself ? "Unassign me" : "Assign me"}
                            >
                                {isAssigningSelf ? (
                                    <FaSpinner className="animate-spin" size={16} />
                                ) : isAssignedMyself ? (
                                    <FaUserMinus size={16} className='hover:text-red-400' />
                                ) : (
                                    <FaUserPlus size={16} className='hover:text-indigo-400' />
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FaUser className="mr-2" />
                    <h3 className="font-medium">Assigned To</h3>
                </div>

                <div className="flex gap-2">
                    {showAssignSelfButton && !project?.read_only && (
                        <button
                            type="button"
                            onClick={handleAssignMyself}
                            disabled={isAssigningSelf}
                            className={`flex cursor-pointer items-center text-sm px-3 py-1.5 rounded-lg transition-colors ${isAssignedMyself
                                ? "bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/40 text-red-700 dark:text-red-200 shadow-sm"
                                : "bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 shadow-sm"
                                }`}
                        >
                            {isAssigningSelf ? (
                                <FaSpinner className="animate-spin mr-1" size={12} />
                            ) : (
                                <FaPlus className="mr-1" size={12} />
                            )}
                            {isAssignedMyself ? "Unassign Me" : "Assign Me"}
                        </button>
                    )}

                    {isOpenForm && (
                        <button
                            type="button"
                            onClick={() => setShowAddDialog(true)}
                            className="flex items-center cursor-pointer text-sm px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 rounded-lg transition-colors shadow-sm"
                        >
                            <FaPlus className="mr-1" size={12} />
                            Add Others
                        </button>
                    )}
                </div>
            </div>

            {loading && taskId ? (
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <FaSpinner className="animate-spin" />
                    <span>Loading assignments...</span>
                </div>
            ) : error ? (
                <div className="text-red-500 dark:text-red-400 text-sm">
                    {error}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Pending Assignments */}
                    {isOpenForm && pendingUsers.length > 0 && (
                        <div>
                            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Pending Assignment
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {pendingUsers.map(user => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="relative bg-indigo-100 dark:bg-indigo-900/30 rounded-full pl-3 pr-8 py-1 flex items-center text-sm shadow-sm"
                                    >
                                        <div className="flex items-center">
                                            <div className="h-5 w-5 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium text-xs mr-2">
                                                {getUserInitials(user.name)}
                                            </div>
                                            <div className="group relative">
                                                <span className="text-gray-800 dark:text-gray-200">
                                                    {user.name}
                                                </span>
                                                {user.email && (
                                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                                                        {user.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleUnassignUser(user.id)}
                                            className="absolute right-2 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                        >
                                            <FaTimes className="h-3 w-3" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Existing Assignments */}
                    {(existingUsers.length > 0 || (!taskId && pendingUsers.length > 0)) && (
                        <div>
                            {isOpenForm && (
                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                    {taskId ? 'Currently Assigned' : 'Assignments'}
                                </h4>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {existingUsers.map(user => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`relative rounded-full pl-3 pr-8 py-1 flex items-center text-sm shadow-sm ${user.id === authState.user?.id
                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700'
                                            : 'bg-gray-100 dark:bg-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`h-5 w-5 rounded-full flex items-center justify-center font-medium text-xs mr-2 ${user.id === authState.user?.id
                                                ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                                                : 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300'
                                                }`}>
                                                {getUserInitials(user.name)}
                                            </div>
                                            <div className="group relative">
                                                <span className={`${user.id === authState.user?.id
                                                    ? 'text-indigo-800 dark:text-indigo-200 font-medium'
                                                    : 'text-gray-800 dark:text-gray-200'
                                                    }`}>
                                                    {user.name}
                                                    {user.id === authState.user?.id && (
                                                        <span className="ml-1 text-xs text-indigo-600 dark:text-indigo-300">(You)</span>
                                                    )}
                                                </span>
                                                {user.email && (
                                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                                                        {user.email}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {(isOpenForm || pendingUsers.some(u => u.id === user.id)) && (
                                            <button
                                                type="button"
                                                onClick={() => handleUnassignUser(user.id)}
                                                className="absolute right-2 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                                            >
                                                <FaTimes className="h-3 w-3" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {existingUsers.length === 0 && pendingUsers.length === 0 && (
                        <div className="text-gray-500 dark:text-gray-400 italic">
                            {isOpenForm ? 'No members assigned yet' : 'No one assigned yet'}
                        </div>
                    )}
                </div>
            )}

            {showAddDialog && projectId && (
                <AddTaskAssignmentDialog
                    projectId={projectId}
                    currentAssignments={[...existingUsers, ...pendingUsers]}
                    onClose={() => setShowAddDialog(false)}
                    onAdd={handleAddAssignments}
                    onUnassign={handleUnassignUser}
                />
            )}
        </div>
    );
};