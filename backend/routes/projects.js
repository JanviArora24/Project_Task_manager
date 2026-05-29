const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middlewares/authMiddleware');

// Route: Har request se pehle token verify karo
router.use(verifyToken);

// 1. GET ALL PROJECTS (Sirf logged-in user ke projects)
router.get('/', async (req, res) => {
    try {
        const { userId } = req.user;
        const result = await pool.query(
            'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// 2. CREATE A NEW PROJECT
router.post('/', async (req, res) => {
    try {
        const { title, description } = req.body;
        const { userId } = req.user;

        if (!title) {
            return res.status(400).json({ error: 'Project title is required' });
        }

        const result = await pool.query(
            'INSERT INTO projects (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
            [userId, title, description]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// 3. DELETE A PROJECT
router.delete('/:id', async (req, res) => {
    try {
        const projectId = req.params.id;
        const { userId } = req.user;

        // Ensure user is deleting ONLY their own project
        const result = await pool.query(
            'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *',
            [projectId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Project not found or unauthorized' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;