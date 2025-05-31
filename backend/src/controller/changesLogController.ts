import { Request, Response } from "express";
import { NextFunction } from "connect";
import { getUserByIdQuery } from "../models/userModel";
import { getAllProjectForUsersQuery, getProjectByIdQuery, getProjectNameQuery } from "../models/projectModel";
import { getChangeLogsForProject } from "../models/changeLogModel";
import { getAssignmentForLogsQuery } from "../models/assignmentModel";
import { getTaskNameForLogsQuery } from "../models/task.Model";
import { getProjectMemberQuery } from "../models/projectMemberModel";
import { deleteLogQuery } from "../models/changeLogModal";
import { getLabelQuery } from "../models/labelModel";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const getAllProjectLogForUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;

        const allProjectForUser = await getAllProjectForUsersQuery(userId);

        const projectIds = allProjectForUser.map((project) => project.id);

        let changeLogs: any[] = [];

        for (let projectId of projectIds) {
            const logs: any = await getChangeLogsForProject(projectId);

            for (const log of logs) {
                const projectName = await getProjectNameQuery(projectId);
                if (log.table_name === "assignments") {
                    let assignmentDetails: any;
                    if (log.operation === "DELETE") {
                        const assigned_by = await getUserByIdQuery(log.old_data.assigned_by);
                        const user = await getUserByIdQuery(log.old_data.user_id);

                        assignmentDetails = {
                            task_id: log.old_data.task_id,
                            user_id: log.old_data.user_id,
                            task_title: await getTaskNameForLogsQuery(log.old_data.task_id),
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
                                task_title: await getTaskNameForLogsQuery(log.new_data.task_id),
                                assigned_by_name: assigned_by.name || assigned_by.email || "Unknown",
                                assigned_by_email: assigned_by.email || assigned_by.name || "Unknown",
                                user_name: user.name || user.email || "Unknown",
                                user_email: user.email || user.name || "Unknown"
                            }
                        }
                    }

                    const assignment = assignmentDetails[0] || assignmentDetails;
                    changeLogs.push({ ...log, assignment, projectName });
                } else if (log.table_name === "comments") {
                    let commentDetails: any;
                    if (log.operation === "DELETE") {
                        const user = await getUserByIdQuery(log.old_data.author_id);
                        commentDetails = {
                            user_id: log.old_data.author_id,
                            user_name: user.name || user.email || "Unknown",
                            user_email: user.email || user.name || "Unknown",
                            comment: log.old_data.comment,
                            task_title: await getTaskNameForLogsQuery(log.old_data.task_id)
                        }
                    } else {
                        const user = await getUserByIdQuery(log.new_data.author_id);
                        commentDetails = {
                            user_id: log.new_data.author_id,
                            user_name: user.name || user.email || "Unknown",
                            user_email: user.email || user.name || "Unknown",
                            comment: log.new_data.comment,
                            task_title: await getTaskNameForLogsQuery(log.new_data.task_id)
                        }
                    }
                    changeLogs.push({ ...log, comment: commentDetails, projectName });
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
                    changeLogs.push({ ...log, milestone: milestoneDetails, projectName });
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
                            task_title: taskName
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
                            task_title: taskName
                        }
                    }
                    changeLogs.push({ ...log, file: fileDetails, projectName });
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
                    changeLogs.push({ ...log, projectMember: projectMemberDetails, projectName });
                } else if (log.table_name === "pending_project_invitations") {
                    // because when a user accepts the invitation the invitation is deleted and 
                    // the user is added to the project_members table so it don't need to log
                    if (log.operation === "DELETE") {
                        if (!log.changed_by) {
                            await deleteLogQuery(log.id);
                        }
                    } else {
                        changeLogs.push({ ...log, projectName });
                    }
                } else if (log.table_name === "task_labels") {
                    let taskLabelDetails: any;

                    if (log.operation === "DELETE") {
                        let task = await getTaskNameForLogsQuery(log.old_data.task_id);
                        let label = await getLabelQuery(log.old_data.label_id);

                        taskLabelDetails = {
                            task_id: log.old_data.task_id,
                            task_title: task,
                            label_id: log.old_data.label_id,
                            label_name: label.name,
                            project_id: log.old_data.project_id
                        }
                    } else {
                        let task = await getTaskNameForLogsQuery(log.new_data.task_id);
                        let label = await getLabelQuery(log.new_data.label_id);

                        taskLabelDetails = {
                            task_id: log.new_data.task_id,
                            task_title: task,
                            label_id: log.new_data.label_id,
                            label_name: label.name,
                            project_id: log.new_data.project_id
                        }
                    }
                    changeLogs.push({ ...log, task_label: taskLabelDetails, projectName });
                } else if (log.table_name === "projects") {
                    if (log.operation === "UPDATE") {
                        if (log.new_data.name === log.old_data.name && log.new_data.description === log.old_data.description) {
                            await deleteLogQuery(log.id);
                        }
                    }
                    changeLogs.push({ ...log, projectName });
                }
                else {
                    changeLogs.push({ ...log, projectName });
                }
            }
        }

        handleResponse(res, 200, "Project change logs successfully fetched", changeLogs);
    } catch (error: Error | any) {
        next(error);
    }
};