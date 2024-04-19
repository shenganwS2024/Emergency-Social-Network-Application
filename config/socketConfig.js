import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { Users } from '../models/Users.js'
import { userNotificationMap } from './globalVariables.js'
import { eventManager } from '../controllers/EventManager.js'

const authenticateSocket = (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token !== 'null') {
    jwt.verify(socket.handshake.query.token, 'fsesb2secretkey', (err, decoded) => {
      if (err) return next(new Error('Authentication error'))
      socket.decoded = decoded
      next()
    })
  } else {
    next(new Error('Authentication error'))
  }
}

const handleNotificationConnection = (socket) => {
  const username = socket.decoded?.username

  if (username) {
    // Map username to socket ID for notifications
    userNotificationMap.set(username, socket.id)
    console.log(`Notification handler connected: ${username} with socket ID ${socket.id}`)

    socket.on('disconnect', () => {
      // Remove the username from the notification map upon disconnection
      userNotificationMap.delete(username)
      console.log(`Notification handler disconnected: ${username}`)
    })
  }
}

const handleUserConnection = async (socket, username, io) => {
  try {
    const user = await Users.findOneAndUpdate({ username }, { onlineStatus: true }, { new: true })
    io.emit('userStatusChanged', { username: user.username, onlineStatus: true })
    socket.emit('updateInfo', `${username} login`)
  } catch (err) {
    console.error(err)
  }
}

const handleUserDisconnection = async (socket, username, io) => {
  try {
    const user = await Users.findOneAndUpdate({ username }, { onlineStatus: false }, { new: true })
    if (user) {
      io.emit('userStatusChanged', { username: user.username, onlineStatus: false })
      socket.emit('updateInfo', `${username} logout`)
    }
  } catch (err) {
    console.error(err)
  }
}

const handleConnection = async (socket, io, userRoomMap) => {
  const socket_username = socket.decoded?.username
  console.log(`User ${socket_username} connected`)

  if (socket_username) {
    await handleUserConnection(socket, socket_username, io)
  }

  eventManager.subscribe('new exercise', (exercise) => {
    socket.emit('new exercise', exercise)
  })

  socket.on('disconnect', () => handleDisconnection(socket, io, userRoomMap, socket_username))
}

const handleDisconnection = async (socket, io, userRoomMap, socket_username) => {
  console.log(`User ${socket_username} disconnected`)
  handleRoomDisconnections(socket_username, userRoomMap)
  if (socket_username) {
    await handleUserDisconnection(socket, socket_username, io)
  }
}

const handleRoomDisconnections = (socket_username, userRoomMap) => {
  Object.entries(userRoomMap).forEach(([room, users]) => {
    if (users.includes(socket_username)) {
      users.splice(users.indexOf(socket_username), 1)
      console.log(`User ${socket_username} disconnected from private room ${room}`)
    }
  })
}

const socketConfig = (server) => {
  const io = new Server(server)
  let userRoomMap = {}

  io.use(authenticateSocket)
  io.on('connection', (socket) => {
    handleConnection(socket, io, userRoomMap)
    handleNotificationConnection(socket)
  })

  return io
}

export default socketConfig
