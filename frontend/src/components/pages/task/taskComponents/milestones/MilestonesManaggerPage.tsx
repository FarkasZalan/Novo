import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaFlag, FaPlus, FaSpinner, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../../../../hooks/useAuth';
import {
    getAllMilestonesForProject,
    updateMilestone,
    createMilestone,
    deleteMilestone,
    getAllTaskForMilestone,
    deleteMilestoneFromTask,
    addMilestoneToTask,
    getAllUnassignedTaskForMilestone,
} from '../../../../../services/milestonesService';
import { getProjectMembers } from '../../../../../services/projectMemberService';
import { fetchProjectById } from '../../../../../services/projectService';
import { Task } from '../../../../../types/task';
import toast from 'react-hot-toast';
import { ConfirmationDialog } from '../../../project/ConfirmationDialog';
import { MilestoneCard } from './MilestoneCard';
import { MilestoneTasks } from './MilestoneTasks';
import { MilestoneFormModal } from './MilestoneFormModal';
import { AnimatePresence, motion } from 'framer-motion';

interface MilestoneFormValues {
    name: string;
    description: string;
    due_date: string;
}

export const MilestonesManagerPage: React.FC<{ project: Project | null }> = React.memo(({ project }) => {
    const { projectId, milestoneId } = useParams<{ projectId: string; milestoneId?: string }>();
    const { authState } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
    const [milestoneTasks, setMilestoneTasks] = useState<Task[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [canManage, setCanManage] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [milestoneToDelete, setMilestoneToDelete] = useState<string | null>(null);
    const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);

    // Filter milestones based on search term
    const filteredMilestones = milestones.filter(milestone =>
        milestone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        milestone.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Load all necessary data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [projectData, allTasks, allMilestones] = await Promise.all([
                    fetchProjectById(projectId!, authState.accessToken!),
                    getAllUnassignedTaskForMilestone(projectId!, authState.accessToken!),
                    getAllMilestonesForProject(projectId!, authState.accessToken!),
                ]);

                setTasks(allTasks);
                setMilestones(allMilestones);

                // Check permissions
                if (projectData.owner_id === authState.user?.id) {
                    setCanManage(true);
                } else {
                    const members = await getProjectMembers(projectId!, authState.accessToken!);
                    const current = members[0]?.find((m: any) => m.user_id === authState.user?.id);
                    if (current?.role === 'admin') setCanManage(true);
                }

                // If URL has milestoneId, select that milestone
                if (milestoneId) {
                    const milestone = allMilestones.find((m: Milestone) => m.id === milestoneId);
                    if (milestone) {
                        setSelectedMilestone(milestone);
                        const mTasks = await getAllTaskForMilestone(milestoneId, projectId!, authState.accessToken!);
                        setMilestoneTasks(mTasks);
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load milestones data');
                toast.error('Failed to load milestones data');
            } finally {
                setLoading(false);
            }
        };

        if (projectId) loadData();
    }, [projectId, milestoneId, authState.accessToken]);

    // Modal handlers
    const openNewModal = () => {
        setCurrentMilestone(null);
        setIsModalOpen(true);
    };

    const openEditModal = (milestone: Milestone) => {
        setCurrentMilestone(milestone);
        setIsModalOpen(true);
    };

    const handleSubmitMilestone = async (form: MilestoneFormValues) => {
        try {
            setIsSubmitting(true);
            const dueDateObj = form.due_date ? new Date(form.due_date) : undefined;

            if (currentMilestone) {
                await updateMilestone(
                    currentMilestone.id,
                    projectId!,
                    authState.accessToken!,
                    form.name,
                    form.description,
                    dueDateObj
                );
                toast.success('Milestone updated successfully');
            } else {
                await createMilestone(
                    projectId!,
                    authState.accessToken!,
                    form.name,
                    form.description,
                    dueDateObj
                );
                toast.success('Milestone created successfully');
            }

            const updated = await getAllMilestonesForProject(projectId!, authState.accessToken!);
            setMilestones(updated);
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to save milestone');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete handlers
    const confirmDelete = (id: string) => {
        setMilestoneToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!milestoneToDelete) return;

        try {
            await deleteMilestone(milestoneToDelete, projectId!, authState.accessToken!);
            setMilestones(milestones.filter(m => m.id !== milestoneToDelete));

            if (selectedMilestone?.id === milestoneToDelete) {
                setSelectedMilestone(null);
                setMilestoneTasks([]);
                navigate(`/projects/${projectId}/milestones`);
            }

            toast.success('Milestone deleted successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete milestone');
        } finally {
            setIsDeleteConfirmOpen(false);
            setMilestoneToDelete(null);
        }
    };

    // Milestone selection and task management
    const selectMilestone = async (milestone: Milestone) => {
        setSelectedMilestone(milestone);
        navigate(`/projects/${projectId}/milestones/${milestone.id}`);

        try {
            const mTasks = await getAllTaskForMilestone(milestone.id, projectId!, authState.accessToken!);
            setMilestoneTasks(mTasks);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load milestone tasks');
        }
    };

    const handleAddTasks = async (taskIds: string[]) => {
        if (!selectedMilestone) return;

        try {
            await addMilestoneToTask(
                selectedMilestone.id,
                projectId!,
                taskIds,
                authState.accessToken!
            );

            const mTasks = await getAllTaskForMilestone(selectedMilestone.id, projectId!, authState.accessToken!);
            setMilestoneTasks(mTasks);

            // Refresh milestone list to update task counts
            const updated = await getAllMilestonesForProject(projectId!, authState.accessToken!);
            setMilestones(updated);
        } catch (err) {
            console.error(err);
            toast.error('Failed to add tasks to milestone');
        }
    };

    const handleRemoveTask = async (taskId: string) => {
        if (!selectedMilestone) return;

        try {
            await deleteMilestoneFromTask(
                selectedMilestone.id,
                projectId!,
                taskId,
                authState.accessToken!
            );

            setMilestoneTasks(milestoneTasks.filter(t => t.id !== taskId));

            // Refresh milestone list to update task counts
            const updated = await getAllMilestonesForProject(projectId!, authState.accessToken!);
            setMilestones(updated);

            toast.success('Task removed from milestone');
        } catch (err) {
            console.error(err);
            toast.error('Failed to remove task from milestone');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-2xl text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Main content area */}
                {filteredMilestones.length === 0 && !searchTerm ? (
                    // Empty state when there are no milestones
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-8 text-center">
                        <div className="mx-auto w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                            <FaFlag className="text-indigo-600 dark:text-indigo-300 text-3xl" />
                        </div>
                        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No milestones yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                            Create your first milestone to organize and track your project tasks
                        </p>
                        {canManage && !project?.read_only && (
                            <button
                                onClick={openNewModal}
                                className="inline-flex cursor-pointer items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                            >
                                <FaPlus className="mr-2" /> Create First Milestone
                            </button>
                        )}
                    </div>
                ) : (
                    // Normal view when milestones exist
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Selected milestone details */}
                        <div className="lg:col-span-1">
                            <AnimatePresence>
                                {selectedMilestone ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200"
                                    >
                                        <MilestoneTasks
                                            milestone={selectedMilestone}
                                            tasks={tasks}
                                            milestoneTasks={milestoneTasks}
                                            canManage={canManage}
                                            onAddTasks={handleAddTasks}
                                            onRemoveTask={handleRemoveTask}
                                            project={project}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-8 text-center"
                                    >
                                        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                                            <FaFlag className="text-gray-400 text-3xl" />
                                        </div>
                                        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            {filteredMilestones.length > 0 ? "Select a milestone" : "No milestones found"}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                                            {filteredMilestones.length > 0
                                                ? "Choose a milestone from the list to view details"
                                                : "Create a milestone to get started"}
                                        </p>
                                        {canManage && !project?.read_only && (
                                            <button
                                                onClick={openNewModal}
                                                className="inline-flex cursor-pointer items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                            >
                                                <FaPlus className="mr-2" /> Create Milestone
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Milestones sidebar */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                                {/* Search bar */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Search milestones..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Milestones list */}
                                <div className="space-y-4">
                                    {filteredMilestones.length > 0 ? (
                                        filteredMilestones.map(milestone => (
                                            <MilestoneCard
                                                key={milestone.id}
                                                milestone={milestone}
                                                isSelected={selectedMilestone?.id === milestone.id}
                                                onSelect={selectMilestone}
                                                onEdit={openEditModal}
                                                onDelete={confirmDelete}
                                                canManage={canManage}
                                                project={project}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                                                <FaFlag className="text-indigo-600 dark:text-indigo-300 text-xl" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                No matching milestones
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Try adjusting your search criteria
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Milestone Form Modal */}
            <MilestoneFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitMilestone}
                initialData={currentMilestone!}
                isSubmitting={isSubmitting}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Milestone?"
                message="Are you sure you want to delete this milestone? All associated tasks will be unassigned from this milestone."
                confirmText="Delete Milestone"
                confirmColor="red"
            />
        </div>
    );
});