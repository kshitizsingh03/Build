Team Task Manager

This is a full stack web application I built to help teams organize projects and keep track of tasks efficiently. It has a role based access control system, so administrators can manage projects and assign tasks, while regular team members can log in, view what they need to work on, and update their task statuses in real time.

Features include:
- Secure login and registration using JSON Web Tokens and password hashing for safety.
- Two user roles: Admin and Member.
- The ability to create, view, update, and delete projects.
- Task assignment and status tracking.
- Due date tracking so you know when things are overdue.
- A responsive dashboard that works on different screen sizes and allows filtering.

Technologies used:
- For the frontend, I used HTML, CSS, and JavaScript.
- The backend is powered by Node.js and Express.
- Data is stored securely in MongoDB Atlas.

How to run it locally:
First, clone this repository to your machine. Then, open your terminal, navigate to the folder, and run "npm install" to get all the required dependencies.
You will need to create a .env file to store your environment variables. You need PORT, MONGODB_URI, and JWT_SECRET.
Once that is set up, you can run "npm start" to launch the server.

The live application is currently deployed and can be accessed at: https://team-task-manager-3tpf.onrender.com
