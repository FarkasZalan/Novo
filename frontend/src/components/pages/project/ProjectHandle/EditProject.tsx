import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaSave,
    FaTimes,
    FaTrash,
    FaExclamationTriangle,
    FaCheck,
    FaBan,
    FaUsers
} from "react-icons/fa";
import { updateProject, deleteProject, fetchProjectById } from "../../../../services/projectService";
import { useAuth } from "../../../../hooks/useAuth";

export const EditProject = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{
        name?: string;
        description?: string;
    }>({});

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    useEffect(() => {
        const loadProject = async () => {
            try {
                setLoading(true);
                const project = await fetchProjectById(projectId!, authState.accessToken!);
                setProject(project);
                setFormData({
                    name: project.name,
                    description: project.description || "",
                });
            } catch (err) {
                setError("Failed to load project");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (authState.accessToken && projectId) {
            loadProject();
        }
    }, [authState.accessToken, projectId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (project?.read_only) return; // Prevent changes if read-only

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
        if (project?.read_only) return; // Prevent submission if read-only

        setIsSubmitting(true);
        setError(null);
        setFieldErrors({});
        setSuccessMessage(null);

        // Client-side validation
        if (formData.name.trim().length < 2) {
            setFieldErrors({
                name: "Project name must be at least 2 characters"
            });
            setIsSubmitting(false);
            return;
        }

        try {
            await updateProject(
                projectId!,
                formData.name,
                formData.description,
                project?.owner_id!,
                authState.accessToken!,
            );
            setSuccessMessage("Project updated successfully!");
        } catch (err: any) {
            if (err.response?.status === 400) {
                // Handle server-side validation errors
                if (err.response.data?.error) {
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
                setError(err instanceof Error ? err.message : "Failed to update project");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async () => {
        if (project?.read_only) return; // Prevent deletion if read-only
        if (deleteConfirmation !== project?.name) return;

        try {
            setIsSubmitting(true);
            await deleteProject(projectId!, authState.accessToken!);
            navigate("/dashboard");
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Failed to delete project");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading project...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center text-red-500 dark:text-red-400">
                    <p>{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300">Project not found</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Project</h1>
                            {project.read_only && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-300">
                                    <FaBan className="mr-1" size={10} />
                                    Read Only
                                </span>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => navigate(`/projects/${projectId}`)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer"
                                title="Go to Project"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer"
                                title="Close"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Read-only Warning Banner */}
                {project.read_only && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-xl p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <FaBan className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Read-Only Project</h3>
                                <div className="mt-2 text-red-700 dark:text-red-200">
                                    <p>This project is currently in read-only mode because:</p>
                                    <ul className="list-disc list-inside mt-2 ml-4">
                                        <li>The premium subscription for this project has been canceled</li>
                                        <li>This project is using premium features (more than 5 team members)</li>
                                    </ul>
                                    <div className="mt-4 flex items-center">
                                        <FaUsers className="mr-2" />
                                        <p>To unlock editing, reduce the number of project members to 5 or fewer</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => navigate(`/projects/${projectId}`)}
                                        className="inline-flex cursor-pointer items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Return to Project
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className={`p-4 rounded-lg ${successMessage.includes("deleted")
                        ? "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50"
                        : "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        }`}>
                        <div className="flex items-center">
                            {successMessage.includes("deleted") ? (
                                <FaExclamationTriangle className="h-5 w-5 mr-2" />
                            ) : (
                                <FaCheck className="h-5 w-5 mr-2" />
                            )}
                            {successMessage}
                            {successMessage.includes("updated") && (
                                <button
                                    onClick={() => navigate(`/projects/${projectId}`)}
                                    className="ml-auto px-3 cursor-pointer py-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white text-sm rounded transition-colors duration-200"
                                >
                                    View Project
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Project Settings Card */}
                <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200 ${project.read_only ? 'opacity-70' : ''}`}>
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Project Settings</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
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
                                disabled={project.read_only}
                                className={`block w-full px-4 py-2 border ${fieldErrors.name
                                    ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                    } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${project.read_only ? 'cursor-not-allowed bg-gray-50 dark:bg-gray-700/50' : ''}`}
                                placeholder="Project name"
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
                                disabled={project.read_only}
                                className={`block w-full px-4 py-2 border ${fieldErrors.description
                                    ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                    } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${project.read_only ? 'cursor-not-allowed bg-gray-50 dark:bg-gray-700/50' : ''}`}
                                placeholder="Describe your project..."
                            />
                            {fieldErrors.description && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.description}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || project.read_only}
                                className={`px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center ${isSubmitting || project.read_only
                                    ? 'bg-indigo-400 dark:bg-indigo-600 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
                                    } transition-colors duration-200`}
                                title={project.read_only ? "Project is read-only" : ""}
                            >
                                <FaSave className="mr-2" />
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Danger Zone Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200 border border-red-200 dark:border-red-900/50">
                    <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10">
                        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center">
                            <FaExclamationTriangle className="mr-2" />
                            Danger Zone
                        </h2>
                    </div>

                    <div className="px-6 py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-4 md:mb-0">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100">Delete this project</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Once you delete a project, there is no going back. Please be certain.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirmation(!showDeleteConfirmation)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg font-medium cursor-pointer transition-colors duration-200 flex items-center justify-center"
                            >
                                <FaTrash className="mr-2" />
                                Delete Project
                            </button>
                        </div>

                        {/* Confirmation Area */}
                        {showDeleteConfirmation && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/50">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    To confirm deletion, type the project name below:
                                </p>
                                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                                    <input
                                        type="text"
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        placeholder={`Type "${project?.name}" to confirm`}
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    />
                                    <button
                                        onClick={handleDeleteProject}
                                        disabled={deleteConfirmation !== project?.name || isSubmitting}
                                        className={`px-4 py-2 rounded-lg font-medium text-white flex items-center justify-center ${deleteConfirmation !== project?.name || isSubmitting
                                            ? 'bg-red-400 dark:bg-red-800 cursor-not-allowed opacity-70'
                                            : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 cursor-pointer dark:hover:bg-red-800'
                                            } transition-colors duration-200`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Deleting...
                                            </>
                                        ) : (
                                            'Confirm Delete'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};