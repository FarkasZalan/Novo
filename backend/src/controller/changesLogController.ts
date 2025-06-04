import { Request, Response } from "express";
import { NextFunction } from "connect";
import { getUserByIdQuery } from "../models/userModel";
import { getAllProjectForUsersQuery, getProjectNameQuery } from "../models/projectModel";
import { getAllLogForUserQuery, getChangeLogsForCommentQuery, getChangeLogsForDashboardQuery, getChangeLogsForMilestoneQuery, getChangeLogsForProjectQuery, getChangeLogsForTaskQuery, getChangeLogsForUserQuery } from "../models/changeLogModel";
import { getAssignmentForLogsQuery } from "../models/assignmentModel";
import { getTaskByIdQuery, getTaskNameForLogsQuery } from "../models/task.Model";
import { deleteLogQuery } from "../models/changeLogModel";
import { getLabelQuery } from "../models/labelModel";
import { getMilestoneByIdQuery } from "../models/milestonesModel";

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

export const getDahboardLogForUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;

        // Get all related project IDs
        const allProjectsForUser = await getAllProjectForUsersQuery(userId);
        const projectIds = allProjectsForUser.map((project) => project.id);

        // Get all logs across these project IDs with global limit
        const logs = await getChangeLogsForDashboardQuery(projectIds, 5);

        const changeLogs: any[] = [];

        for (const log of logs) {
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

            // Process each table
            switch (table_name) {
                case "assignments": {
                    let assignmentDetails: any;
                    if (operation === "DELETE") {
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
                        };
                    } else {
                        assignmentDetails = await getAssignmentForLogsQuery(log.new_data.task_id, log.new_data.user_id);
                        if (!assignmentDetails.length) {
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
                            };
                        }
                    }
                    const assignment = Array.isArray(assignmentDetails) ? assignmentDetails[0] : assignmentDetails;
                    changeLogs.push({ ...log, assignment, projectName });
                    break;
                }

                case "comments": {
                    const data = operation === "DELETE" ? log.old_data : log.new_data;
                    const user = await getUserByIdQuery(data.author_id);
                    const commentDetails = {
                        user_id: data.author_id,
                        user_name: user.name || user.email || "Unknown",
                        user_email: user.email || user.name || "Unknown",
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
                    const user = await getUserByIdQuery(data.user_id);
                    const inviter = await getUserByIdQuery(data.inviter_user_id);

                    if (user.id === inviter.id && operation !== "DELETE") {
                        await deleteLogQuery(log.id);
                        continue;
                    }

                    changeLogs.push({
                        ...log,
                        projectMember: {
                            user_id: data.user_id,
                            user_name: user.name || user.email || "Unknown",
                            user_email: user.email || user.name || "Unknown",
                            project_id: data.project_id,
                            inviter_user_id: data.inviter_user_id,
                            inviter_user_name: inviter.name || inviter.email || "Unknown",
                            inviter_user_email: inviter.email || inviter.name || "Unknown"
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
                    const taskTitle = await getTaskNameForLogsQuery(data.task_id);
                    const label = await getLabelQuery(data.label_id);
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
                    const milestone = await getMilestoneByIdQuery(data.milestone_id);
                    let taskDetails: any;

                    if (data.parent_task_id) {
                        const parent = await getTaskByIdQuery(data.parent_task_id);
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
                            name: user?.name || user?.email || "Unknown",
                            email: user?.email || user?.name || "Unknown"
                        }
                    });
                    break;
                }

                default:
                    break;
            }
        }

        handleResponse(res, 200, "Project change logs successfully fetched", changeLogs);
    } catch (error: any) {
        console.error(error);
        next(error);
    }
};

