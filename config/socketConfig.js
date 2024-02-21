import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const socketConfig = (server) => {
    const io = new Server(server);

    // io.use((socket, next) => {
    //     if (socket.handshake.query && socket.handshake.query.token) {
    //       jwt.verify(socket.handshake.query.token, 'fsesb2secretkey', (err, decoded) => {
    //         if (err) return next(new Error('Authentication error'));
    //         socket.decoded = decoded;
    //         next();
    //       });
    //     } else {
    //       next(new Error('Authentication error'));
    //     }
    // });
      

    io.on('connection', (socket) => {
        console.log('User connected');

        // socket.on('chat message', async (msg) => {
        //     io.emit('chat message', msg);
        //     await postNewMessage(msg);

        // });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    return io
};

export default socketConfig;