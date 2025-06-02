import { Request, Response } from "express";
import { NextFunction } from "connect";
import { getAssignmentForLogsQuery } from "../models/assignmentModel";
import { getChangeLogsForProjectQuery, deleteLogQuery, getAllLogForUserQuery } from "../models/changeLogModel";
import { getLabelQuery, getLabelsForTaskQuery } from "../models/labelModel";
import { getMilestoneByIdQuery } from "../models/milestonesModel";
import { getAllProjectForUsersQuery, getProjectNameQuery } from "../models/projectModel";
import { getTaskNameForLogsQuery, getTaskByIdQuery, getParentTaskForSubtaskQuery } from "../models/task.Model";
import { getUserByIdQuery } from "../models/userModel";
import { FilterAllUnassignedTaskForMilestoneQuery, filterTaskByTitleBasedOnMilestoneQuery, filterUserByNameOrEmailQuery } from "../models/filterModel";

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

        let tableFilter: string[] = []

        if (req.query.tables) {
            if (Array.isArray(req.query.tables)) {
                // Handle case where tables is an array (e.g., ?tables=projects&tables=tasks)
                tableFilter = req.query.tables as string[];
            } else if (typeof req.query.tables === 'string') {
                // Handle comma-separated string (e.g., ?tables=projects,tasks)
                tableFilter = req.query.tables.split(',');
            }
        }

        const haveFilters = tableFilter.length > 0

        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

        const allProjectForUser = await getAllProjectForUsersQuery(userId);

        const projectIds = allProjectForUser.map((project) => project.id);

        let changeLogs: any[] = [];
        let hasMore = true;

        for (let projectId of projectIds) {

            const logs: any = await getAllLogForUserQuery(projectId, limit, userId, tableFilter);

            for (const log of logs) {
                // Skip if we have filters and this table isn't in them
                if (haveFilters && !tableFilter.includes(log.table_name)) {
                    continue;
                }

                if (shouldDeleteLog(log)) {
                    await deleteLogQuery(log.id);
                    continue;
                }

                const projectName = await getProjectNameQuery(projectId);
                if (log.table_name === "assignments" && !haveFilters || log.table_name === "assignments" && tableFilter.includes("assignments")) {
                    let assignmentDetails: any;
                    if (log.operation === "DELETE") {
                        const assigned_by = await getUserByIdQuery(log.old_data.assigned_by);
                        const user = await getUserByIdQuery(log.old_data.user_id);

                        assignmentDetails = {
                            task_id: log.old_data.task_id,
                            user_id: log.old_data.user_id,
                            task_title: await getTaskNameForLogsQuery(log.old_data.task_id) || 'Deleted',
                            assigned_by_name: assigned_by.name || assigned_by.email || "Unknown",
                            assigned_by_email: assigned_by.email || assigned_by.name || "Unknown",
                            user_name: user.name || user.email || "Unknown",
                            user_email: user.email || user.name || "Unknown"
                        }
                    } else {
                        assignmentDetails = await getAssignmentForLogsQuery(log.new_data.task_id, log.new_data.user_id);

                        if (assignmentDetails.length === 0) {
                            const assigned_by = await getUserByIdQuery(log.new_data.assigned_by);
                            const user = await getUserByIdQuery(log.new_data.user_id);

                            assignmentDetails = {
                                task_id: log.new_data.task_id,
                                user_id: log.new_data.user_id,
                                task_title: await getTaskNameForLogsQuery(log.new_data.task_id) || 'Deleted',
                                assigned_by_name: assigned_by.name || assigned_by.email || "Unknown",
                                assigned_by_email: assigned_by.email || assigned_by.name || "Unknown",
                                user_name: user.name || user.email || "Unknown",
                                user_email: user.email || user.name || "Unknown"
                            }
                        }
                    }

                    const assignment = assignmentDetails[0] || assignmentDetails;
                    changeLogs.push({ ...log, assignment, projectName });
                } else if (log.table_name === "comments" && !haveFilters || log.table_name === "comments" && tableFilter.includes("comments")) {
                    let commentDetails: any;
                    if (log.operation === "DELETE") {
                        const user = await getUserByIdQuery(log.old_data.author_id);
                        commentDetails = {
                            user_id: log.old_data.author_id,
                            user_name: user.name || user.email || "Unknown",
                            user_email: user.email || user.name || "Unknown",
                            comment: log.old_data.comment,
                            task_title: await getTaskNameForLogsQuery(log.old_data.task_id) || 'Deleted'
                        }
                    } else {
                        const user = await getUserByIdQuery(log.new_data.author_id);
                        commentDetails = {
                            user_id: log.new_data.author_id,
                            user_name: user.name || user.email || "Unknown",
                            user_email: user.email || user.name || "Unknown",
                            comment: log.new_data.comment,
                            task_title: await getTaskNameForLogsQuery(log.new_data.task_id) || 'Deleted'
                        }
                    }
                    changeLogs.push({ ...log, comment: commentDetails, projectName });
                } else if (log.table_name === "milestones" && !haveFilters || log.table_name === "milestones" && tableFilter.includes("milestones")) {
                    let milestoneDetails: any;

                    if (log.operation === "DELETE") {
                        milestoneDetails = {
                            title: log.old_data.name,
                            id: log.old_data.id,
                            project_id: log.old_data.project_id
                        }
                    } else {
                        milestoneDetails = {
                            title: log.new_data.name,
                            id: log.new_data.id,
                            project_id: log.new_data.project_id
                        }
                    }
                    changeLogs.push({ ...log, milestone: milestoneDetails, projectName });
                } else if (log.table_name === "files" && !haveFilters || log.table_name === "files" && tableFilter.includes("files")) {
                    let fileDetails: any;
                    if (log.operation === "DELETE") {
                        let taskName = "";
                        if (log.old_data.task_id !== null) {
                            taskName = await getTaskNameForLogsQuery(log.old_data.task_id);
                        }

                        fileDetails = {
                            title: log.old_data.file_name,
                            id: log.old_data.id,
                            project_id: log.old_data.project_id,
                            task_id: log.old_data.task_id,
                            task_title: taskName || 'Deleted'
                        }
                    } else {
                        let taskName = "";
                        if (log.new_data.task_id !== null) {
                            taskName = await getTaskNameForLogsQuery(log.new_data.task_id);
                        }
                        fileDetails = {
                            title: log.new_data.file_name,
                            id: log.new_data.id,
                            project_id: log.new_data.project_id,
                            task_id: log.new_data.task_id,
                            task_title: taskName || 'Deleted'
                        }
                    }
                    changeLogs.push({ ...log, file: fileDetails, projectName });
                } else if (log.table_name === "project_members" && !haveFilters || log.table_name === "project_members" && tableFilter.includes("project_members")) {
                    let projectMemberDetails: any;
                    if (log.operation === "DELETE") {
                        const user = await getUserByIdQuery(log.old_data.user_id);
                        const inviter = await getUserByIdQuery(log.old_data.inviter_user_id);
                        projectMemberDetails = {
                            user_id: log.old_data.user_id,
                            user_name: user.name || user.email || "Unknown",
                            user_email: user.email || user.name || "Unknown",
                            project_id: log.old_data.project_id,
                            inviter_user_id: log.old_data.inviter_user_id,
                            inviter_user_name: inviter.name || inviter.email || "Unknown",
                            inviter_user_email: inviter.email || inviter.name || "Unknown"
                        }
                    } else {
                        const user = await getUserByIdQuery(log.new_data.user_id);
                        const inviter = await getUserByIdQuery(log.new_data.inviter_user_id);
                        if (user.id === inviter.id) {
                            await deleteLogQuery(log.id);
                        }

                        projectMemberDetails = {
                            user_id: log.new_data.user_id,
                            user_name: user.name || user.email || "Unknown",
                            user_email: user.email || user.name || "Unknown",
                            project_id: log.new_data.project_id,
                            inviter_user_id: log.new_data.inviter_user_id,
                            inviter_user_name: inviter.name || inviter.email || "Unknown",
                            inviter_user_email: inviter.email || inviter.name || "Unknown"
                        }
                    }
                    changeLogs.push({ ...log, projectMember: projectMemberDetails, projectName });
                } else if (log.table_name === "pending_project_invitations" && !haveFilters || log.table_name === "pending_project_invitations" && tableFilter.includes("pending_project_invitations")) {
                    // because when a user accepts the invitation the invitation is deleted and 
                    // the user is added to the project_members table so it don't need to log
                    if (log.operation === "DELETE") {
                        if (!log.changed_by) {
                            await deleteLogQuery(log.id);
                        }
                    } else {
                        changeLogs.push({ ...log, projectName });
                    }
                } else if (log.table_name === "task_labels" && !haveFilters || log.table_name === "task_labels" && tableFilter.includes("task_labels")) {
                    let taskLabelDetails: any;

                    if (log.operation === "DELETE") {
                        let task = await getTaskNameForLogsQuery(log.old_data.task_id);
                        let label = await getLabelQuery(log.old_data.label_id);

                        taskLabelDetails = {
                            task_id: log.old_data.task_id,
                            task_title: task || 'Deleted',
                            label_id: log.old_data.label_id,
                            label_name: label.name,
                            project_id: log.old_data.project_id
                        }
                    } else {
                        let task = await getTaskNameForLogsQuery(log.new_data.task_id);
                        let label = await getLabelQuery(log.new_data.label_id);

                        taskLabelDetails = {
                            task_id: log.new_data.task_id,
                            task_title: task || 'Deleted',
                            label_id: log.new_data.label_id,
                            label_name: label.name,
                            project_id: log.new_data.project_id
                        }
                    }
                    changeLogs.push({ ...log, task_label: taskLabelDetails, projectName });
                } else if (log.table_name === "projects" && !haveFilters || log.table_name === "projects" && tableFilter.includes("projects")) {
                    if (log.operation === "UPDATE") {
                        if (log.new_data.name === log.old_data.name && log.new_data.description === log.old_data.description) {
                            await deleteLogQuery(log.id);
                        }
                    }
                    changeLogs.push({ ...log, projectName });
                } else if (log.table_name === "tasks" && !haveFilters || log.table_name === "tasks" && tableFilter.includes("tasks")) {
                    let taskDetails: any;

                    if (log.operation === "DELETE") {
                        const milestone = await getMilestoneByIdQuery(log.old_data.milestone_id);
                        if (log.old_data.parent_task_id) {
                            const parentTask = await getTaskByIdQuery(log.old_data.parent_task_id);
                            taskDetails = {
                                task_id: log.old_data.id,
                                task_title: await getTaskNameForLogsQuery(log.old_data.id) || 'Deleted',
                                project_id: log.old_data.project_id,
                                milestone_id: log.old_data.milestone_id,
                                milestone_name: milestone?.name,
                                parent_task_id: log.old_data.parent_task_id,
                                parent_task_title: parentTask?.title || 'Deleted'
                            }
                        } else {
                            taskDetails = {
                                task_id: log.old_data.id,
                                task_title: 'Deleted',
                                project_id: log.old_data.project_id,
                                milestone_id: log.old_data.milestone_id,
                                milestone_name: milestone?.name
                            }
                        }
                    } else {
                        const milestone = await getMilestoneByIdQuery(log.new_data.milestone_id);

                        if (log.new_data.parent_task_id) {
                            const parentTask = await getTaskByIdQuery(log.new_data.parent_task_id);
                            taskDetails = {
                                task_id: log.new_data.id,
                                task_title: await getTaskNameForLogsQuery(log.new_data.id) || 'Deleted',
                                project_id: log.new_data.project_id,
                                milestone_id: log.new_data.milestone_id,
                                milestone_name: milestone?.name,
                                parent_task_id: log.new_data.parent_task_id,
                                parent_task_title: parentTask?.title || 'Deleted'
                            }
                        } else {
                            taskDetails = {
                                task_id: log.new_data.id,
                                task_title: await getTaskNameForLogsQuery(log.new_data.id) || 'Deleted',
                                project_id: log.new_data.project_id,
                                milestone_id: log.new_data.milestone_id,
                                milestone_name: milestone?.name
                            }
                        }
                    }
                    changeLogs.push({ ...log, task: taskDetails, projectName });
                } else if (log.table_name === "users" && !haveFilters || log.table_name === "users" && tableFilter.includes("users")) {
                    if (shouldDeleteLogForUserTable(log)) {
                        await deleteLogQuery(log.id);
                        continue;
                    }

                    let userDetails: any;
                    if (log.operation === "DELETE") {
                        const user = await getUserByIdQuery(log.old_data.id);
                        userDetails = {
                            id: log.old_data.id,
                            name: user.name || user.email || "Unknown",
                            email: user.email || user.name || "Unknown"
                        }
                    } else {
                        const user = await getUserByIdQuery(log.new_data.id);
                        userDetails = {
                            id: log.new_data.id,
                            name: user.name || user.email || "Unknown",
                            email: user.email || user.name || "Unknown"
                        }
                    }

                    changeLogs.push({ ...log, user: userDetails });
                }
            }
        }

        hasMore = changeLogs.length === limit;
        const logs = [changeLogs, hasMore]
        handleResponse(res, 200, "Project change logs successfully fetched", logs);
    } catch (error: Error | any) {
        console.log(error);
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
        const tasks = await FilterAllUnassignedTaskForMilestoneQuery(req.params.projectId, title);

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