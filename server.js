const express = require('express');
const http = require('http');
const {Server} = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 10e6 });

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.broadcast.emit("chat message", { id: 'system', text: "A new user has joined the chat" });

    socket.on('chat message', (msg) => {
        const payload = { id: socket.id, text: msg };
        io.emit('chat message', payload); // Broadcast to all clients with sender id
    })

    // Attachments
    socket.on('chat attachment', (attachment) => {
        // Just relay to everyone with sender id; in-memory only
        const payload = { id: socket.id, attachment };
        io.emit('chat attachment', payload);
    })

    // Typing indicators
    socket.on('typing', () => {
        socket.broadcast.emit('typing', { id: socket.id });
    });
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', { id: socket.id });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        // Ensure the typing indicator is cleared for this socket
        socket.broadcast.emit('stop typing', { id: socket.id });
    })
})
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
