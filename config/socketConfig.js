import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import Users from '../models/Users.js'

const socketConfig = (server) => {
  const io = new Server(server);
  let userRoomMap = {};

  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token !== 'null') {
      jwt.verify(socket.handshake.query.token, 'fsesb2secretkey', (err, decoded) => {
        //console.log("err",err)
        if (err) return next(new Error('Authentication error'))
        socket.decoded = decoded
        next()
      })
    } else {
      next(new Error('Authentication error'))
    }
  })

  io.on('connection', (socket) => {
    let socket_username = socket.decoded.username;

    console.log(`User ${socket_username} connected`)
    if (socket.decoded && socket_username) {
      // Use async/await syntax
      Users.findOneAndUpdate({ username: socket_username}, { onlineStatus: true }, { new: true })
        .then((user) => {
          // Broadcast to all clients that the user list has been updated
          io.emit('userStatusChanged', {
            username: user.username,
            onlineStatus: user.onlineStatus,
          })
        })
        .catch((err) => console.error(err))
      socket.emit('updateInfo', `${socket_username} login`)
    }

    socket.on('joinPrivateRoom', ({ username, roomName }) => {
      socket.join(roomName);
      if (!userRoomMap[roomName]) {
        userRoomMap[roomName] = [];
      }
      userRoomMap[roomName].push(socket_username);
      console.log(`${socket_username} joined room ${roomName}`);

      const newValue = true;
      Users.findOneAndUpdate(
        { username: username },
        { $set: { [`ChatChecked.${roomName}`]: newValue }}, 
        { new: true }
      ).then(updatedDocument => {
        console.log('Updated document:', updatedDocument);
      }).catch(error => {
        console.error('Error updating the document:', error);
      });
    });

    socket.on('leavePrivateRoom', ({ username, roomName }) => {
      socket.leave(roomName);
      let users = userRoomMap[roomName];
      if (users.includes(socket_username)) {
        users.splice(users.indexOf(socket_username), 1);
        console.log(`User ${socket_username} left private room ${roomName}`)
        if (users.length === 0) {
          delete userRoomMap[roomName];
        }
      }
    });

    socket.on('privateMessagePostCheckChatChecked', ({ sender, receiver, message }) => {
      const roomName = [sender, receiver].sort().join('_');
      io.to(roomName).emit('privateMessage', message);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket_username} disconnected`)
      for (const [room, users] of Object.entries(userRoomMap)) {
        if (users.includes(socket_username)) {
          users.splice(users.indexOf(socket_username), 1);
          console.log(`User ${socket_username} disconnected from private room ${room}`)
          if (users.length === 0) {
            delete userRoomMap[room];
          }
        }
      }

      if (socket.decoded && socket_username) {
        Users.findOneAndUpdate({ username: socket_username }, { onlineStatus: false }, { new: true })
          .then((user) => {
            // Broadcast to all clients that the user list has been updated
            io.emit('userStatusChanged', {
              username: user.username,
              onlineStatus: user.onlineStatus,
              status: user.status,
            })
          })
          .catch((err) => console.error(err))
        socket.emit('updateInfo', `${socket_username} logout`)
      }
    })
  })

  return io
}

export default socketConfig
