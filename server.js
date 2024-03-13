
import {express,app,http,io} from './config/serverConfig.js'

import { userRoutes, messageRoutes } from './config/index.js'
import DBConnection from './config/database.js';



app.use(express.json());
app.use(express.static('views'));




if (process.env.NODE_ENV !== 'test') {
    const DBUri = 'mongodb+srv://yus2:1111@fse.dty3o9p.mongodb.net/ESN';
    DBConnection.getInstance(DBUri).then((connection) => {
    console.log('Database is connected');
    });
  }

//Configuration for session management
app.use(userRoutes);
app.use(messageRoutes);

export {http,io, app};
