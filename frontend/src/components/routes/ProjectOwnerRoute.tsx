import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useProject } from "../../hooks/useProjectInit";

export const ProtectedProjectForOwner = () => {
    const { isAuthenticated } = useAuth();
    const { projectId } = useParams<{ projectId: string }>();
    const { isOwner, loading } = useProject(projectId || '');

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // show loading screen until project is loaded
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading project...</p>
                </div>
            </div>
        )
    }

    // redirect to dashboard if user is not the owner
    if (!isOwner) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}