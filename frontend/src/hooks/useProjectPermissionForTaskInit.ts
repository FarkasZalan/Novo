import { useEffect, useState } from "react";
import { fetchProjectById } from "../services/projectService";
import { getProjectMembers } from "../services/projectMemberService";
import { useAuth } from "../context/AuthContext";

// for task managemenet (create, edit)
export const useProjectPermissions = (projectId: string) => {
    const [isOwner, setIsOwner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const { authState } = useAuth();

    useEffect(() => {
        if (!projectId) return;

        const checkPermissions = async () => {
            try {
                setLoading(true);
                // Reset states
                setIsOwner(false);
                setIsAdmin(false);

                // Check if user is owner
                const project = await fetchProjectById(projectId, authState.accessToken!);
                if (project.owner_id === authState.user?.id) {
                    setIsOwner(true);
                    setIsAdmin(true); // Owner has all admin privileges
                    setLoading(false);
                    return;
                }

                // Check if user is admin
                const members = await getProjectMembers(projectId, authState.accessToken!);
                const [activeMembers = []] = members;
                const currentUserMember = activeMembers.find(
                    (member: any) => member.user_id === authState.user?.id
                );

                if (currentUserMember && currentUserMember.role === "admin") {
                    setIsAdmin(true);
                }
            } catch (err) {
                console.error("Error checking project permissions:", err);
            } finally {
                setLoading(false);
            }
        };

        checkPermissions();
    }, [projectId, authState.accessToken]);

    return { isOwner, isAdmin, loading };
};