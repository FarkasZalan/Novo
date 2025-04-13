import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { createProject } from "../../../services/projectService";

export const CreateProject = () => {
    const { authState } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{
        name?: string;
        description?: string;
    }>({});

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear field error when user types
        if (fieldErrors[name as keyof typeof fieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setFieldErrors({});

        // Client-side validation
        if (formData.name.trim().length < 2) {
            setFieldErrors(prev => ({
                ...prev,
                name: "Project name must be at least 2 characters"
            }));
            setIsSubmitting(false);
            return;
        }

        try {
            await createProject(
                formData.name,
                formData.description,
                authState.user.id,
                authState.accessToken!
            );
            navigate("/dashboard");
        } catch (err: any) {
            if (err.response?.status === 400) {
                if (err.response.data?.error) {
                    // For field-specific errors like name length
                    if (err.response.data.error.includes('"name"')) {
                        setFieldErrors({
                            name: err.response.data.message || "Invalid project name"
                        });
                    } else {
                        setError(err.response.data.message || "Invalid input data");
                    }
                } else {
                    setError(err.response.data?.message || "Invalid input data");
                }
            } else {
                setError(err instanceof Error ? err.message : "Failed to create project");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create New Project</h1>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Project Details</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-4">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Project Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Project Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`block w-full px-4 py-2 border ${fieldErrors.name
                                            ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                                            : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                        } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                                    placeholder="e.g. Website Redesign"
                                />
                                {fieldErrors.name && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Describe the project goals and objectives..."
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 flex justify-center">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center cursor-pointer ${isSubmitting
                                            ? 'bg-indigo-400 dark:bg-indigo-600 cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
                                        } transition-colors duration-200`}
                                >
                                    {isSubmitting ? (
                                        <span>Creating...</span>
                                    ) : (
                                        <>
                                            <FaPlus className="mr-2" />
                                            Create Project
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};