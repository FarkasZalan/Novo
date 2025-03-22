# CRUD Operations with Express and PostgreSQL (2025)

This project is a simple CRUD application built with **Express.js** and **PostgreSQL**. Below is a brief overview of the project structure and the purpose of each file.

---

## 🌟 Project Structure

### **`config/db.ts`**
- **Purpose**: Manages the PostgreSQL connection pool.
- **Details**: Creates a pool of database connections for efficient query execution.

### **`controller/userController.ts`**
- **Purpose**: Handles HTTP requests and responses.
- **Details**: Contains functions for creating, reading, updating, and deleting users. Uses a standardized response function (`handleResponse`) for consistent API responses.

### **`data/createUserTable.ts`**
- **Purpose**: Creates the `users` table in the database if it doesn’t exist.
- **Details**: Executes a SQL query to create the table with columns: `id`, `email`, `name`, and `created_at`.

### **`middlewares/errorHandler.ts`**
- **Purpose**: Centralized error handling.
- **Details**: Catches errors and sends a consistent error response to the client.

### **`middlewares/inputValidator.ts`**
- **Purpose**: Validates user input.
- **Details**: Uses **Joi** to validate `email` and `name` fields for creating and updating users.

### **`models/userModel.ts`**
- **Purpose**: Interacts with the database.
- **Details**: Contains functions for querying the database (e.g., `getAllUsers`, `createUser`, `updateUser`, `deleteUser`).

### **`routes/userRoutes.ts`**
- **Purpose**: Defines API routes.
- **Details**: Maps HTTP methods (POST, GET, PUT, DELETE) to controller functions.

### **`app.ts`**
- **Purpose**: Entry point of the application.
- **Details**: Sets up the Express app, configures middlewares (CORS, JSON parsing), and starts the server.