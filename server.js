import express from 'express';
import { createServer } from 'http';
import { userRoutes, messageRoutes } from './config/index.js'
import connectDB from './config/database.js';
import socketConfig from './config/socketConfig.js'

const app = express();
const http = createServer(app);

const io = socketConfig(http);
app.use(express.json());
app.use(express.static('public'));

connectDB();

//Configuration for session management
app.use(userRoutes);
app.use(messageRoutes);

export {http,io};
