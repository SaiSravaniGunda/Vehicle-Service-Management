const express = require('express');
const router = express.Router();
const Message = require('../models/message'); // Import the Message model

// POST route to submit the contact form
router.post('/submit-contact-form', async (req, res) => {
    try {
        // Create a new message from the form data
        
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }
        const newMessage = new Message({
            name,
            email,
            message
        });

        // Save the message in the database
        await newMessage.save();

        // Respond with a success message
        res.redirect('/');
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ success: false, message: 'There was an error sending your message.' });
    }
});

module.exports = router;
