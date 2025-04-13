import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaSave,
    FaTimes,
    FaTrash,
    FaExclamationTriangle,
    FaLock,
    FaUserPlus,
    FaUserMinus,
    FaCheck,
    FaSearch
} from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { updateProject, deleteProject, fetchProjectById } from "../../../services/projectService";
import { fetchAllRegisteredUsers } from "../../../services/userService";

interface Project {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    status: string;
    progress: number;
    members: number;
}

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

    const [showAddMemberSection, setShowAddMemberSection] = useState(false);
    const [searchMemberQuery, setSearchMemberQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState<"member" | "admin">("member");
    const [potentialMembers, setPotentialMembers] = useState<
        { id: string; name: string; email: string }[]
    >([]);

    // Fetch registered users when component mounts
    useEffect(() => {
        const loadRegisteredUsers = async () => {
            try {
                const users = await fetchAllRegisteredUsers();

                const formattedUsers = users.map((user: any) => ({
                    id: user.id,
                    name: user.name,
                    email: user.email
                }));

                setPotentialMembers(formattedUsers);
            } catch (err) {
                console.error("Failed to load users:", err);
            }
        };

        loadRegisteredUsers();
    }, []);

    const handleAddMember = (memberId: string) => {
        // API call to add member would go here
        console.log(`Added member ${memberId} as ${selectedRole}`);
        setSearchMemberQuery("");
        setShowAddMemberSection(false);
    };

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
                projectId!, // ! - non null
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
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Project</h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                Update your project details and settings
                            </p>
                        </div>
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
                                    className="ml-auto px-3 py-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white text-sm rounded transition-colors duration-200"
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
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200">
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
                                className={`block w-full px-4 py-2 border ${fieldErrors.name
                                    ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                    } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
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
                                className={`block w-full px-4 py-2 border ${fieldErrors.description
                                    ? "border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                    } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
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
                                disabled={isSubmitting}
                                className={`px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center cursor-pointer ${isSubmitting
                                    ? 'bg-indigo-400 dark:bg-indigo-600 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
                                    } transition-colors duration-200`}
                            >
                                <FaSave className="mr-2" />
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Project Members Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Project Members</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {project.members} member{project.members !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center cursor-pointer ${showAddMemberSection
                                ? "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                                : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white"
                                }`}
                            onClick={() => setShowAddMemberSection(!showAddMemberSection)}
                        >
                            <FaUserPlus className="mr-2" />
                            {showAddMemberSection ? "Cancel" : "Add Member"}
                        </button>
                    </div>

                    {/* Add Member Section */}
                    {showAddMemberSection && (
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Invite to Project</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Search for existing users or invite new members by email
                                    </p>

                                    {/* Search Input */}
                                    <div className="relative mb-4">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaSearch className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Search by name or email"
                                            value={searchMemberQuery}
                                            onChange={(e) => setSearchMemberQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* Role Selection */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Role
                                        </label>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setSelectedRole("admin")}
                                                className={`flex-1 py-2 rounded-lg border cursor-pointer ${selectedRole === "admin"
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-100"
                                                    : "border-gray-300 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    }`}
                                            >
                                                Admin
                                            </button>
                                            <button
                                                onClick={() => setSelectedRole("member")}
                                                className={`flex-1 py-2 rounded-lg border cursor-pointer ${selectedRole === "member"
                                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-100"
                                                    : "border-gray-300 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    }`}
                                            >
                                                Member
                                            </button>
                                        </div>
                                    </div>

                                    {/* Search Results or Invite Option */}
                                    {searchMemberQuery ? (
                                        <>
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Search Results
                                            </h4>
                                            {potentialMembers.filter(member =>
                                                member.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
                                                member.email.toLowerCase().includes(searchMemberQuery.toLowerCase())
                                            ).length > 0 ? (
                                                <div className="space-y-2 max-h-48 overflow-y-auto
                                                                scroll-custom
                                                                scrollbar-thin 
                                                                scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                                                                scrollbar-track-gray-100 dark:scrollbar-track-gray-800
                                                                scrollbar-thumb-rounded-full
                                                                transition-all duration-200">
                                                    {potentialMembers
                                                        .filter(member =>
                                                            member.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
                                                            member.email.toLowerCase().includes(searchMemberQuery.toLowerCase())
                                                        )
                                                        .map((member) => (
                                                            <div
                                                                key={member.id}
                                                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium text-sm">
                                                                        {member.name
                                                                            .split(' ')
                                                                            .map((name) => name.charAt(0))
                                                                            .join('')
                                                                            .toUpperCase()
                                                                        }
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                                                            {member.name}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            {member.email}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleAddMember(member.id)}
                                                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 cursor-pointer dark:hover:bg-indigo-800 text-white text-xs rounded-lg transition-colors duration-200"
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                        No users found
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                        The user you're looking for doesn't exist in our system yet.
                                                    </p>
                                                    <button
                                                        onClick={() => console.log(`Send invite to ${searchMemberQuery}`)}
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white text-sm rounded-lg transition-colors duration-200 flex items-center mx-auto"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        Send Invitation Email
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-6">
                                            <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                Search for members
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Start typing to search for existing users
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Existing Members List */}
                    <div className="px-6 py-4 divide-y divide-gray-200 dark:divide-gray-700">
                        {/* Owner */}
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                                        {authState.user?.name
                                            .split(' ')          // Split full name into array of words ['John', 'Doe']
                                            .map((n: string) => n[0]) // Get first letter of each word ['J', "D']
                                            .join('')            // Combine letters 'JD'
                                            .toUpperCase()}
                                    </div>
                                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800"></span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {authState.user?.name} (You)
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Owner</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center">
                                <FaLock className="mr-1" /> Owner
                            </span>
                        </div>

                        {/* Sample Members */}
                        {[
                            { id: "2", name: "Sarah Johnson", email: "sarah@example.com", role: "Admin", status: "active" },
                            { id: "3", name: "Michael Chen", email: "michael@example.com", role: "Member", status: "pending" },
                        ].map((member) => (
                            <div key={member.id} className="flex items-center justify-between py-3">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                            {member.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </div>
                                        <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${member.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                                            } ring-2 ring-white dark:ring-gray-800`}></span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                                        {member.status === 'pending' && (
                                            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                                Pending Invitation
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                                    onClick={() => console.log(`Remove member ${member.id}`)}
                                >
                                    <FaUserMinus />
                                </button>
                            </div>
                        ))}
                    </div>
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