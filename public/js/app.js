let currentUser = null;
let currentToken = null;
let allTasks = [];

document.addEventListener('DOMContentLoaded', async () => {
    currentToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!currentToken || !userStr) {
        window.location.href = '/';
        return;
    }

    currentUser = JSON.parse(userStr);
    document.getElementById('userNameDisplay').textContent = `Hello, ${currentUser.name} (${currentUser.role})`;
    
    // Set a human touch: initials in the avatar
    const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
    document.getElementById('userAvatar').textContent = initial;

    // Admin Specifics
    if (currentUser.role === 'Admin') {
        document.getElementById('adminControls').classList.remove('hidden');
        await loadUsersForSelect();
    }

    await loadProjects();
    await loadTasks();

    // Event Listeners
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    });

    document.getElementById('statusFilter').addEventListener('change', (e) => {
        renderTasks(e.target.value);
    });

    // Form Submits
    document.getElementById('createProjectForm').addEventListener('submit', handleCreateProject);
    document.getElementById('createTaskForm').addEventListener('submit', handleCreateTask);
});

// Modals
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// Fetch Logic
async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = {
        'Authorization': `Bearer ${currentToken}`
    };
    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`/api${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });

    if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Unauthorized');
    }

    return await res.json();
}

// Load Data
async function loadUsersForSelect() {
    try {
        const users = await apiCall('/auth/users');
        const assigneeSelect = document.getElementById('taskAssignee');
        users.forEach(user => {
            if(user.role === 'Member') {
                const opt = document.createElement('option');
                opt.value = user._id;
                opt.textContent = `${user.name} (${user.email})`;
                assigneeSelect.appendChild(opt);
            }
        });
    } catch(err) { console.error(err); }
}

async function loadProjects() {
    try {
        const projects = await apiCall('/projects');
        const projectSelect = document.getElementById('taskProject');
        projectSelect.innerHTML = ''; // clear
        projects.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p._id;
            opt.textContent = p.name;
            projectSelect.appendChild(opt);
        });
    } catch(err) { console.error(err); }
}

async function loadTasks() {
    try {
        allTasks = await apiCall('/tasks');
        updateStats();
        renderTasks('All');
    } catch(err) { console.error(err); }
}

function updateStats() {
    document.getElementById('totalTasks').textContent = allTasks.length;
    document.getElementById('completedTasks').textContent = allTasks.filter(t => t.status === 'Completed').length;
    document.getElementById('pendingTasks').textContent = allTasks.filter(t => t.status !== 'Completed').length;

    const today = new Date();
    today.setHours(0,0,0,0);
    const overdue = allTasks.filter(t => new Date(t.dueDate) < today && t.status !== 'Completed');
    document.getElementById('overdueTasks').textContent = overdue.length;
}

function renderTasks(filterStatus) {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';

    let filtered = allTasks;
    if (filterStatus !== 'All') {
        filtered = allTasks.filter(t => t.status === filterStatus);
    }

    if (filtered.length === 0) {
        tasksList.innerHTML = '<p class="loader">No tasks found.</p>';
        return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    filtered.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < today && task.status !== 'Completed';

        const card = document.createElement('div');
        // Let's add the glass-panel effect to the cards
        card.className = `task-card glass-panel status-${task.status.replace(' ', '').toLowerCase()} ${isOverdue ? 'overdue' : ''}`;

        let statusOptions = '';
        if (task.status !== 'Completed') {
            statusOptions = `
                <select onchange="updateTaskStatus('${task._id}', this.value)" class="form-control" style="width: auto; padding: 6px 10px; font-size: 13px;">
                    <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            `;
        } else {
            statusOptions = `<span class="task-badge text-success">Done! 🚀</span>`;
        }

        let deleteBtn = '';
        if(currentUser.role === 'Admin') {
            deleteBtn = `<button class="btn btn-sm text-danger" style="background:rgba(239, 68, 68, 0.1);border:1px solid rgba(239, 68, 68, 0.2);" onclick="deleteTask('${task._id}')">Remove</button>`;
        }

        card.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-badge">${task.status}</div>
            </div>
            <div class="task-desc">${task.description || 'No description provided. Hopefully it is self-explanatory!'}</div>
            <div class="task-meta">
                <div><strong>Project:</strong> ${task.project ? task.project.name : 'Unknown Project'}</div>
                <div><strong>Assignee:</strong> ${task.assignedTo ? task.assignedTo.name : 'Unassigned'}</div>
                <div><strong>Deadline:</strong> ${dueDate.toLocaleDateString()} ${isOverdue ? '<span class="text-danger">(Overdue! ⚠️)</span>' : ''}</div>
            </div>
            <div class="task-footer">
                ${statusOptions}
                ${deleteBtn}
            </div>
        `;
        tasksList.appendChild(card);
    });
}

// Handlers
async function handleCreateProject(e) {
    e.preventDefault();
    const name = document.getElementById('projName').value;
    const desc = document.getElementById('projDesc').value;

    console.log("Creating new project...", name);

    try {
        await apiCall('/projects', 'POST', { name, description: desc });
        closeModal('projectModal');
        document.getElementById('createProjectForm').reset();
        await loadProjects();
        // Just a simple alert for now, could use a toast library later
        alert('Awesome! Project created successfully 🚀');
    } catch(err) { 
        console.error("Ah snap, project creation failed:", err);
        alert('Error creating project. Check console.'); 
    }
}

async function handleCreateTask(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const desc = document.getElementById('taskDesc').value;
    const project = document.getElementById('taskProject').value;
    const assignedTo = document.getElementById('taskAssignee').value || null;
    const dueDate = document.getElementById('taskDueDate').value;

    try {
        await apiCall('/tasks', 'POST', { title, description: desc, project, assignedTo, dueDate });
        closeModal('taskModal');
        document.getElementById('createTaskForm').reset();
        await loadTasks();
    } catch(err) { 
        console.error("Failed to dispatch task:", err);
        alert('Error creating task.'); 
    }
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        await apiCall(`/tasks/${taskId}`, 'PUT', { status: newStatus });
        await loadTasks();
    } catch(err) { alert('Error updating status'); }
}

async function deleteTask(taskId) {
    if(confirm('Are you sure you want to delete this task?')) {
        try {
            await apiCall(`/tasks/${taskId}`, 'DELETE');
            await loadTasks();
        } catch(err) { alert('Error deleting task'); }
    }
}
