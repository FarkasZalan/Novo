import pool from "../config/db";

// project files querys

// left join -> get all the rows from the left table, even if there are no matches in the right table, 
// if there are no matches, the result will be null for the right table columns
// the basic inner join -> get only the rows that have a match in both tables

// here need to use left join, because need the all files even if they don't have a uploaded_by user (the user got deleted or something)
export const getAllFilesQuery = async (procejtId: string) => {
    const result = await pool.query("SELECT files.*, users.name AS uploaded_by_name, users.email AS uploaded_by_email FROM files LEFT JOIN users ON users.id = files.uploaded_by WHERE files.project_id = $1 AND files.task_id IS NULL ORDER BY files.created_at DESC;", [procejtId]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const uploadFileForProjectQuery = async (project_id: string, file_name: string, mime_type: string, size: number, uploaded_by_id: number, file_data?: Buffer) => {

    // Extract base name and extension (handles files without extensions)
    const lastDotIndex = file_name.lastIndexOf('.');
    const baseName = lastDotIndex === -1 ? file_name : file_name.substring(0, lastDotIndex);
    const extension = lastDotIndex === -1 ? '' : file_name.substring(lastDotIndex);

    // Check for existing files with similar names
    const existingFiles = await pool.query(
        "SELECT file_name FROM files WHERE project_id = $1 AND task_id IS NULL AND file_name LIKE $2 || '%'",
        [project_id, file_name.replace(/\.[^/.]+$/, "")]
    );

    let finalName = file_name;

    if (existingFiles.rows.length > 0) {
        // Find the highest existing number
        let maxNumber = 0;
        const numberRegex = /\((\d+)\)/;

        existingFiles.rows.forEach((file: any) => {
            const match = file.file_name.match(numberRegex);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNumber) maxNumber = num;
            }
        });

        finalName = `${baseName} (${maxNumber + 1})${extension}`;
    }

    const result = await pool.query("INSERT INTO files (project_id, file_name, mime_type, size, uploaded_by, file_data, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [project_id, finalName, mime_type, size, uploaded_by_id, file_data, new Date()]);
    return result.rows[0]
}

// task files querys
export const uploadFileForTaskQuery = async (project_id: string, file_name: string, mime_type: string, size: number, uploaded_by_id: number, task_id: string, file_data?: Buffer) => {

    // Extract base name and extension (handles files without extensions)
    const lastDotIndex = file_name.lastIndexOf('.');
    const baseName = lastDotIndex === -1 ? file_name : file_name.substring(0, lastDotIndex);
    const extension = lastDotIndex === -1 ? '' : file_name.substring(lastDotIndex);

    // Check for existing files with the same base name (case-insensitive)
    const existingFiles = await pool.query(
        "SELECT file_name FROM files WHERE task_id = $1 AND file_name LIKE $2 || '%'",
        [task_id, file_name.replace(/\.[^/.]+$/, "")]
    );

    let finalName = file_name;

    if (existingFiles.rows.length > 0) {
        // Find the highest existing number
        let maxNumber = 0;
        const numberRegex = /\((\d+)\)/;

        existingFiles.rows.forEach((file: any) => {
            const match = file.file_name.match(numberRegex);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNumber) maxNumber = num;
            }
        });

        finalName = `${baseName} (${maxNumber + 1})${extension}`;
    }

    const result = await pool.query("INSERT INTO files (project_id, file_name, mime_type, size, uploaded_by, task_id, file_data, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [project_id, finalName, mime_type, size, uploaded_by_id, task_id, file_data, new Date()]);
    return result.rows[0]
}

export const getAllFilesForTaskQuery = async (taskId: string) => {
    const result = await pool.query("SELECT files.*, users.name AS uploaded_by_name, users.email AS uploaded_by_email FROM files LEFT JOIN users ON users.id = files.uploaded_by WHERE files.task_id = $1 ORDER BY files.created_at DESC;", [taskId]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

// basic files querys
export const getFileByIdQuery = async (id: string) => {
    const result = await pool.query("SELECT * FROM files WHERE id = $1", [id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

export const downloadFileQuery = async (id: string) => {
    const result = await pool.query("SELECT file_data, file_name, mime_type FROM files WHERE id = $1", [id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

export const deleteFileQuery = async (id: string) => {
    await pool.query("DELETE FROM files WHERE id = $1 RETURNING *", [id]); // send a query to the database with one of the open connection from the pool
}