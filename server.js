import {express,app,http,io} from './config/serverConfig.js'
import { userRoutes, messageRoutes, speedTestRoutes, annoucementRoutes, searchRoutes, duelLobbyRoutes, duelGameRoutes, resourceNeedsRoutes, offerResourceRoutes} from './config/index.js'
import DBConnection from './config/database.js';
import { PRODUCTION_DB_URI, TEST_DB_URI } from './config/serverConfig.js';
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import dotenv from 'dotenv';
dotenv.config();

app.use(express.json())
app.use(express.static('views'))

// Common routes
const commonRoutes = [userRoutes, messageRoutes, speedTestRoutes, annoucementRoutes, searchRoutes, exerciseRoutes]

function initializeSentry() {
  Sentry.init({
    dsn: 'https://c7ff13503724cc1a1fbe24d1912d06bf@o4507020676431872.ingest.us.sentry.io/4507020687704064',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
  
  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());
  
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
  
  if (process.env.NODE_ENV !== 'test') {
      DBConnection.getInstance(PRODUCTION_DB_URI).then((connection) => {
      console.log('Database is connected');
      });
    }
  
  
  
  // app.use(checkSpeedTestMode);
  app.use(userRoutes);
  app.use(messageRoutes);
  app.use(speedTestRoutes);
  app.use(annoucementRoutes);
  app.use(searchRoutes);
  app.use(resourceNeedsRoutes);
  app.use(offerResourceRoutes);
  app.use(duelLobbyRoutes);
  app.use(duelGameRoutes);
  
  app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
  });
  
  app.use(Sentry.Handlers.errorHandler());
  
  // Optional fallthrough error handler
  app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + "\n");
  });
}

function connectToDatabase() {
  DBConnection.getInstance(PRODUCTION_DB_URI).then(() => {
    console.log('Database is connected')
  })
}

// app.use(checkSpeedTestMode);
app.use(userRoutes);
app.use(messageRoutes);
app.use(speedTestRoutes);
app.use(annoucementRoutes);
app.use(searchRoutes);
app.use(resourceNeedsRoutes);
app.use(offerResourceRoutes);
app.use(duelLobbyRoutes);
app.use(duelGameRoutes);

  app.use(Sentry.Handlers.errorHandler())

  app.use(function onError(err, req, res, next) {
    res.statusCode = 500
    res.end(res.sentry + '\n')
  })
}

if (process.env.NODE_ENV !== 'test') {
  initializeSentry()
  connectToDatabase()
}

initializeRoutes()

if (process.env.NODE_ENV !== 'test') {
  initializeSentryErrorHandling()
}

export { http, io, app, PRODUCTION_DB_URI, TEST_DB_URI }
