import {express,app,http,io} from './config/serverConfig.js'
import { userRoutes, messageRoutes, speedTestRoutes } from './config/index.js'
import DBConnection from './config/database.js';
import { PRODUCTION_DB_URI, TEST_DB_URI } from './config/serverConfig.js';
// import { checkSpeedTestMode } from './controllers/switchStateController.js';

app.use(express.json());
app.use(express.static('views'));

if (process.env.NODE_ENV !== 'test') {
    DBConnection.getInstance(PRODUCTION_DB_URI).then((connection) => {
    console.log('Database is connected');
    });
  }


// app.use(checkSpeedTestMode);
app.use(userRoutes);
app.use(messageRoutes);
app.use(speedTestRoutes);

export {http,io, app, PRODUCTION_DB_URI, TEST_DB_URI};
