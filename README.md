# Team Task Manager

## Project Overview
Team Task Manager is a full-stack web application designed to help teams organize projects and track tasks efficiently. It features a role-based access control system, allowing administrators to manage projects and assign tasks, while team members can view their assignments and update task statuses in real-time.

## Features
- Secure user authentication with JWT and password hashing
- Role-based access control (Admin and Member roles)
- Create, view, update, and delete projects
- Task assignment and tracking with statuses (Pending, In Progress, Completed)
- Due date tracking and overdue highlighting
- Responsive dashboard with task filtering

## Tech Stack
- Frontend: HTML, CSS (Custom styling, Flexbox/Grid), JavaScript
- Backend: Node.js, Express
- Database: MongoDB (Atlas)

## Installation Steps
1. Clone the repository to your local machine.
2. Navigate into the project directory.
3. Install the required dependencies using the following command:
   npm install
4. Create a `.env` file in the root directory and add your environment variables (see below).
5. Start the development server using:
   npm start

## Environment Variables
To run this project, you will need to add the following environment variables to your .env file:
- PORT=5000 (or your preferred port)
- MONGODB_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret_key

## API Endpoints

### Auth
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Authenticate a user
- GET `/api/auth/users` - Get list of users (Requires auth)

### Projects
- POST `/api/projects` - Create a new project (Admin only)
- GET `/api/projects` - Get all accessible projects
- PUT `/api/projects/:id` - Update a project (Admin only)
- DELETE `/api/projects/:id` - Delete a project (Admin only)

### Tasks
- POST `/api/tasks` - Create a task (Admin only)
- GET `/api/tasks` - Get all accessible tasks
- PUT `/api/tasks/:id` - Update task status
- DELETE `/api/tasks/:id` - Delete a task (Admin only)

## Deployment Link
Live Application: [Replace with live deployed URL once deployed on Railway]
