import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const socketConfig = (server) => {
    const io = new Server(server);

    io.use((socket, next) => {
        console.log("gimme token",socket.handshake.query.token)
        if (socket.handshake.query && socket.handshake.query.token !== 'null') {
          jwt.verify(socket.handshake.query.token, 'fsesb2secretkey', (err, decoded) => {
            console.log("err",err)
            if (err) return next(new Error('Authentication error'));
            console.log("whyhhhh")
            socket.decoded = decoded;
            next();
          });
        } else {
          next(new Error('Authentication error'));
        }
    });
      

    io.on('connection', (socket) => {
        console.log('User connected');
        if (socket.decoded && socket.decoded.name) {
            socket.emit('updateInfo', `${socket.decoded.name} login`);
        }

        socket.on('chat message', async (msg) => {
            io.emit('chat message', msg);

        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
            if (socket.decoded && socket.decoded.name) {
                socket.emit('updateInfo', `${socket.decoded.name} logout`);
            }
        });
    });
    return io
};

export default socketConfig;