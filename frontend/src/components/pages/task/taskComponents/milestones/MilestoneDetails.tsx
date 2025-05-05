import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../hooks/useAuth';
import { FaArrowLeft, FaEdit, FaTrash, FaFlag, FaTasks, FaCalendarAlt, FaCheck } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getMilestoneById,
    getAllTaskForMilestone,
    getAllUnassignedTaskForMilestone,
    updateMilestone,
    deleteMilestone,
    addMilestoneToTask,
    deleteMilestoneFromTask,
} from '../../../../../services/milestonesService';
import { Task } from '../../../../../types/task';
import { MilestoneFormModal } from './MilestoneFormModal';
import { ConfirmationDialog } from '../../../project/ConfirmationDialog';
import toast from 'react-hot-toast';
import { MilestoneTasks } from './MilestoneTasks';
import { getProjectMembers } from '../../../../../services/projectMemberService';
import { fetchProjectById } from '../../../../../services/projectService';

export const MilestoneDetailsPage: React.FC = () => {
    const { projectId, milestoneId } = useParams<{ projectId: string; milestoneId: string }>();
    const { authState } = useAuth();
    const navigate = useNavigate();

    const [milestone, setMilestone] = useState<Milestone | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [milestoneTasks, setMilestoneTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [canManage, setCanManage] = useState(false);

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [_isAddingTasks, setIsAddingTasks] = useState(false);

    // Load milestone and tasks data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [milestoneData, allTasks, mTasks] = await Promise.all([
                    getMilestoneById(milestoneId!, projectId!, authState.accessToken!),
                    getAllUnassignedTaskForMilestone(projectId!, authState.accessToken!),
                    getAllTaskForMilestone(milestoneId!, projectId!, authState.accessToken!),
                ]);

                setMilestone(milestoneData);
                setTasks(allTasks);
                setMilestoneTasks(mTasks);

                // Check permissions
                const project = await fetchProjectById(projectId!, authState.accessToken!);
                if (project.owner_id === authState.user?.id) {
                    setCanManage(true);
                } else {
                    const members = await getProjectMembers(projectId!, authState.accessToken!);
                    const [activeMembers = []] = members;
                    const currentUserMember = activeMembers.find(
                        (member: any) => member.user_id === authState.user?.id
                    );
                    if (currentUserMember && currentUserMember.role === "admin") {
                        setCanManage(true);
                    }
                }

            } catch (err) {
                console.error(err);
                setError('Failed to load milestone data');
                toast.error('Failed to load milestone data');
            } finally {
                setLoading(false);
            }
        };

        if (projectId && milestoneId) loadData();
    }, [projectId, milestoneId, authState.accessToken]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleUpdateMilestone = async (form: { name: string; description: string; due_date: string }) => {
        try {
            setIsSubmitting(true);
            const dueDateObj = form.due_date ? new Date(form.due_date) : undefined;

            await updateMilestone(
                milestoneId!,
                projectId!,
                authState.accessToken!,
                form.name,
                form.description,
                dueDateObj
            );

            const updated = await getMilestoneById(milestoneId!, projectId!, authState.accessToken!);
            setMilestone(updated);
            setIsEditModalOpen(false);
            toast.success('Milestone updated successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update milestone');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMilestone = async () => {
        try {
            setLoading(true);
            await deleteMilestone(milestoneId!, projectId!, authState.accessToken!);
            toast.success('Milestone deleted successfully');
            navigate(`/projects/${projectId}/tasks?milestones`, { replace: true });
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete milestone');
        } finally {
            setIsDeleteConfirmOpen(false);
            setLoading(false);
        }
    };

    const handleAddTasks = async (taskIds: string[]) => {
        try {
            setIsAddingTasks(true);
            const loadingToast = toast.loading(`Adding ${taskIds.length} tasks...`);

            await addMilestoneToTask(
                milestoneId!,
                projectId!,
                taskIds,
                authState.accessToken!
            );

            const [updatedTasks, updatedMilestoneTasks, updatedMilestone] = await Promise.all([
                getAllUnassignedTaskForMilestone(projectId!, authState.accessToken!),
                getAllTaskForMilestone(milestoneId!, projectId!, authState.accessToken!),
                getMilestoneById(milestoneId!, projectId!, authState.accessToken!),
            ]);

            setTasks(updatedTasks);
            setMilestoneTasks(updatedMilestoneTasks);
            setMilestone(updatedMilestone);
            toast.success(`${taskIds.length} task${taskIds.length !== 1 ? 's' : ''} added to milestone`, { id: loadingToast });
        } catch (err) {
            console.error(err);
            toast.error('Failed to add tasks to milestone');
        } finally {
            setIsAddingTasks(false);
        }
    };

    const handleRemoveTask = async (taskId: string) => {
        try {
            const loadingToast = toast.loading('Removing task from milestone...');

            await deleteMilestoneFromTask(
                milestoneId!,
                projectId!,
                taskId,
                authState.accessToken!
            );

            const [updatedTasks, updatedMilestoneTasks, updatedMilestone] = await Promise.all([
                getAllUnassignedTaskForMilestone(projectId!, authState.accessToken!),
                getAllTaskForMilestone(milestoneId!, projectId!, authState.accessToken!),
                getMilestoneById(milestoneId!, projectId!, authState.accessToken!),
            ]);

            setTasks(updatedTasks);
            setMilestoneTasks(updatedMilestoneTasks);
            setMilestone(updatedMilestone);

            toast.success('Task removed successfully', { id: loadingToast });
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove task from milestone');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg max-w-2xl mx-auto mt-8">
                {error}
            </div>
        );
    }

    if (!milestone) {
        return (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg max-w-2xl mx-auto mt-8">
                Milestone not found
            </div>
        );
    }

    const isOverdue = milestone.due_date && new Date(milestone.due_date) < new Date();
    const progress = milestone.all_tasks_count > 0
        ? Math.round((milestone.completed_tasks_count / milestone.all_tasks_count) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with breadcrumbs */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(`/projects/${projectId}/tasks?milestones`)}
                        className="flex items-center cursor-pointer text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Milestones
                    </button>

                    {canManage && (
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow hover:shadow-md"
                            >
                                <FaEdit className="mr-2" />
                                Edit
                            </button>
                            <button
                                onClick={() => setIsDeleteConfirmOpen(true)}
                                className="flex items-center px-4 cursor-pointer py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow hover:shadow-md"
                            >
                                <FaTrash className="mr-2" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Milestone Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-8"
                >
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                            <div className={`flex-shrink-0 h-16 w-16 rounded-lg flex items-center justify-center mb-4 md:mb-0 ${isOverdue ? 'bg-red-500' : 'bg-indigo-500'
                                }`}>
                                <FaFlag className="text-white text-2xl" />
                            </div>

                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {milestone.name}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mt-2">
                                    {milestone.description || 'No description provided'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                                    <FaCalendarAlt />
                                    <span className="text-sm font-medium">Due Date</span>
                                </div>
                                <p className={`mt-2 text-lg font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                                    }`}>
                                    {formatDate(milestone.due_date!)}
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                                    <FaTasks />
                                    <span className="text-sm font-medium">Tasks</span>
                                </div>
                                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {milestone.completed_tasks_count} / {milestone.all_tasks_count} completed
                                </p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                                    <FaCheck />
                                    <span className="text-sm font-medium">Progress</span>
                                </div>
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                        <div
                                            className="bg-indigo-500 h-2.5 rounded-full"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                        {progress}% complete
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tasks Section */}
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <MilestoneTasks
                            milestone={milestone}
                            tasks={tasks}
                            milestoneTasks={milestoneTasks}
                            canManage={canManage}
                            onAddTasks={handleAddTasks}
                            onRemoveTask={handleRemoveTask}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Edit Milestone Modal */}
            <MilestoneFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateMilestone}
                initialData={milestone}
                isSubmitting={isSubmitting}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeleteMilestone}
                title="Delete Milestone?"
                message="Are you sure you want to delete this milestone? All task associations will be removed."
                confirmText="Delete Milestone"
                confirmColor="red"
            />
        </div>
    );
};