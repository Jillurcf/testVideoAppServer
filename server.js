const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {};  // Store users with their socket IDs

io.on('connection', (socket) => {
    console.log('New client connected');

    // Register a user with their socket ID
    socket.on('register', (userId) => {
        users[userId] = socket.id;
        console.log(`User registered: ${userId}`);
    });

    // Handle user calling another user
    socket.on('call-user', ({ userToCall, from }) => {
        console.log(`${from} is calling ${userToCall}`);
        const socketIdToCall = users[userToCall];
        if (socketIdToCall) {
            io.to(socketIdToCall).emit('receive-call', { from });
        } else {
            console.log(`User ${userToCall} not found`);
        }
    });

    // Handle call being answered
    socket.on('answer-call', (data) => {
        console.log(`${data.from} accepted call from ${data.to}`);
        const socketIdFrom = users[data.from];
        if (socketIdFrom) {
            io.to(socketIdFrom).emit('call-accepted', data);
        } else {
            console.log(`User ${data.from} not found`);
        }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Express route for testing the call
app.get('/test-call', (req, res) => {
    const user2SocketId = users['user2']; // Assuming 'user2' is registered
    if (user2SocketId) {
        io.to(user2SocketId).emit('receive-call', { from: 'user1' });
        res.send('Call triggered to user2 from user1');
    } else {
        res.send('User2 not found');
    }
});

server.listen(5000, () => console.log('Server is running on port 5000'));
