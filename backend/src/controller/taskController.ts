import { Request, Response } from "express";
import { NextFunction } from "connect";
import { addSubtaskToTaskQuery, createTaskQuery, deleteTaskQuery, getAllTaskForProjectQuery, getAllTaskForProjectWithNoParentQuery, getCompletedTaskCountForProjectQuery, getInProgressTaskCountForProjectQuery, getParentTaskForSubtaskQuery, getSubtasksForTaskQuery, getTaskByIdQuery, getTaskCountForProjectQuery, updateTaskQuery, updateTaskStatusQuery } from "../models/task.Model";
import { getProjectByIdQuery, recalculateProjectStatus } from "../models/projectModel";
import { addMilestoneToTaskQuery, recalculateAllTasksInMilestoneQuery, recalculateCompletedTasksInMilestoneQuery } from "../models/milestonesModel";
import { addLabelToTaskQuery, deleteLabelFromTaskQuery, getLabelsForTaskQuery } from "../models/labelModel";
import { Label } from "../schemas/labelSchema";
import { sendTaskStatusChangeEmail } from "../services/emailService";
import { getAssignmentsForTaskQuery } from "../models/assignmentModel";
import { getUserByIdQuery } from "../models/userModel";
import { Project } from "../schemas/types/projectTyoe";
import { Task } from "../schemas/types/taskType";
import { User } from "../schemas/types/userType";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { title, description, due_date, priority, status, labels, parent_task_id } = req.body;

        const project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const newTask: Task = await createTaskQuery(title, description, projectId, due_date, priority, status, parent_task_id);

        if (newTask.milestone_id) {
            await recalculateAllTasksInMilestoneQuery(projectId, newTask.milestone_id)
            await recalculateCompletedTasksInMilestoneQuery(projectId, newTask.milestone_id)
        }

        for (const label of labels) {
            await addLabelToTaskQuery(newTask.id, label.id, projectId);
        }

        if (parent_task_id) {
            const parentTask = await getTaskByIdQuery(parent_task_id);
            await addSubtaskToTaskQuery(parent_task_id, newTask.id);
            await addMilestoneToTaskQuery(newTask.id, parentTask.milestone_id);
        }
        await recalculateProjectStatus(projectId);
        handleResponse(res, 201, "Task created successfully", newTask);
    } catch (error: Error | any) {
        // Check for unique constraint violation (duplicate email)
        if (error.code === "23505") {
            handleResponse(res, 409, "Task already exists", null);
        } else {
            // Pass other errors to the next middleware (errorHandling middleware)
            next(error);
        }
    }
};

export const getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const orderBy = typeof req.query.order_by === 'string' ? req.query.order_by : "updated_at";
        const order = typeof req.query.order === 'string' ? req.query.order : "desc";
        const tasks: Task[] = await getAllTaskForProjectQuery(projectId, orderBy, order); // get all tasks for the project;

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
};

export const getAllTasksWithNoParent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const orderBy = typeof req.query.order_by === 'string' ? req.query.order_by : "updated_at";
        const order = typeof req.query.order === 'string' ? req.query.order : "desc";
        const tasks: Task[] = await getAllTaskForProjectWithNoParentQuery(projectId, orderBy, order); // get all tasks for the project;

        for (const task of tasks) {
            const taskLabels = await getLabelsForTaskQuery(task.id);
            task.labels = taskLabels;
        }
        handleResponse(res, 200, "Tasks fetched successfully", tasks);
    } catch (error) {
        next(error);
    }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const task: Task = await getTaskByIdQuery(req.params.taskId);
        if (!task) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }

        const taskLabels: Label[] = await getLabelsForTaskQuery(task.id);
        task.labels = taskLabels;

        task.parent_task_id = await getParentTaskForSubtaskQuery(task.id) || null;
        if (task.parent_task_id) {
            const parentTask = await getTaskByIdQuery(task.parent_task_id) || null;
            task.parent_task_name = parentTask.title || null;
            task.parent_due_date = parentTask.due_date || null;
            task.parent_status = parentTask.status || null;
        }
        handleResponse(res, 200, "Task fetched successfully", task);
    } catch (error) {
        next(error);
    }
};

