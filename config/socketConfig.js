import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Users from '../models/Users.js';

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
        console.log(`User ${ socket.decoded.username} connected`);
        if (socket.decoded && socket.decoded.username) {
            // Use async/await syntax
            Users.findOneAndUpdate({ username: socket.decoded.username }, { onlineStatus: true }, { new: true })
            .then(user => {
                // Broadcast to all clients that the user list has been updated
                io.emit('userStatusChanged', { username: user.username, onlineStatus: user.onlineStatus, status: user.status});
            })
            .catch(err => console.error(err));
            socket.emit('updateInfo', `${socket.decoded.username} login`);
        }
    
        socket.on('chat message', async (msg) => {
            io.emit('chat message', msg);
        });
    
        socket.on('disconnect', () => {
            console.log(`User ${ socket.decoded.username} disconnected`);
            if (socket.decoded && socket.decoded.username) {
                Users.findOneAndUpdate({ username: socket.decoded.username }, { onlineStatus: false }, { new: true })
                .then(user => {
                    // Broadcast to all clients that the user list has been updated
                    io.emit('userStatusChanged', { username: user.username, onlineStatus: user.onlineStatus, status: user.status });
                })
                .catch(err => console.error(err));
                socket.emit('updateInfo', `${socket.decoded.username} logout`);
            }
        });
    });
    
    return io
};

 export default socketConfig;
