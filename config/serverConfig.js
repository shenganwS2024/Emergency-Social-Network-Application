import express from 'express';
import { createServer } from 'http';
import socketConfig from './socketConfig.js'

const app = express();
const http = createServer(app);

const io = socketConfig(http);

export {express,app,http,io}