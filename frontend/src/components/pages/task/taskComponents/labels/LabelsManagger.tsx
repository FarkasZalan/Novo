import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaTags, FaPlus, FaSpinner, FaSearch, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../../../../hooks/useAuth';
import { getProjectMembers } from '../../../../../services/projectMemberService';
import { fetchProjectById } from '../../../../../services/projectService';
import toast from 'react-hot-toast';
import { ConfirmationDialog } from '../../../project/ConfirmationDialog';
import { getAllLabelForProject, updateLabel, createLabel, deleteLabel } from '../../../../../services/labelService';
import { LabelCard } from './LabelCard';
import { LabelFormModal } from './LabelForm';
import { AnimatePresence, motion } from 'framer-motion';

export const LabelsManagerPage: React.FC<{ project: Project | null }> = React.memo(({ project }) => {
    const { projectId } = useParams<{ projectId: string; }>();
    const { authState } = useAuth();

    const [labels, setLabels] = useState<Label[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [canManage, setCanManage] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [labelToDelete, setLabelToDelete] = useState<string | null>(null);
    const [currentLabel, setCurrentLabel] = useState<Label | null>(null);

    const filteredLabels = labels.filter(label =>
        label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        label.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [projectData, allLabels] = await Promise.all([
                    fetchProjectById(projectId!, authState.accessToken!),
                    getAllLabelForProject(projectId!, authState.accessToken!),
                ]);

                setLabels(allLabels);

                if (projectData.owner_id === authState.user?.id) {
                    setCanManage(true);
                } else {
                    const members = await getProjectMembers(projectId!, authState.accessToken!);
                    const current = members[0]?.find((m: any) => m.user_id === authState.user?.id);
                    if (current?.role === 'admin') setCanManage(true);
                }
            } catch (err) {
                setError('Failed to load labels data');
                toast.error('Failed to load labels data');
            } finally {
                setLoading(false);
            }
        };

        if (projectId) loadData();
    }, [projectId, authState.accessToken]);

    const openNewModal = () => {
        setCurrentLabel(null);
        setIsModalOpen(true);
    };

    const openEditModal = (label: Label) => {
        setCurrentLabel(label);
        setIsModalOpen(true);
    };

    const handleSubmitLabel = async (form: LabelFormValues) => {
        try {
            setIsSubmitting(true);

            if (currentLabel) {
                await updateLabel(
                    projectId!,
                    authState.accessToken!,
                    currentLabel.id,
                    form.name,
                    form.description,
                    form.color
                );
                toast.success('Label updated successfully');
            } else {
                await createLabel(
                    projectId!,
                    authState.accessToken!,
                    form.name,
                    form.description,
                    form.color
                );
                toast.success('Label created successfully');
            }

            const updated = await getAllLabelForProject(projectId!, authState.accessToken!);
            setLabels(updated);
            setIsModalOpen(false);
        } catch (err: any) {
            if (err.response?.status === 400) {
                // Check the exact structure from your error response
                if (err.response.data?.message === "Label name already exists") {
                    toast.error('Label name already exists');
                } else {
                    toast.error('Failed to save label');
                }
            } else {
                toast.error('Failed to save label');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = (id: string) => {
        setLabelToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!labelToDelete) return;

        try {
            await deleteLabel(projectId!, authState.accessToken!, labelToDelete);
            setLabels(labels.filter(l => l.id !== labelToDelete));
            toast.success('Label deleted successfully');
        } catch (err) {
            toast.error('Failed to delete label');
        } finally {
            setIsDeleteConfirmOpen(false);
            setLabelToDelete(null);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Main content area */}
                {filteredLabels.length === 0 && !searchTerm ? (
                    // Empty state when there are no labels
                    <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-md dark:shadow-gray-700/50 p-6 md:p-8 text-center">
                        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                            <FaTags className="text-indigo-600 dark:text-indigo-300 text-xl sm:text-2xl md:text-3xl" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No labels yet
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 max-w-md mx-auto">
                            Create your first label to categorize and organize your project tasks
                        </p>
                        {canManage && !project?.read_only && (
                            <button
                                onClick={openNewModal}
                                className="inline-flex cursor-pointer items-center px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
                            >
                                <FaPlus className="mr-2" /> Create First Label
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-md dark:shadow-gray-700/50 p-4 sm:p-6 transition-colors duration-200">
                        {/* Header */}
                        <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Project Labels</h2>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        {labels.length} {labels.length === 1 ? 'label' : 'labels'} total
                                    </p>
                                </div>
                                {canManage && !project?.read_only && (
                                    <button
                                        onClick={openNewModal}
                                        className="inline-flex cursor-pointer items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                                    >
                                        <FaPlus className="mr-2" /> New Label
                                    </button>
                                )}
                            </div>

                            {/* Enhanced Search Bar */}
                            <div className="relative w-full sm:max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400 text-sm" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-9 pr-8 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                                    placeholder="Search labels..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <FaTimes className="text-sm" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Labels list */}
                        <div className="space-y-2 sm:space-y-3">
                            {filteredLabels.length > 0 ? (
                                <AnimatePresence>
                                    {filteredLabels.map((label) => (
                                        <motion.div
                                            key={label.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <LabelCard
                                                label={label}
                                                onEdit={openEditModal}
                                                onDelete={confirmDelete}
                                                canManage={canManage}
                                                project={project}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            ) : (
                                <div className="text-center py-6 sm:py-8">
                                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                                        <FaTags className="text-indigo-600 dark:text-indigo-300 text-lg sm:text-xl" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                                        No matching labels
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                        Try adjusting your search criteria
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Label Form Modal */}
            <LabelFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitLabel}
                initialData={currentLabel!}
                isSubmitting={isSubmitting}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Label?"
                message="Are you sure you want to delete this label? This will remove the label from all tasks."
                confirmText="Delete Label"
                confirmColor="red"
            />
        </div>
    );
});