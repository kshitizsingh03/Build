const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth, isAdmin } = require('../middleware/auth');

router.post('/', auth, isAdmin, taskController.createTask);
router.get('/', auth, taskController.getTasks);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, isAdmin, taskController.deleteTask);

module.exports = router;
