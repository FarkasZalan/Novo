import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { FaSpinner, FaCalendarAlt, FaTimes } from 'react-icons/fa';

interface MilestoneFormValues {
    name: string;
    description: string;
    due_date: string;
}

interface MilestoneFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (form: MilestoneFormValues) => Promise<void>;
    initialData?: Milestone;
    isSubmitting: boolean;
}

export const MilestoneFormModal: React.FC<MilestoneFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isSubmitting,
}) => {
    const [form, setForm] = useState<MilestoneFormValues>({
        name: '',
        description: '',
        due_date: '',
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name,
                description: initialData.description || '',
                due_date: initialData.due_date ? initialData.due_date.slice(0, 10) : '',
            });
        } else {
            setForm({
                name: '',
                description: '',
                due_date: '',
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(form);
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {initialData ? 'Edit Milestone' : 'Create Milestone'}
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 cursor-pointer hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            <FaTimes className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Project Launch"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="block w-full rounded-lg border-0 py-2.5 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:dark:ring-indigo-500 sm:text-sm sm:leading-6"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                placeholder="Describe the milestone..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                className="block w-full rounded-lg border-0 py-2.5 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:dark:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Due Date
                            </label>
                            <div className="relative mt-1 rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    value={form.due_date}
                                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                                    className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:dark:ring-indigo-500 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="inline-flex justify-center rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!form.name || isSubmitting}
                                className={`inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${!form.name || isSubmitting
                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 cursor-pointer'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        {initialData ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : initialData ? (
                                    'Update Milestone'
                                ) : (
                                    'Create Milestone'
                                )}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};