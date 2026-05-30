require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks'); 

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/projects/:projectId/tasks', taskRoutes); 

// Base Test Route
app.get('/', (req, res) => {
    res.send('Bliss Internship Backend API is Live!');
});

// server.js mein ye change karo
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`🚀 Server running on port ${PORT}`);
});