import { Request, Response } from "express";
import { NextFunction } from "connect";
import { getAssignmentForLogsQuery } from "../models/assignmentModel";
import { deleteLogQuery, getAllLogForUserQuery } from "../models/changeLogModel";
import { getLabelQuery, getLabelsForTaskQuery } from "../models/labelModel";
import { getMilestoneByIdQuery } from "../models/milestonesModel";
import { getAllProjectForUsersQuery, getProjectNameQuery } from "../models/projectModel";
import { getTaskNameForLogsQuery, getTaskByIdQuery, getParentTaskForSubtaskQuery } from "../models/task.Model";
import { getUserByIdQuery } from "../models/userModel";
import { FilterAllUnassignedTaskForMilestoneQuery, filterTaskByTitleBasedOnMilestoneQuery, filterUserByNameOrEmailQuery } from "../models/filterModel";
import { AssignmentDetails, BaseLog, ChangeLog, CommentDetails, TaskDetails } from "../schemas/types/changeLogType";
import { User } from "../schemas/types/userType";
import { Label } from "../schemas/types/labelType";
import { Milestone } from "../schemas/types/milestonesType";
import { Task } from "../schemas/types/taskType";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

function shouldDeleteLog(log: any): boolean {
    // If operation is INSERT or DELETE, keep the log
    if (log.operation !== 'UPDATE') return false;

    // No old_data means it's an INSERT, not an UPDATE
    if (!log.old_data) return false;

    // Table-specific comparison for project
    switch (log.table_name) {
        case 'projects':
            return log.new_data.name === log.old_data.name &&
                log.new_data.description === log.old_data.description;
        default:
            return JSON.stringify(log.new_data) === JSON.stringify(log.old_data);
    }
}

const shouldDeleteLogForUserTable = (log: any): boolean => {
    const criticalFields = ['name', 'email', 'password', 'is_premium', 'premium_start_date', 'premium_end_date', 'premium_session_id', 'user_cancelled_premium'];

    const oldData = log.old_data || {};
    const newData = log.new_data || {};

    for (const field of criticalFields) {
        if (oldData[field] !== newData[field]) {
            return false; // Critical field changed, keep the log
        }
    }

    return true; // No critical fields changed, delete the log
};

