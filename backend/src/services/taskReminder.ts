
import { getAssignmentsForTaskQuery } from '../models/assignmentModel';
import { isToday, isTomorrow } from 'date-fns';
import { getAllTaskForReminderQuery } from '../models/task.Model';
import { getProjectByIdQuery } from '../models/projectModel';
import { sendMilestoneDueSoonEmail, sendTaskDueSoonEmail } from './emailService';
import { getAllCOmpletedTaskCountForMilestoneQuery, getAllMilestoneForReminderQuery, getAllTaskCountForMilestoneQuery } from '../models/milestonesModel';
import { getUserByIdQuery } from '../models/userModel';

export const checkDueTasksAndSendReminders = async () => {
    try {
        // Get all tasks that are not completed
        const tasks = await getAllTaskForReminderQuery();

        for (const task of tasks) {
            if (task.status === 'completed' || !task.due_date) continue;

            if (!task.due_date) continue;

            const dueDate = new Date(task.due_date);
            const isDueToday = isToday(dueDate);
            const isDueTomorrow = isTomorrow(dueDate);

            if (isDueToday || isDueTomorrow) {
                const assignments = await getAssignmentsForTaskQuery(task.id);
                const project = await getProjectByIdQuery(task.project_id);
                const projectOwner = await getUserByIdQuery(project.owner_id);

                if (projectOwner.is_premium) continue;

                for (const assignment of assignments) {
                    await sendTaskDueSoonEmail(
                        assignment.user_email,
                        task.title,
                        project.name,
                        dueDate,
                        task.id,
                        task.project_id,
                        isDueToday
                    );
                }
            }
        }
    } catch (error) {
        console.error('Error in task reminder service:', error);
    }
};

export const checkDueMilestonesAndSendReminders = async () => {
    try {
        const milestones = await getAllMilestoneForReminderQuery();

        for (const milestone of milestones) {
            if (!milestone.due_date) continue;

            const project = await getProjectByIdQuery(milestone.project_id);
            const projectOwner = await getUserByIdQuery(project.owner_id);

            if (projectOwner.is_premium) continue;

            const allTaskCount = await getAllTaskCountForMilestoneQuery(milestone.id);
            const completedTaskCount = await getAllCOmpletedTaskCountForMilestoneQuery(milestone.id);

            if (completedTaskCount === allTaskCount) continue;

            // Check due dates
            const dueDate = new Date(milestone.due_date);
            const isDueToday = isToday(dueDate);
            const isDueTomorrow = isTomorrow(dueDate);

            // Calculate progress (handle division by zero)
            const progress = allTaskCount > 0
                ? Math.round((completedTaskCount / allTaskCount) * 100)
                : 0;

            if (isDueToday || isDueTomorrow) {
                const project = await getProjectByIdQuery(milestone.project_id);
                const owner = await getUserByIdQuery(project.owner_id);
                await sendMilestoneDueSoonEmail(
                    owner.email,
                    milestone.name,
                    project.name,
                    dueDate,
                    milestone.id,
                    project.id,
                    isDueToday,
                    progress,
                    completedTaskCount,
                    allTaskCount
                );
            }
        }
    } catch (error) {
        console.error('Error in task reminder service:', error);
    }
};