const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

// 1. MOCK OTP GENERATE API (Frontend se call hoga)
router.post('/login', async (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.status(400).json({ error: 'Phone number is required' });

    // Hack: Real SMS bhejne ki jagah console me OTP print karo (Saves time & money)
    const otp = '123456'; 
    console.log(`\n📲 MOCK SMS: OTP for ${phone_number} is ${otp}\n`);

    res.json({ message: 'OTP sent successfully (Check server console)', phone_number });
});

// 2. VERIFY OTP & CREATE/LOGIN USER
router.post('/verify', async (req, res) => {
    const { phone_number, otp } = req.body;

    if (otp !== '123456') return res.status(400).json({ error: 'Invalid OTP' });

    try {
        // Check if user already exists
        let result = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
        let user = result.rows[0];

        // If new user, create entry in database
        if (!user) {
            const insertResult = await pool.query(
                'INSERT INTO users (phone_number) VALUES ($1) RETURNING *',
                [phone_number]
            );
            user = insertResult.rows[0];
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ message: 'Login successful', token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;