import { useEffect, useState } from "react";
import { fetchProjectById } from "../services/projectService";
import { useAuth } from "./useAuth";

export const useProject = (projectId: string) => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const { authState } = useAuth();

    useEffect(() => {
        if (!projectId) return;

        const fetchProject = async () => {
            try {
                const project = await fetchProjectById(projectId, authState.accessToken!);
                setProject(project);

                // Check if the current user is the project owner
                if (project.owner_id === authState.user?.id) {
                    setIsOwner(true);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    return { project, loading, isOwner };
};