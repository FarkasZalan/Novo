import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { useProjectPermissions } from "../../hooks/useProjectPermissionForTaskInit";
import { useAuth } from "../../hooks/useAuth";
import { FaBan, FaUsers } from "react-icons/fa";

export const TaskEditReadOnlyRoute = () => {
    const { isAuthenticated, authState } = useAuth();
    const { projectId } = useParams<{ projectId: string }>();
    const { isOwner, isAdmin, loading, project } = useProjectPermissions(projectId || '');
    const navigate = useNavigate();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Show loading screen until permissions are checked
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    // If project is read-only, show the warning message instead of the outlet
    if (project?.read_only) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-xl p-6 mb-6">
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

                                    {authState.user?.id === project.owner_id ? (
                                        <div className="mt-4 flex items-center">
                                            <FaUsers className="mr-2" />
                                            <p>To unlock task management, reduce the number of project members to 5 or fewer or renew your subscription</p>
                                        </div>
                                    ) : (
                                        <div className="mt-4 flex items-center">
                                            <FaUsers className="mr-2" />
                                            <p>Contact the project owner to unlock task management</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* back button */}
                    <div className="mb-4 flex justify-center">
                        <button
                            onClick={() => navigate(`/projects/${projectId}`, { replace: true })}
                            className="flex items-center px-4 py-2.5 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                        >
                            Go To Project
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Redirect to dashboard if user is neither owner nor admin
    if (!isOwner && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};