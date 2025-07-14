// Route to fetch all messages (Admin view) and return HTML response
const express = require('express');
const router = express.Router();
const Message = require('../models/message'); 
router.get('/messages', async (req, res) => {
    try {
        // Fetch all messages from the database
        const messages = await Message.find();

        // Start the HTML response
        let htmlResponse = `
            <html>
            <head>
                <title>Admin Messages</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    h1 {
                        text-align: center;
                    }
                    .message {
                        border: 1px solid #ccc;
                        padding: 10px;
                        margin-bottom: 10px;
                        border-radius: 5px;
                    }
                    .message strong {
                        display: block;
                        font-size: 1.2em;
                    }
                    .message p {
                        font-size: 1em;
                        margin: 5px 0;
                    }
                    .message .date {
                        font-size: 0.8em;
                        color: #888;
                    }
                </style>
            </head>
            <body>
                <h1>Messages from Users</h1>`;

        // If there are no messages, show a no messages message
        if (messages.length === 0) {
            htmlResponse += `
                <p>No messages to display.</p>
            `;
        } else {
            // Loop through the messages and append them to the HTML response
            messages.forEach((message) => {
                htmlResponse += `
                    <div class="message">
                        <strong>${message.name}</strong>
                        <p>${message.message}</p>
                        <p >${message.email}</p>
                        <p class="date">Received on: ${new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                `;
            });
        }

        // Close the HTML tags
        htmlResponse += `
            </body>
            </html>
        `;

        // Send the HTML response to the client
        res.send(htmlResponse);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Error retrieving messages');
    }
});

module.exports=router;
