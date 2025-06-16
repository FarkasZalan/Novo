import { Link, useNavigate } from "react-router-dom";
import {
    FaTasks,
    FaProjectDiagram,
    FaUsers,
    FaPlus,
    FaSearch,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaCog,
    FaSignOutAlt,
    FaPaperclip,
    FaBan,
    FaExclamationCircle
} from "react-icons/fa";
import { useEffect, useState } from "react";
import { fetchProjects } from "../../../services/projectService";
import { ConfirmationDialog } from "./ConfirmationDialog";
import toast from "react-hot-toast";
import { leaveProject } from "../../../services/projectMemberService";
import { useAuth } from "../../../hooks/useAuth";
import { DashboardLogsComponent } from "./DashboardLogs";

export const Dashboard = () => {
    const { authState } = useAuth();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [projectToLeave, setProjectToLeave] = useState<string | null>(null);


    useEffect(() => {
        const loadProjects = async () => {
            try {
                setLoading(true);
                const projects: Project[] = await fetchProjects(authState.accessToken!);

                setProjects(projects);
            } catch (err) {
                setError("Failed to load projects");
            } finally {
                setLoading(false);
            }
        };

        if (authState.accessToken) {
            loadProjects();
        }
    }, [authState.accessToken]);

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "all" ||
            (activeTab === "in-progress" && project.status === "in-progress") ||
            (activeTab === "completed" && project.status === "completed") ||
            (activeTab === "not-started" && project.status === "not-started");
        return matchesSearch && matchesTab;
    });

    const stats = {
        totalProjects: projects.length,
        inProgress: projects.filter(p => p.status === "in-progress").length,
        completed: projects.filter(p => p.status === "completed").length
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <FaCheckCircle className="text-green-500" />;
            case "in-progress":
                return <FaClock className="text-yellow-500" />;
            case "not-started":
                return <FaExclamationTriangle className="text-gray-400" />;
            default:
                return null;
        }
    };

    // Function to check if the current user is the project owner
    const isProjectOwner = (project: Project) => {
        return project.owner_id === authState.user?.id;
    };

    const handleLeaveProject = async () => {
        if (!projectToLeave || !authState.user?.id) return;

        try {
            await leaveProject(projectToLeave, authState.user.id, authState.user.id, authState.accessToken!);

            // Refresh the projects list
            const updatedProjects = await fetchProjects(authState.accessToken!);
            setProjects(updatedProjects);
            setShowLeaveConfirm(false);
        } catch (err) {
            toast.error("Failed to leave project");
        }
    };

    // Function to render appropriate action buttons based on ownership
    const renderActionButtons = (project: Project) => {
        if (isProjectOwner(project)) {
            return (
                <button
                    // the e.stopPropagation() is denying the click event from the parent element
                    // so on hover and click to the settings button it will not redirect to the project page instead go to edit the project if have permission
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/edit`);
                    }}
                    className="p-2 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Edit project"
                >
                    <FaCog className="w-5 h-5" />
                </button>
            );
        } else {
            return (
                <button
                    className="p-2 rounded-full text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        setProjectToLeave(project.id!);
                        setShowLeaveConfirm(true);
                    }}
                    aria-label="Leave project"
                >
                    <FaSignOutAlt className="w-5 h-5" />
                </button>
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading projects...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-w-md w-full p-6 text-center">
                    <FaExclamationCircle className="mx-auto text-red-500 text-5xl mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Oops! Couldn’t load projects
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Something went wrong while fetching your projects. Please try again.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center cursor-pointer justify-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium rounded-lg shadow-sm transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Dashboard Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col items-center text-center md:text-left md:flex-row md:justify-between md:items-center">
                        <div className="mb-4 md:mb-0">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">
                                Welcome back, <span className="font-medium text-indigo-600 dark:text-indigo-400">{authState.user?.name}</span>!
                            </p>
                        </div>
                        <Link
                            to="/new"
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center"
                        >
                            <FaPlus className="mr-2" />
                            New Project
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Total Projects */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.totalProjects}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                                <FaProjectDiagram className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.inProgress}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300">
                                <FaClock className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.completed}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                                <FaCheckCircle className="text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200">
                    {/* Projects Header */}
                    <div className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
                        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Your Projects</h2>

                            {/* Search - Full width on mobile */}
                            <div className="relative w-full sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400 text-sm" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs - Horizontal scroll on mobile */}
                    <div className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
                        <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`flex-shrink-0 whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm cursor-pointer ${activeTab === "all"
                                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                            >
                                All Projects
                            </button>
                            <button
                                onClick={() => setActiveTab("in-progress")}
                                className={`flex-shrink-0 whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm cursor-pointer ${activeTab === "in-progress"
                                    ? "border-yellow-500 text-yellow-600 dark:text-yellow-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                            >
                                In Progress
                            </button>
                            <button
                                onClick={() => setActiveTab("completed")}
                                className={`flex-shrink-0 whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm cursor-pointer ${activeTab === "completed"
                                    ? "border-green-500 text-green-600 dark:text-green-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setActiveTab("not-started")}
                                className={`flex-shrink-0 whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm cursor-pointer ${activeTab === "not-started"
                                    ? "border-gray-500 text-gray-600 dark:text-gray-400"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                            >
                                Not Started
                            </button>
                        </nav>
                    </div>

                    {/* Projects List */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    <div className="space-y-3">
                                        {/* Project Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {project.name}
                                                    </h3>
                                                    <span className="inline-flex items-center flex-shrink-0">
                                                        {getStatusIcon(project.status)}
                                                    </span>
                                                    {!isProjectOwner(project) && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 flex-shrink-0">
                                                            Member
                                                        </span>
                                                    )}
                                                    {project.read_only && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-300 flex-shrink-0">
                                                            <FaBan className="mr-1" size={8} />
                                                            Read Only
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 sm:truncate">
                                                    {project.description}
                                                </p>
                                            </div>

                                            {/* Action Button - Mobile positioned at top right */}
                                            <div className="ml-2 flex-shrink-0 sm:hidden">
                                                {renderActionButtons(project)}
                                            </div>
                                        </div>

                                        {/* Project Stats - Stacked on mobile, inline on larger screens */}
                                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center">
                                                    <FaUsers className="mr-1.5 text-xs" />
                                                    <span>{project.memberCount} members</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <FaTasks className="mr-1.5 text-xs" />
                                                    <span>{project.completed_tasks}/{project.total_tasks} tasks</span>
                                                </div>
                                                {project.attachments_count > 0 && (
                                                    <div className="flex items-center">
                                                        <FaPaperclip className="mr-1.5 text-xs" />
                                                        <span>{project.attachments_count} files</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Progress Bar and Action Button - Bottom section */}
                                            <div className="flex items-center justify-between sm:justify-end space-x-4">
                                                {/* Progress Bar - Wider on mobile */}
                                                <div className="flex-1 sm:flex-initial sm:w-32">
                                                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                                                            style={{
                                                                width: `${project.total_tasks ? Math.round((project.completed_tasks! / project.total_tasks) * 100) : 0}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="mt-1 text-xs text-center text-gray-500 dark:text-gray-400">
                                                        {project.total_tasks ? Math.round((project.completed_tasks! / project.total_tasks) * 100) : 0}% complete
                                                    </p>
                                                </div>

                                                {/* Action Button - Hidden on mobile, shown on larger screens */}
                                                <div className="hidden sm:block flex-shrink-0">
                                                    {renderActionButtons(project)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 sm:px-6 py-12 text-center">
                                <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
                                    <FaProjectDiagram className="w-full h-full" />
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No projects found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 px-4">
                                    {searchQuery ? "Try a different search term" : "Get started by creating a new project"}
                                </p>
                                <div className="mt-6">
                                    <Link
                                        to="/new"
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                    >
                                        <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                                        New Project
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        <DashboardLogsComponent />
                    </div>
                </div>
            </main>

            <ConfirmationDialog
                isOpen={showLeaveConfirm}
                onClose={() =>
                    toast.success('You left the project successfully!') &&
                    setShowLeaveConfirm(false)}
                onConfirm={handleLeaveProject}
                title="Leave Project?"
                message="Are you sure you want to leave this project? You won't be able to access it unless you're invited again."
                confirmText="Leave Project"
                confirmColor="red"
            />
        </div>
    );
};