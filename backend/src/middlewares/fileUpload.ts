import multer from "multer";

// multer is a middleware for handling file uploads
// because multer is parsing the incoming multipart/form-data requests what the node js can't handle by default
// and with multer the file is available as req.file

// the memory storage is used to store the file in memory (RAM) instead of the disk so that the file can be accessed directly to save it to the database
// postgre accept binary data (BYTEA) as a Buffer and the memory storage is gives us a Buffer what we can insert into the database directly

// but obviously the memory storage is not suitable for large files because it will consume a lot of memory and will cause the server to crash
// but in this project we don't need to store large files so we can use the memory storage
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});