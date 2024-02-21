
import {express,app,http,io} from './config/serverConfig.js'

import { userRoutes, messageRoutes } from './config/index.js'
import connectDB from './config/database.js';



app.use(express.json());
app.use(express.static('public'));

connectDB();

//Configuration for session management
app.use(userRoutes);
app.use(messageRoutes);

export {http,io};
