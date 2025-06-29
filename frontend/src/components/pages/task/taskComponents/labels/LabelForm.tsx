import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { FaSpinner, FaTimes, FaPalette, FaCheck, FaEyeDropper } from 'react-icons/fa';
import { DEFAULT_COLORS } from '../../../../utils/DefaultColors';

interface LabelFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (form: LabelFormValues) => Promise<void>;
    initialData?: Label;
    isSubmitting: boolean;
}

export const LabelFormModal: React.FC<LabelFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isSubmitting,
}) => {
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [form, setForm] = useState<LabelFormValues>({
        name: '',
        description: '',
        color: DEFAULT_COLORS[0],
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name,
                description: initialData.description || '',
                color: initialData.color || DEFAULT_COLORS[0],
            });
        } else {
            setForm({
                name: '',
                description: '',
                color: DEFAULT_COLORS[0],
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(form);
        setForm({
            name: '',
            description: '',
            color: DEFAULT_COLORS[0],
        });
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {initialData ? 'Edit Label' : 'Create Label'}
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
                                placeholder="e.g., Bug, Feature, Urgent"
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
                                placeholder="Describe the label..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                rows={3}
                                className="block w-full rounded-lg border-0 py-2.5 px-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:dark:ring-indigo-500 sm:text-sm sm:leading-6"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color
                            </label>
                            <div className="space-y-3">
                                {/* Preset Colors Grid */}
                                <div className="grid grid-cols-8 gap-2">
                                    {DEFAULT_COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => {
                                                setForm({ ...form, color });
                                                setShowCustomPicker(false);
                                            }}
                                            className={`relative w-full aspect-square rounded-md cursor-pointer transition-all 
                                        hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 dark:hover:ring-gray-500
                                        ${form.color === color ? 'ring-2 ring-offset-1 ring-gray-600 dark:ring-gray-300' : ''}`}
                                            style={{ backgroundColor: color }}
                                            title={`Color ${color}`}
                                        >
                                            {form.color === color && (
                                                <FaCheck className="absolute inset-0 m-auto text-white/90 drop-shadow-md" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Color Selection */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCustomPicker(!showCustomPicker)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                                    ${showCustomPicker
                                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-100'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        <FaEyeDropper className="w-4 h-4" />
                                        {showCustomPicker ? 'Hide Picker' : 'Custom Color'}
                                    </button>

                                    {showCustomPicker && (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={form.color}
                                                onChange={e => setForm({ ...form, color: e.target.value })}
                                                className="w-10 h-10 cursor-pointer rounded-lg bg-transparent"
                                            />
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <FaPalette className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={form.color}
                                                    onChange={e => setForm({ ...form, color: e.target.value })}
                                                    className="block w-28 rounded-lg border-0 py-2 pl-8 pr-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:dark:ring-indigo-500 text-xs"
                                                    placeholder="Hex code"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Current Color Preview */}
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Selected:</span>
                                        <div
                                            className="w-8 h-8 rounded-md border-2 border-gray-300 dark:border-gray-500 flex items-center justify-center"
                                            style={{ backgroundColor: form.color }}
                                        >
                                            {DEFAULT_COLORS.includes(form.color) && (
                                                <FaCheck className="text-white/90 text-xs" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="inline-flex justify-center rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!form.name || isSubmitting}
                                className={`inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors w-full sm:w-auto ${!form.name || isSubmitting
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
                                    'Update Label'
                                ) : (
                                    'Create Label'
                                )}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};