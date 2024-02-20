import { Server } from 'socket.io';

const socketConfig = (server) => {
    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });

        // Add more event listeners as needed
    });

    return io;
};

export default socketConfig;
