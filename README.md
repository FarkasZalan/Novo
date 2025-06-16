# Novo Fullstack Task Manager (2025)

A powerful and scalable task management application built with Node.js (backend) and React (frontend), featuring PostgreSQL for data persistence, Redis for session storage, Stripe for payments, and a rich set of productivity features.

---

## 🚀 Overview

Novo empowers teams and individuals to organize projects, collaborate seamlessly, and stay on top of deadlines. With flexible authentication, robust project/task management, real-time notifications, and premium features, Novo is designed for both small teams and large organizations.

---

## 🧰 Tech Stack

* **Backend:** Node.js, Express
* **Frontend:** React, Vite
* **Database:** PostgreSQL
* **Cache & Session Store:** Redis (OAuth session storage)
* **Authentication & Validation:**

  * Email/password + OAuth (Google, GitHub)
  * Joi for request validation
  * JWT tokens for stateless authentication
  * reCAPTCHA on first app load 
* **File Uploads:** Multer
* **API Testing & Docs:** Swagger
* **Scheduling:** Cron jobs
* **Payments:** Stripe (with webhooks)
* **Email Notifications:** Nodemailer (Gmail SMTP)
* **Change Logging:** PostgreSQL triggers + audit tables

---

## ✨ Key Features

### 1. Authentication

* Register & login with email/password (with email verification).
* OAuth via Google or GitHub (available on non‑iOS devices).
* reCAPTCHA check on first app open to prevent bots.

### 2. Projects & Users

* Create unlimited projects.
* Add both registered and unregistered users to projects—invites auto-activate on signup.
* Role-based permissions: **Owner**, **Admin**, **Member**.

### 3. Tasks & Boards

* Create tasks with milestones, labels, subtasks, assignees, and due dates.
* View tasks in list mode or drag-and-drop kanban board.
* Organize by milestone; unmilestoned tasks appear in a unified list.

### 4. Files & Uploads

* Upload project- or task‑related files via Multer.
* Download and attach files directly in the UI.

### 5. Notifications & Emails

* Automatic email alerts for tasks/milestones due today or tomorrow:

  * Assigned users get task reminders.
  * Project owners get milestone reminders.
* Real-time comment notifications:

  * Notify involved users when comments are added or edited (excluding the commenter).

### 6. Comments & Change History

* Comment on tasks with full edit history.
* Audit all database changes via triggers; query logs in backend.

### 7. Subscriptions & Payments

* **Free plan:** Up to 5 project members, limited notifications.
* **Premium plan:** Unlimited members, enhanced notifications, and more.
* Stripe integration with test‑card support and webhooks for real‑time billing events.
* Graceful downgrade: Maintain premium features until the current period expires; allow re‑upgrade without double payment.

### 8. Roles & Permissions

| Role   | Permissions                                                                                   |
| ------ | --------------------------------------------------------------------------------------------- |
| Owner  | Full project control: update/delete project, manage tasks, milestones, labels, files, members |
| Admin  | Same as Owner, except cannot delete the project                                               |
| Member | View/download files, update personal task status                                              |

---

## 🛠️ Installation & Setup

### Prerequisites

* Node.js (v16+)
* npm or Yarn
* Docker & Docker Compose (for backend services)
* PostgreSQL database
* Redis server

### 1. Clone the Repository

```bash
git clone https://github.com/FarkasZalan/Novo.git
cd novo
```

### 2. Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories based on the provided `.env.example`:

```
# backend/.env
PORT=
DB_USER=
DB_HOST=
DATABASE=
DB_PORT=
DB_PASSWORD=
...

#### Frontend

```env
# frontend/.env
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_BACKEND_URL=
VITE_RECAPTCHA_SITE_KEY=
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Start Services

```bash
# Start backend (builds Docker containers for DB/Redis)
cd backend
docker-compose up --build

# Look for "${Table} created successfully" and " Connected to database" messages in console.

# In a new terminal, start frontend
cd frontend
npm run dev
```

---

## 🌐 Deployment

* **Backend:** Deployed on Render
* **Frontend:** Deployed on Vercel at `https://novo-hazel.vercel.app`

---

## ⚙️ Running Tests

* **Backend unit tests:**

  ```bash
  cd backend
  npm test
  ```

---

## 🧪 Testing API Endpoints

* Access Swagger UI at `http://localhost:5000/api-docs` (or configured port).
* Test all endpoints with live request examples.

---

*Happy task managing with Novo!*
