import { Request, Response } from "express";
import { NextFunction } from "connect";
import { addMilestoneToTaskQuery, createMilestoneQuery, deleteMilestoneFromTaskQuery, deleteMilestoneQuery, getAllMilestonesForProjectQuery, getAllTaskForMilestoneWithSubtasksQuery, getAllUnassignedTaskForMilestoneQuery, getMilestoneByIdQuery, recalculateAllTasksInMilestoneQuery, recalculateCompletedTasksInMilestoneQuery, updateMilestoneQuery } from "../models/milestonesModel";
import { getParentTaskForSubtaskQuery, getSubtasksForTaskQuery, getTaskByIdQuery } from "../models/task.Model";
import { getLabelsForTaskQuery } from "../models/labelModel";
import { getProjectByIdQuery } from "../models/projectModel";
import { DEFAULT_COLORS } from "../utils/default-colors";
import { Project } from "../schemas/types/projectTyoe";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const createMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const project_id = req.params.projectId;
        const { name, description, due_date, color } = req.body;

        const project: Project = await getProjectByIdQuery(project_id);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const existingMilestones = await getAllMilestonesForProjectQuery(project_id);

        const milestoneNameExists = existingMilestones.some((m: any) => m.name.toLowerCase() === name.toLowerCase());
        if (milestoneNameExists) {
            handleResponse(res, 400, "Milestone name already exists", null);
            return;
        }

        let selectedColor = '';
        if (color === '') {
            // Get existing milestone colors in the project
            const usedColors = new Set(existingMilestones.map((m: any) => m.color));

            // Filter available colors
            const availableColors = DEFAULT_COLORS.filter(c => !usedColors.has(c.color));

            // Select a color
            selectedColor = availableColors.length > 0
                ? availableColors[Math.floor(Math.random() * availableColors.length)].color
                : DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)].color;
        } else {
            selectedColor = color;
        }

        const uppercasedName = name.charAt(0).toUpperCase() + name.slice(1);
        const newMilestone = await createMilestoneQuery(project_id, uppercasedName, description, due_date, selectedColor);
        handleResponse(res, 201, "Milestone created successfully", newMilestone);
    } catch (error: Error | any) {
        // Check for unique constraint violation (duplicate email)
        if (error.code === "23505") {
            handleResponse(res, 409, "Milestone already exists", null);
        } else {
            // Pass other errors to the next middleware (errorHandling middleware)
            next(error);
        }
    }
}

export const getAllMilestonesForProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const milestones = await getAllMilestonesForProjectQuery(req.params.projectId);
        handleResponse(res, 200, "Milestones fetched successfully", milestones);
    } catch (error) {
        next(error);
    }
}

export const getMilestoneById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const milestone = await getMilestoneByIdQuery(req.params.milestoneId);
        handleResponse(res, 200, "Milestone fetched successfully", milestone);
    } catch (error) {
        next(error);
    }
}

export const addMilestoneToTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { taskIds } = req.body;
        const milestone_id = req.params.milestoneId;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const updatedTasks = [];
        for (const taskId of taskIds) {
            const updateTask = await addMilestoneToTaskQuery(taskId, milestone_id);
            if (!updateTask) {
                handleResponse(res, 404, "Task not found", null);
                return;
            }

            const subtasks = await getSubtasksForTaskQuery(taskId);
            for (const subtask of subtasks) {
                await addMilestoneToTaskQuery(subtask.subtask_id, milestone_id);
            }

            await recalculateAllTasksInMilestoneQuery(projectId, milestone_id)
            await recalculateCompletedTasksInMilestoneQuery(projectId, milestone_id)
            updatedTasks.push(updateTask);
        }


        handleResponse(res, 200, "Task updated successfully", updatedTasks);
    } catch (error) {
        next(error);
    }
}

export const getAllTaskForMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const milestone_id = req.params.milestoneId;
        const tasks = await getAllTaskForMilestoneWithSubtasksQuery(projectId, 'priority', 'asc', milestone_id);

        for (const task of tasks) {
            const taskLabels = await getLabelsForTaskQuery(task.id);
            task.labels = taskLabels;

            task.parent_task_id = await getParentTaskForSubtaskQuery(task.id) || null;
            if (task.parent_task_id) {
                const parentTask = await getTaskByIdQuery(task.parent_task_id) || null;
                task.parent_task_name = parentTask.title || null;
            }
        }
        handleResponse(res, 200, "Tasks fetched successfully", tasks);
    } catch (error) {
        next(error);
    }
}

export const getAllUnassignedTaskForMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const tasks = await getAllUnassignedTaskForMilestoneQuery(projectId, 'priority', 'asc');

        for (const task of tasks) {
            const taskLabels = await getLabelsForTaskQuery(task.id);
            task.labels = taskLabels;
        }
        handleResponse(res, 200, "Tasks fetched successfully", tasks);
    } catch (error) {
        next(error);
    }
}

export const deleteMilestoneFromTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const milestone_id = req.params.milestoneId;
        const taskId = req.body.taskId;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const task = await getTaskByIdQuery(taskId);
        if (!task) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }

        if (task.parent_task_id) {
            handleResponse(res, 400, "Task is a subtask", null);
            return;
        }

        const subtasks = await getSubtasksForTaskQuery(taskId);
        for (const subtask of subtasks) {
            await deleteMilestoneFromTaskQuery(subtask.subtask_id);
        }

        await deleteMilestoneFromTaskQuery(taskId);

        await recalculateAllTasksInMilestoneQuery(projectId, milestone_id)
        await recalculateCompletedTasksInMilestoneQuery(projectId, milestone_id)
        handleResponse(res, 200, "Milestone removed from task successfully", null);
    } catch (error) {
        next(error);
    }
}

const datesEqual = (date1: any, date2: any) => {
    if (!date1 && !date2) return true; // Both are falsy (null, undefined, '')
    if (!date1 || !date2) return false; // Only one is falsy

    // Compare as ISO strings if both are valid dates
    return new Date(date1).toISOString() === new Date(date2).toISOString();
}


export const updateMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const milestone_id = req.params.milestoneId;
        const projectId = req.params.projectId;
        const { name, description, due_date, color } = req.body;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const oldMilestone = await getMilestoneByIdQuery(milestone_id);
        if (!oldMilestone) {
            handleResponse(res, 404, "Milestone not found", null);
            return;
        }

        const existingMilestones = await getAllMilestonesForProjectQuery(projectId);

        const milestoneNameExists = existingMilestones.some((m: any) => m.name.toLowerCase() === name.toLowerCase() && m.id !== oldMilestone.id);
        if (milestoneNameExists) {
            handleResponse(res, 400, "Milestone name already exists", null);
            return;
        }

        if (oldMilestone.name === name && oldMilestone.description === description && datesEqual(oldMilestone.due_date, due_date) && oldMilestone.color === color) {
            handleResponse(res, 200, "No changes detected", oldMilestone);
            return;
        }

        const uppercasedName = name.charAt(0).toUpperCase() + name.slice(1);
        const updatedMilestone = await updateMilestoneQuery(milestone_id, uppercasedName, description, due_date, color);

        updatedMilestone.labels = await getLabelsForTaskQuery(updatedMilestone.id)
        handleResponse(res, 200, "Milestone updated successfully", updatedMilestone);

    } catch (error) {
        next(error);
    }
}

export const deleteMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const milestoneId = req.params.milestoneId;
        const projectId = req.params.projectId;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        await deleteMilestoneQuery(milestoneId);
        handleResponse(res, 200, "Milestone deleted successfully", null);
    } catch (error) {
        next(error);
    }
}