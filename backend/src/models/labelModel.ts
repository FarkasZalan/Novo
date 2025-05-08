import pool from "../config/db";

// label table querys
export const createLabelQuery = async (labelName: string, description: string, project_id: string, color: string) => {
    const result = await pool.query(`INSERT INTO labels (name, project_id, description, color) VALUES ($1, $2 , $3, $4) RETURNING *`, [labelName, project_id, description, color]);
    return result.rows[0];
}

export const updateLabelQuery = async (labelName: string, description: string, color: string, id: string) => {
    const result = await pool.query(`UPDATE labels SET name = $1 , description = $2 , color = $3 WHERE id = $4 RETURNING *`, [labelName, description, color, id]);
    return result.rows[0];
}

export const deleteLabelQuery = async (id: string) => {
    const result = await pool.query(`DELETE FROM labels WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
}

export const getAllLabelForProjectQuery = async (project_id: string) => {
    const result = await pool.query(`SELECT labels.*, COUNT(task_labels.task_id) AS task_count FROM labels LEFT JOIN task_labels ON labels.id = task_labels.label_id  WHERE labels.project_id = $1 GROUP BY labels.id ORDER BY task_count DESC`, [project_id]);
    return result.rows;
}

// task label querys

export const addLabelToTaskQuery = async (task_id: string, label_id: string) => {
    const result = await pool.query(`INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`, [task_id, label_id]);
    return result.rows[0];
}

export const deleteLabelFromTaskQuery = async (task_id: string, label_id: string) => {
    const result = await pool.query(`DELETE FROM task_labels WHERE task_id = $1 AND label_id = $2 RETURNING *`, [task_id, label_id]);
    return result.rows[0];
}

export const getLabelsForTaskQuery = async (task_id: string) => {
    const result = await pool.query(`SELECT labels.* FROM labels INNER JOIN task_labels ON labels.id = task_labels.label_id WHERE task_labels.task_id = $1`, [task_id]);
    return result.rows;
}