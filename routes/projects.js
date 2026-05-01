const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { auth, isAdmin } = require('../middleware/auth');

router.post('/', auth, isAdmin, projectController.createProject);
router.get('/', auth, projectController.getProjects);
router.put('/:id', auth, isAdmin, projectController.updateProject);
router.delete('/:id', auth, isAdmin, projectController.deleteProject);

module.exports = router;