const datesEqual = (date1: any, date2: any) => {
    if (!date1 && !date2) return true; // Both are falsy (null, undefined, '')
    if (!date1 || !date2) return false; // Only one is falsy

    // Compare as ISO strings if both are valid dates
    return new Date(date1).toISOString() === new Date(date2).toISOString();
}

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { title, description, due_date, priority, status, labels } = req.body;
        const taskId = req.params.taskId;

        const project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const task: Task = await getTaskByIdQuery(taskId);
        if (!task) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }

        const taskLabels: Label[] = await getLabelsForTaskQuery(task.id);
        task.labels = taskLabels;

        if (task.title === title && task.description === description && datesEqual(task.due_date, due_date) && task.priority === priority && task.status === status) {
            let haveNewLabels = false;
            if (labels.length !== task.labels.length) {
                haveNewLabels = true;
            } else {
                for (const label of labels) {
                    if (!task.labels.find((newLabel: Label) => newLabel.id === label.id)) {
                        haveNewLabels = true;
                        break;
                    }
                }
            }

            if (!haveNewLabels) {
                handleResponse(res, 200, "No changes detected", task);
                return;
            }
        }

        const updateTask: Task = await updateTaskQuery(title, description, projectId, due_date, priority, taskId, status);

        if (status !== task.status) {
            const projectData = await getProjectByIdQuery(projectId);
            const assignedUsers = await getAssignmentsForTaskQuery(taskId);
            const currentUser = await getUserByIdQuery(req.user.id);
            for (const user of assignedUsers) {
                if (user.user_id === req.user.id) continue;
                sendTaskStatusChangeEmail(user.user_email, currentUser.name, currentUser.email, task.title, projectData.name, task.status, status, taskId, projectId);
            }
        }

        if (!updateTask) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }

        if (updateTask.milestone_id) {
            await recalculateAllTasksInMilestoneQuery(projectId, updateTask.milestone_id)
            await recalculateCompletedTasksInMilestoneQuery(projectId, updateTask.milestone_id)
        }

        // check if there are any labels to remove or add based on the new and existing labels
        const existingLabels: Label[] = await getLabelsForTaskQuery(updateTask.id);
        const existingLabelIds = existingLabels.map((label) => label.id);
        const newLabelsIds = labels.map((label: Label) => label.id);

        // remove labels if they are not in the new labels array
        for (const existingLabelId of existingLabelIds) {
            if (!newLabelsIds.includes(existingLabelId)) {
                await deleteLabelFromTaskQuery(updateTask.id, existingLabelId);
            }
        }

        // add labels if they are not in the existing labels array
        for (const newLabelId of newLabelsIds) {
            if (!existingLabelIds.includes(newLabelId)) {
                await addLabelToTaskQuery(updateTask.id, newLabelId, projectId);
            }
        }

        if (status === "completed") {
            const subtasks = await getSubtasksForTaskQuery(taskId);
            for (const subtask of subtasks) {
                await updateTaskStatusQuery("completed", subtask.subtask_id);
            }
        }

        await recalculateProjectStatus(projectId);

        const updatedTaskLabels = await getLabelsForTaskQuery(updateTask.id);
        updateTask.labels = updatedTaskLabels;
        handleResponse(res, 200, "Task updated successfully", updateTask);
    } catch (error) {
        next(error);
    }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const taskId = req.params.taskId;
        const { status } = req.body;

        const project: Project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const updateTask: Task = await updateTaskStatusQuery(status, taskId);
        if (!updateTask) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }

        if (status === "completed") {
            const subtasks = await getSubtasksForTaskQuery(taskId);
            for (const subtask of subtasks) {
                await updateTaskStatusQuery("completed", subtask.subtask_id);

                if (subtask.milestone_id) {
                    await recalculateAllTasksInMilestoneQuery(projectId, subtask.milestone_id)
                    await recalculateCompletedTasksInMilestoneQuery(projectId, subtask.milestone_id)
                }
            }
        }

        const assignedUsers = await getAssignmentsForTaskQuery(taskId);
        const currentUser: User = await getUserByIdQuery(req.user.id);
        for (const user of assignedUsers) {
            if (user.user_id === req.user.id) continue;
            sendTaskStatusChangeEmail(user.user_email, currentUser.name, currentUser.email, updateTask.title, project.name, updateTask.status, status, taskId, projectId);
        }

        if (updateTask.milestone_id) {
            await recalculateAllTasksInMilestoneQuery(projectId, updateTask.milestone_id)
            await recalculateCompletedTasksInMilestoneQuery(projectId, updateTask.milestone_id)
        }
        await recalculateProjectStatus(projectId);
        handleResponse(res, 200, "Task updated successfully", updateTask);
    } catch (error) {
        next(error);
    }
}

export const getTaskCountForProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const taskCount = await getTaskCountForProjectQuery(projectId);
        const completedTaskCount = await getCompletedTaskCountForProjectQuery(projectId);
        const inProgressTaskCount = await getInProgressTaskCountForProjectQuery(projectId);

        handleResponse(res, 200, "Task count fetched successfully", { taskCount, completedTaskCount, inProgressTaskCount });
    } catch (error) {
        next(error);
    }
}

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const taskId = req.params.taskId;
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

        const deletedTask = await deleteTaskQuery(taskId);
        if (!deletedTask) {
            handleResponse(res, 404, "Task not found", null);
            return;
        }

        if (deletedTask.milestone_id) {
            await recalculateAllTasksInMilestoneQuery(projectId, deletedTask.milestone_id)
            await recalculateCompletedTasksInMilestoneQuery(projectId, deletedTask.milestone_id)
        }

        await recalculateProjectStatus(projectId);
        handleResponse(res, 200, "Task deleted successfully", deletedTask);
    } catch (error) {
        next(error);
    }
};