export const getAllFilteredLogForUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;

        // Table filter
        let tableFilter: string[] = [];
        if (req.query.tables) {
            if (Array.isArray(req.query.tables)) {
                tableFilter = req.query.tables as string[];
            } else if (typeof req.query.tables === 'string') {
                tableFilter = req.query.tables.split(',');
            }
        }

        const haveFilters = tableFilter.length > 0;
        const requestedLimit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const limit = requestedLimit + 1

        // Get all related project IDs
        const allProjectsForUser = await getAllProjectForUsersQuery(userId);
        const projectIds = allProjectsForUser.map((project: any) => project.id) || [];

        // Get all logs across these project IDs with global limit
        const logs: BaseLog[] = await getAllLogForUserQuery(projectIds, limit, userId, tableFilter);
        const logsToProcess: BaseLog[] = logs.slice(0, requestedLimit);

        const changeLogs: ChangeLog[] = [];

        // new_data and old_data is whole row from the table that changed
        // so the project table new_data and old_data is the whole row from the project table

        for (const log of logsToProcess) {
            const { table_name, operation } = log;
            let projectId = '';
            if (table_name === 'projects') {
                projectId = log.new_data?.id || log.old_data?.id;
            } else {
                projectId = log.new_data?.project_id || log.old_data?.project_id || '';
            }

            let projectName = '';
            if (projectId !== '') {
                projectName = await getProjectNameQuery(projectId);
            }

            if (shouldDeleteLog(log)) {
                await deleteLogQuery(log.id);
                continue;
            }

            const include = !haveFilters || tableFilter.includes(table_name);
            if (!include) continue;

            // Process each table
            switch (table_name) {
                case "assignments": {
                    let assignmentDetails: AssignmentDetails | AssignmentDetails[];
                    if (operation === "DELETE") {
                        const assigned_by: User = await getUserByIdQuery(log.old_data.assigned_by);
                        const user: User = await getUserByIdQuery(log.old_data.user_id);

                        assignmentDetails = {
                            task_id: log.old_data.task_id,
                            user_id: log.old_data.user_id,
                            task_title: await getTaskNameForLogsQuery(log.old_data.task_id) || 'Deleted',
                            assigned_by_name: assigned_by?.name || assigned_by?.email || "Unknown",
                            assigned_by_email: assigned_by?.email || assigned_by?.name || "Unknown",
                            user_name: user?.name || user?.email || "Unknown",
                            user_email: user?.email || user?.name || "Unknown"
                        };
                    } else {
                        assignmentDetails = await getAssignmentForLogsQuery(log.new_data.task_id, log.new_data.user_id);
                        const assigned_by: User = await getUserByIdQuery(log.new_data.assigned_by);
                        const user: User = await getUserByIdQuery(log.new_data.user_id);
                        assignmentDetails = {
                            task_id: log.new_data.task_id,
                            user_id: log.new_data.user_id,
                            task_title: await getTaskNameForLogsQuery(log.new_data.task_id) || 'Deleted',
                            assigned_by_name: assigned_by?.name || assigned_by?.email || "Unknown",
                            assigned_by_email: assigned_by?.email || assigned_by?.name || "Unknown",
                            user_name: user?.name || user?.email || "Unknown",
                            user_email: user?.email || user?.name || "Unknown"
                        };
                    }
                    const assignment = Array.isArray(assignmentDetails) ? assignmentDetails[0] : assignmentDetails;
                    changeLogs.push({ ...log, assignment, projectName });
                    break;
                }

                case "comments": {
                    const data = operation === "DELETE" ? log.old_data : log.new_data;
                    const user: User = await getUserByIdQuery(data.author_id);
                    const commentDetails: CommentDetails = {
                        user_id: data.author_id,
                        user_name: user?.name || user?.email || "Unknown",
                        user_email: user?.email || user?.name || "Unknown",
                        comment: data.comment,
                        task_title: await getTaskNameForLogsQuery(data.task_id) || 'Deleted'
                    };
                    changeLogs.push({ ...log, comment: commentDetails, projectName });
                    break;
                }

                case "milestones": {
                    const data = operation === "DELETE" ? log.old_data : log.new_data;
                    changeLogs.push({
                        ...log,
                        milestone: {
                            title: data.name,
                            id: data.id,
                            project_id: data.project_id
                        },
                        projectName
                    });
                    break;
                }

                case "files": {
                    const data = operation === "DELETE" ? log.old_data : log.new_data;
                    let taskTitle = '';
                    if (data.task_id) {
                        taskTitle = await getTaskNameForLogsQuery(data.task_id);
                    }
                    changeLogs.push({
                        ...log,
                        file: {
                            title: data.file_name,
                            id: data.id,
                            project_id: data.project_id,
                            task_id: data.task_id,
                            task_title: taskTitle || 'Deleted'
                        },
                        projectName
                    });
                    break;
                }

                case "project_members": {
                    const data = operation === "DELETE" ? log.old_data : log.new_data;
                    const user: User = await getUserByIdQuery(data.user_id);
                    const inviter: User = await getUserByIdQuery(data.inviter_user_id);

                    if (user.id === inviter.id && operation !== "DELETE") {
                        await deleteLogQuery(log.id);
                        continue;
                    }

                    changeLogs.push({
                        ...log,
                        projectMember: {
                            user_id: data.user_id,
                            user_name: user?.name || user?.email || "Unknown",
                            user_email: user?.email || user?.name || "Unknown",
                            project_id: data.project_id,
                            inviter_user_id: data.inviter_user_id,
                            inviter_user_name: inviter?.name || inviter?.email || "Unknown",
                            inviter_user_email: inviter?.email || inviter?.name || "Unknown"
                        },
                        projectName
                    });
                    break;
                }

                case "pending_project_invitations": {
                    if (operation === "DELETE" && !log.changed_by) {
                        await deleteLogQuery(log.id);
                        continue;
                    }
                    changeLogs.push({ ...log, projectName });
                    break;
                }

                case "task_labels": {
                    const data = operation === "DELETE" ? log.old_data : log.new_data;
                    const taskTitle: string = await getTaskNameForLogsQuery(data.task_id);
                    const label: Label = await getLabelQuery(data.label_id);
                    changeLogs.push({
                        ...log,
                        task_label: {
                            task_id: data.task_id,
                            task_title: taskTitle || 'Deleted',
                            label_id: data.label_id,
                            label_name: label ? label.name : 'Deleted',
                            project_id: data.project_id
                        },
                        projectName
                    });
                    break;
                }

                case "projects": {
                    if (operation === "UPDATE") {
                        if (log.new_data.name === log.old_data.name && log.new_data.description === log.old_data.description) {
                            await deleteLogQuery(log.id);
                            continue;
                        }
                    }
                    changeLogs.push({ ...log, projectName });
                    break;
                }

                case "tasks": {
                    const data = operation === "DELETE" ? log.old_data : log.new_data;
                    const milestone: Milestone = await getMilestoneByIdQuery(data.milestone_id);
                    let taskDetails: TaskDetails;

                    if (data.parent_task_id) {
                        const parent: Task = await getTaskByIdQuery(data.parent_task_id);
                        taskDetails = {
                            task_id: data.id,
                            task_title: await getTaskNameForLogsQuery(data.id) || 'Deleted',
                            project_id: data.project_id,
                            milestone_id: data.milestone_id,
                            milestone_name: milestone?.name,
                            parent_task_id: data.parent_task_id,
                            parent_task_title: parent?.title || 'Deleted'
                        };
                    } else {
                        taskDetails = {
                            task_id: data.id,
                            task_title: await getTaskNameForLogsQuery(data.id) || 'Deleted',
                            project_id: data.project_id,
                            milestone_id: data.milestone_id,
                            milestone_name: milestone?.name
                        };
                    }

                    changeLogs.push({ ...log, task: taskDetails, projectName });
                    break;
                }

                case "users": {
                    if (shouldDeleteLogForUserTable(log)) {
                        await deleteLogQuery(log.id);
                        continue;
                    }

                    const data = operation === "DELETE" ? log.old_data : log.new_data;
                    const user = await getUserByIdQuery(data.id);
                    changeLogs.push({
                        ...log,
                        user: {
                            id: data.id,
                            name: user.name || user.email || "Unknown",
                            email: user.email || user.name || "Unknown"
                        }
                    });
                    break;
                }

                default:
                    break;
            }
        }

        const hasMore = logs.length > requestedLimit;
        handleResponse(res, 200, "Project change logs successfully fetched", [changeLogs, hasMore]);
    } catch (error: any) {
        console.error(error);
        next(error);
    }
};


