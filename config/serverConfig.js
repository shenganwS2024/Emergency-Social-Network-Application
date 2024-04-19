import express from 'express';
import { createServer } from 'http';
import socketConfig from './socketConfig.js'

const app = express();
const http = createServer(app);

const io = socketConfig(http);

const PRODUCTION_DB_URI = 'mongodb+srv://yus2:1111@fse.dty3o9p.mongodb.net/ESN';
const TEST_DB_URI = 'mongodb+srv://yus2:1111@fse.dty3o9p.mongodb.net/ESNtest';

export {express,app,http,io, PRODUCTION_DB_URI, TEST_DB_URI}