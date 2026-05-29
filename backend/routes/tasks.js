const express = require('express');
const router = express.Router({ mergeParams: true }); // Parent router se projectId lene ke liye
const pool = require('../db');
const verifyToken = require('../middlewares/authMiddleware');

// Har request se pehle token verify karo
router.use(verifyToken);

// 1. GET ALL TASKS FOR A SPECIFIC PROJECT
router.get('/', async (req, res) => {
    try {
        const { projectId } = req.params;
        // Verify if the project belongs to the user (Security Check)
        const { userId } = req.user;
        const projectCheck = await pool.query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [projectId, userId]);
        if (projectCheck.rowCount === 0) return res.status(403).json({ error: 'Unauthorized access to this project' });

        const result = await pool.query(
            'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at ASC',
            [projectId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// 2. CREATE A NEW TASK IN A PROJECT
router.post('/', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, due_date } = req.body;
        
        if (!title) return res.status(400).json({ error: 'Task title is required' });

        const result = await pool.query(
            'INSERT INTO tasks (project_id, title, due_date) VALUES ($1, $2, $3) RETURNING *',
            [projectId, title, due_date || null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// 3. UPDATE TASK STATUS (Complete/Incomplete)
router.patch('/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body; // Expects 'complete' or 'incomplete'

        if (status !== 'complete' && status !== 'incomplete') {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
            [status, taskId]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// 4. DELETE A TASK
router.delete('/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;

        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING *',
            [taskId]
        );

        if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;