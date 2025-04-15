import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    FaTasks,
    FaUsers,
    FaPlus,
    FaSearch,
    FaFilter,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaEllipsisV,
    FaEdit,
    FaArrowLeft,
    FaUserPlus,
    FaRegComment,
    FaPaperclip,
    FaUserMinus,
    FaTimes
} from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { fetchProjectById, getProjectMembers, deleteMemberFromProject } from "../../../services/projectService";
import { AddMemberDialog } from "./AddMemberModal";
import ProjectMember from "../../../types/projectMember";

export const ProjectPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("tasks");
    const [showAddMember, setShowAddMember] = useState(false);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState<string | null>(null);


    useEffect(() => {
        const loadProject = async () => {
            try {
                setLoading(true);
                const projectData = await fetchProjectById(projectId!, authState.accessToken!);
                setProject(projectData);
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

    useEffect(() => {
        const loadMembers = async () => {
            if (projectId && authState.accessToken && activeTab === "members") {
                try {
                    setMembersLoading(true);
                    setMembersError(null);
                    const membersData = await getProjectMembers(projectId, authState.accessToken);

                    console.log(membersData);

                    // Destructure the response into members and pending members array
                    const [members = [], pending = []] = membersData;

                    // Transform active members
                    const transformedMembers = members.map((member: any) => {
                        // Extract user details from the nested user object
                        const userDetails = member.user || {};

                        return {
                            id: member.user_id,
                            name: userDetails.name || 'Unknown User',
                            role: member.role,
                            status: 'active',
                            email: userDetails.email,
                            joined_at: member.joined_at,
                        };
                    }).filter((member: ProjectMember) => member.id !== authState.user?.id); // Filter out current user

                    const transformedPendingMembers = pending
                        .filter((member: ProjectMember) => member.id !== authState.user?.id)
                        .map((member: ProjectMember) => ({
                            id: member.id,
                            name: member?.name || member.email.split('@')[0],
                            role: member.role,
                            status: 'pending',
                            email: member?.email,
                            joined_at: member.joined_at
                        }))


                    const allMembers = [...transformedMembers, ...transformedPendingMembers];

                    setMembers(allMembers);
                } catch (err) {
                    setMembersError("Failed to load project members");
                    console.error(err);
                } finally {
                    setMembersLoading(false);
                }
            }
        };

        loadMembers();
    }, [projectId, authState.accessToken, activeTab, authState.user?.id]);

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
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                        <FaCheckCircle className="mr-1.5" />
                        Completed
                    </span>
                );
            case "in-progress":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                        <FaClock className="mr-1.5" />
                        In Progress
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        <FaExclamationTriangle className="mr-1.5" />
                        Not Started
                    </span>
                );
        }
    };

    // Function to refresh the project members
    const refreshMembers = async () => {
        if (projectId && authState.accessToken) {
            try {
                setMembersLoading(true);
                setMembersError(null);
                const membersData = await getProjectMembers(projectId, authState.accessToken);
                const [registeredMembers = [], invitedMembers = []] = membersData;
                const transformedMembers = registeredMembers.map((member: any) => {
                    const userDetails = member.user || {};
                    return {
                        id: member.user_id,
                        name: userDetails.name || 'Unknown User',
                        role: member.role,
                        status: 'active',
                        email: userDetails.email,
                        joined_at: member.joined_at,
                    };
                }).filter((member: ProjectMember) => member.id !== authState.user?.id);

                const transformedPendingMembers = invitedMembers
                    .filter((member: ProjectMember) => member.id !== authState.user?.id)
                    .map((member: ProjectMember) => ({
                        id: member.id,
                        name: member?.name || member.email.split('@')[0],
                        role: member.role,
                        status: 'pending',
                        email: member?.email,
                        joined_at: member.joined_at
                    }));

                setMembers([...transformedMembers, ...transformedPendingMembers]);
            } catch (err) {
                setMembersError("Failed to load project members");
                console.error(err);
            } finally {
                setMembersLoading(false);
            }
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            await deleteMemberFromProject(projectId!, memberId, authState.user.id, authState.accessToken!);

            // Update the members state by filtering out the removed member
            setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Project Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer"
                            >
                                <FaArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="flex items-center space-x-3">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {project.name}
                                    </h1>
                                    {getStatusBadge(project.status)}
                                </div>
                                <p className="mt-1 text-gray-600 dark:text-gray-300">
                                    {project.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowAddMember(true)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 cursor-pointer dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center"
                            >
                                <FaUserPlus className="mr-2" />
                                Add Member
                            </button>
                            <Link
                                to={`/projects/${projectId}/edit`}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200 flex items-center"
                            >
                                <FaEdit className="mr-2" />
                                Edit
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Project Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Tasks */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                    {project.total_tasks || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                                <FaTasks className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Completed Tasks */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Tasks</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                    {project.completed_tasks || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                                <FaCheckCircle className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                    {project.progress || 0}%
                                </p>
                            </div>
                            <div className="w-16">
                                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600 dark:bg-indigo-500"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Members */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                    {project.members || 1}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                                <FaUsers className="text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("tasks")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === "tasks" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"}`}
                        >
                            Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab("members")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === "members" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"}`}
                        >
                            Members
                        </button>
                        <button
                            onClick={() => setActiveTab("discussions")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === "discussions" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"}`}
                        >
                            Discussions
                        </button>
                        <button
                            onClick={() => setActiveTab("files")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === "files" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"}`}
                        >
                            Files
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200">
                    {activeTab === "tasks" && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h2>
                                <button className="px-4 py-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center">
                                    <FaPlus className="mr-2" />
                                    New Task
                                </button>
                            </div>

                            {/* Task Filters */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
                                <div className="relative w-full sm:w-64">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Search tasks..."
                                    />
                                </div>
                                <button className="px-4 py-2 border cursor-pointer border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center">
                                    <FaFilter className="mr-2" />
                                    Filter
                                </button>
                            </div>

                            {/* Task List */}
                            <div className="space-y-4">
                                {[1, 2, 3].map((task) => (
                                    <div key={task} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <input
                                                    type="checkbox"
                                                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:bg-gray-700 focus:ring-indigo-500 mt-1"
                                                />
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                        Task {task} - Implement new feature
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        Assigned to John Doe · Due in 3 days
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
                                                <FaEllipsisV />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "members" && (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Team Members</h2>
                                <button
                                    onClick={() => setShowAddMember(true)}
                                    className="px-4 py-2 bg-indigo-600 cursor-pointer hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center"
                                >
                                    <FaUserPlus className="mr-2" />
                                    Add Member
                                </button>
                            </div>

                            {/* Loading state */}
                            {membersLoading && (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            )}

                            {/* Error state */}
                            {membersError && (
                                <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4">
                                    {membersError}
                                </div>
                            )}

                            {/* Members List */}
                            <div className="space-y-4">
                                {/* Owner section - only show if the current user is the owner */}
                                {project.owner_id === authState.user?.id && (
                                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                                                    {authState.user?.name ? (
                                                        authState.user.name
                                                            .split(' ')
                                                            .map((n: string) => n[0])
                                                            .join('')
                                                            .toUpperCase()
                                                    ) : 'US'}
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
                                            <span className="mr-1">Owner</span>
                                        </span>
                                    </div>
                                )}

                                {/* Other Members */}
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                                    {member?.name ? (
                                                        member.name
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                            .toUpperCase()
                                                    ) : 'US'}
                                                </div>
                                                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ${member.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                                                    } ring-2 ring-white dark:ring-gray-800`}></span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {member.role === 'admin' ? 'Admin' : 'Member'}
                                                </p>
                                                {member.status === 'pending' && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                                        Pending Invitation
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {member.status === 'pending' ? (
                                            <div className="flex space-x-2">
                                                <button
                                                    className="p-2 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    onClick={() => {

                                                    }}
                                                    title="Resend invitation"
                                                >
                                                    <FaUserPlus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-2 text-red-400 cursor-pointer hover:text-red-600 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => {
                                                        handleRemoveMember(member.id)
                                                    }}
                                                    title="Cancel invitation"
                                                >
                                                    <FaTimes className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="p-2 text-red-500 hover:text-red-700 cursor-pointer dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => handleRemoveMember(member.id)}
                                                title="Remove member"
                                            >
                                                <FaUserMinus className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "discussions" && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Discussions</h2>

                            {/* New Discussion */}
                            <div className="mb-6">
                                <div className="flex space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                                            {authState.user?.name
                                                .split(' ')
                                                .map((n: string) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <form>
                                            <div>
                                                <label htmlFor="comment" className="sr-only">Comment</label>
                                                <textarea
                                                    id="comment"
                                                    name="comment"
                                                    rows={3}
                                                    className="shadow-sm py-2 px-4 block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                                    placeholder="Start a discussion..."
                                                    defaultValue={''}
                                                />
                                            </div>
                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        type="button"
                                                        className="p-2 text-gray-400 cursor-pointer hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        <FaPaperclip className="h-5 w-5" />
                                                        <span className="sr-only">Attach file</span>
                                                    </button>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center cursor-pointer px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    <FaRegComment className="mr-2" />
                                                    Comment
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Discussion List */}
                            <div className="space-y-6">
                                {[1, 2].map((discussion) => (
                                    <div key={discussion} className="flex space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                                {['JD', 'SJ'][discussion - 1]}
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {['John Doe', 'Sarah Johnson'][discussion - 1]}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {['2 hours ago', '1 day ago'][discussion - 1]}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                                    {discussion === 1
                                                        ? "I've completed the initial design mockups for the homepage. Let me know what you think!"
                                                        : "The API endpoints for the user dashboard are now ready for frontend integration."}
                                                </p>
                                                <div className="mt-3 flex items-center space-x-3">
                                                    <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                                        Reply
                                                    </button>
                                                    <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                                        Like
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "files" && (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Files</h2>

                            {/* File Upload */}
                            <div className="mb-6">
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-200">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOCX, XLSX, JPG, PNG (MAX. 10MB)</p>
                                        </div>
                                        <input id="dropzone-file" type="file" className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* Files List */}
                            <div className="space-y-4">
                                {[1, 2, 3].map((file) => (
                                    <div key={file} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
                                                <FaPaperclip className="text-xl" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {['Project_Brief.pdf', 'Design_Mockups.zip', 'User_Research.docx'][file - 1]}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {['2.4 MB', '5.7 MB', '1.2 MB'][file - 1]} · Uploaded by {['John Doe', 'Sarah Johnson', 'Michael Chen'][file - 1]} · {['2 days ago', '1 week ago', '3 weeks ago'][file - 1]}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                            <FaEllipsisV />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Add Member Modal */}
            {showAddMember && project && (
                <AddMemberDialog
                    project={project}
                    onClose={() => setShowAddMember(false)}
                    onInvite={async () => {
                        await refreshMembers();
                    }}
                />
            )}
        </div>
    );
};