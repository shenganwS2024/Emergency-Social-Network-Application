import express from 'express';
import { createServer } from 'http';
import { userRoutes } from './config/index.js'
import connectDB from './config/database.js';
const app = express();
const http = createServer(app);

app.use(express.json());
app.use(express.static('public'));

connectDB();

//Configuration for session management
app.use(userRoutes);

export default http;
