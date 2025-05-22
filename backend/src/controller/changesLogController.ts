import { Request, Response } from "express";
import { NextFunction } from "connect";
import { getUserByIdQuery } from "../models/userModel";
import { getAllProjectForUsersQuery, getProjectByIdQuery, getProjectNameQuery } from "../models/projectModel";
import { getChangeLogsForProject } from "../models/changeLogModel";
import { getAssignmentForLogsQuery } from "../models/assignmentModel";
import { getTaskNameForLogsQuery } from "../models/task.Model";

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