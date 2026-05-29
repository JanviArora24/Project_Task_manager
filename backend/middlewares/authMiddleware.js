const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    // Frontend token ko headers mein bhejega
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" se sirf token nikalna

    if (!token) {
        return res.status(401).json({ error: 'Access Denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // verified payload me { userId: ... } hoga
        next(); // Agar token sahi hai, toh aage API run hone do
    } catch (error) {
        res.status(403).json({ error: 'Invalid or Expired Token.' });
    }
};

module.exports = verifyToken;