const Task = require('../models/Task');
const Project = require('../models/Project');

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, project, assignedTo } = req.body;

    if (!title || !dueDate || !project) {
      return res.status(400).json({ message: 'Title, due date, and project are required' });
    }

    // Verify project exists and user is admin of it
    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (proj.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project admin can create tasks' });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      project,
      assignedTo: assignedTo || null
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Admin') {
      // Admin sees tasks for projects they created
      const projects = await Project.find({ admin: req.user.id }).select('_id');
      const projectIds = projects.map(p => p._id);
      tasks = await Task.find({ project: { $in: projectIds } })
        .populate('project', 'name')
        .populate('assignedTo', 'name email');
    } else {
      // Member sees tasks assigned to them
      tasks = await Task.find({ assignedTo: req.user.id })
        .populate('project', 'name')
        .populate('assignedTo', 'name email');
    }
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Admins can update everything, members can only update status if assigned
    if (req.user.role === 'Admin') {
      if (task.project.admin.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      const updatedTask = await Task.findByIdAndUpdate(id, { $set: req.body }, { new: true });
      return res.json(updatedTask);
    } else {
      // Member logic
      if (task.assignedTo && task.assignedTo.toString() === req.user.id) {
        // Members can only update status
        task.status = req.body.status || task.status;
        await task.save();
        return res.json(task);
      } else {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project admin can delete tasks' });
    }

    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
