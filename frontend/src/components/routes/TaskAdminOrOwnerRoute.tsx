import { Navigate, Outlet, useParams } from "react-router-dom";
import { useProjectPermissions } from "../../hooks/useProjectPermissionForTaskInit";
import { useAuth } from "../../hooks/useAuth";

export const ProtectedProjectForTaskManagement = () => {
    const { isAuthenticated } = useAuth();
    const { projectId } = useParams<{ projectId: string }>();
    const { isOwner, isAdmin, loading } = useProjectPermissions(projectId || '');

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

    // Redirect to dashboard if user is neither owner nor admin
    if (!isOwner && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};