export const getProjectLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projectId = req.params.projectId;

        let changeLogs: any[] = [];
        const logs: any = await getChangeLogsForProjectQuery(projectId, 5);

        for (const log of logs) {
            if (shouldDeleteLog(log)) {
                await deleteLogQuery(log.id);
                continue;
            }

            if (log.table_name === "assignments") {
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
                changeLogs.push({ ...log, assignment });
            } else if (log.table_name === "comments") {
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
                changeLogs.push({ ...log, comment: commentDetails });
            } else if (log.table_name === "milestones") {
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
                changeLogs.push({ ...log, milestone: milestoneDetails });
            } else if (log.table_name === "files") {
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
                changeLogs.push({ ...log, file: fileDetails });
            } else if (log.table_name === "project_members") {
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
                changeLogs.push({ ...log, projectMember: projectMemberDetails });
            } else if (log.table_name === "pending_project_invitations") {
                // because when a user accepts the invitation the invitation is deleted and 
                // the user is added to the project_members table so it don't need to log
                if (log.operation === "DELETE") {
                    if (!log.changed_by) {
                        await deleteLogQuery(log.id);
                    }
                } else {
                    changeLogs.push({ ...log });
                }
            } else if (log.table_name === "task_labels") {
                let taskLabelDetails: any;

                if (log.operation === "DELETE") {
                    let task = await getTaskNameForLogsQuery(log.old_data.task_id);
                    let label = await getLabelQuery(log.old_data.label_id);

                    taskLabelDetails = {
                        task_id: log.old_data.task_id,
                        task_title: task || 'Deleted',
                        label_id: log.old_data.label_id,
                        label_name: label ? label.name : 'Deleted',
                        project_id: log.old_data.project_id
                    }
                } else {
                    let task = await getTaskNameForLogsQuery(log.new_data.task_id);
                    let label = await getLabelQuery(log.new_data.label_id);

                    taskLabelDetails = {
                        task_id: log.new_data.task_id,
                        task_title: task || 'Deleted',
                        label_id: log.new_data.label_id,
                        label_name: label ? label.name : 'Deleted',
                        project_id: log.new_data.project_id
                    }
                }
                changeLogs.push({ ...log, task_label: taskLabelDetails });
            } else if (log.table_name === "projects") {
                if (log.operation === "UPDATE") {
                    if (log.new_data.name === log.old_data.name && log.new_data.description === log.old_data.description) {
                        await deleteLogQuery(log.id);
                    }
                }
                changeLogs.push({ ...log });
            } else if (log.table_name === "tasks") {
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
                changeLogs.push({ ...log, task: taskDetails });
            }
        }

        handleResponse(res, 200, "Project change logs successfully fetched", changeLogs);
    } catch (error: Error | any) {
        console.log(error);
        next(error);
    }
};

export const getTaskLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const taskId = req.params.taskId;

        let changeLogs: any[] = [];
        const logs: any = await getChangeLogsForTaskQuery(taskId, 5);

        for (const log of logs) {
            if (shouldDeleteLog(log)) {
                await deleteLogQuery(log.id);
                continue;
            }

            if (log.table_name === "assignments") {
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
                changeLogs.push({ ...log, assignment });
            } else if (log.table_name === "files") {
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
                changeLogs.push({ ...log, file: fileDetails });
            } else if (log.table_name === "task_labels") {
                let taskLabelDetails: any;

                if (log.operation === "DELETE") {
                    let task = await getTaskNameForLogsQuery(log.old_data.task_id);
                    let label = await getLabelQuery(log.old_data.label_id);

                    taskLabelDetails = {
                        task_id: log.old_data.task_id,
                        task_title: task || 'Deleted',
                        label_id: log.old_data.label_id,
                        label_name: label ? label.name : 'Deleted',
                        project_id: log.old_data.project_id
                    }
                } else {
                    let task = await getTaskNameForLogsQuery(log.new_data.task_id);
                    let label = await getLabelQuery(log.new_data.label_id);

                    taskLabelDetails = {
                        task_id: log.new_data.task_id,
                        task_title: task || 'Deleted',
                        label_id: log.new_data.label_id,
                        label_name: label ? label.name : 'Deleted',
                        project_id: log.new_data.project_id
                    }
                }
                changeLogs.push({ ...log, task_label: taskLabelDetails });
            } else if (log.table_name === "tasks") {
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
                changeLogs.push({ ...log, task: taskDetails });
            }
        }

        handleResponse(res, 200, "Project change logs successfully fetched", changeLogs);
    } catch (error: Error | any) {
        console.log(error);
        next(error);
    }
};

export const getCommentLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const commentId = req.params.commentId;

        let changeLogs: any[] = [];
        const logs: any = await getChangeLogsForCommentQuery(commentId);

        for (const log of logs) {
            if (shouldDeleteLog(log)) {
                await deleteLogQuery(log.id);
                continue;
            }

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
            changeLogs.push({ ...log, comment: commentDetails });
        }

        handleResponse(res, 200, "Project change logs successfully fetched", changeLogs);
    } catch (error: Error | any) {
        console.log(error);
        next(error);
    }
};

export const getMilestoneLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const milestoneId = req.params.milestoneId;
        const milestone = await getMilestoneByIdQuery(milestoneId);

        let changeLogs: any[] = [];
        const logs: any = await getChangeLogsForMilestoneQuery(milestoneId, 5);

        for (const log of logs) {
            if (shouldDeleteLog(log)) {
                await deleteLogQuery(log.id);
                continue;
            }

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
            changeLogs.push({ ...log, milestone: milestoneDetails });
        }

        handleResponse(res, 200, "Project change logs successfully fetched", changeLogs);
    } catch (error: Error | any) {
        console.log(error);
        next(error);
    }
};

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

export const getUserLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;

        let changeLogs: any[] = [];

        const logs: any = await getChangeLogsForUserQuery(userId, 5);

        for (const log of logs) {
            if (shouldDeleteLog(log)) {
                await deleteLogQuery(log.id);
                continue;
            }

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

        handleResponse(res, 200, "Project change logs successfully fetched", changeLogs);
    } catch (error: Error | any) {
        console.log(error);
        next(error);
    }
};