export const getAllUserByNameOrEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nameOrEmail = req.query.nameOrEmail as string || '';

        if (nameOrEmail.length < 2) {
            handleResponse(res, 400, "Name or email should be at least 2 characters long", null);
            return;
        }
        const users = await filterUserByNameOrEmailQuery(nameOrEmail);

        handleResponse(res, 200, "Users successfully fetched", users);
    } catch (error: Error | any) {
        console.log(error);
        next(error);
    }
}

export const getAllTaskByNameBasedOnMilestone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const milestoneId = req.params.milestoneId as string || '';
        const projectId = req.params.projectId;
        const title = req.query.title as string || '';

        if (title.length < 2) {
            handleResponse(res, 400, "Title should be at least 2 characters long", null);
            return;
        }

        if (!milestoneId || !projectId) {
            handleResponse(res, 400, "Project id is required", null);
            return;
        }

        const tasks = await filterTaskByTitleBasedOnMilestoneQuery(projectId, milestoneId, title);

        for (const task of tasks) {
            const taskLabels = await getLabelsForTaskQuery(task.id);
            task.labels = taskLabels;

            task.parent_task_id = await getParentTaskForSubtaskQuery(task.id) || null;
            if (task.parent_task_id) {
                const parentTask = await getTaskByIdQuery(task.parent_task_id) || null;
                task.parent_task_name = parentTask.title || null;
            }
        }

        handleResponse(res, 200, "Tasks successfully fetched", tasks);
    } catch (error: Error | any) {
        console.log(error);
        next(error);
    }
}

export const getAllUnassignedTaskForMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const title = req.query.title as string || '';

        if (title.length < 2) {
            handleResponse(res, 400, "Title should be at least 2 characters long", null);
            return;
        }
        const tasks = await FilterAllUnassignedTaskForMilestoneQuery(req.params.projectId, title, 'priority', 'asc');

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