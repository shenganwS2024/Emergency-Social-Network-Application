import { express, app, http, io } from './config/serverConfig.js'
import {
  userRoutes,
  messageRoutes,
  speedTestRoutes,
  annoucementRoutes,
  searchRoutes,
  duelLobbyRoutes,
  duelGameRoutes,
  resourceNeedsRoutes,
  offerResourceRoutes,
  exerciseRoutes,
} from './config/index.js'
import DBConnection from './config/database.js'
import { PRODUCTION_DB_URI, TEST_DB_URI } from './config/serverConfig.js'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import dotenv from 'dotenv'

dotenv.config()
app.use(express.json())
app.use(express.static('views'))

function initializeSentry() {
  if (process.env.NODE_ENV !== 'test') {
    Sentry.init({
      dsn: 'https://c7ff13503724cc1a1fbe24d1912d06bf@o4507020676431872.ingest.us.sentry.io/4507020687704064',
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    })

    app.use(Sentry.Handlers.requestHandler())
    app.use(Sentry.Handlers.tracingHandler())
  }
}

async function connectToDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    try {
      await DBConnection.getInstance(PRODUCTION_DB_URI)
      console.log('Database is connected')
    } catch (error) {
      console.error('Error connecting to the database:', error)
    }
  }
}

function registerRoutes() {
  app.use(userRoutes)
  app.use(messageRoutes)
  app.use(speedTestRoutes)
  app.use(annoucementRoutes)
  app.use(searchRoutes)
  app.use(resourceNeedsRoutes)
  app.use(offerResourceRoutes)
  app.use(duelLobbyRoutes)
  app.use(duelGameRoutes)
  app.use(exerciseRoutes)
}

function setupSentryDebugRoute() {
  app.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error('My first Sentry error!')
  })
}

function setupSentryErrorHandler() {
  app.use(Sentry.Handlers.errorHandler())

  app.use(function onError(err, req, res, next) {
    res.statusCode = 500
    res.end(res.sentry + '\n')
  })
}

initializeSentry()
connectToDatabase()
registerRoutes()
setupSentryDebugRoute()
setupSentryErrorHandler()

export { http, io, app, PRODUCTION_DB_URI, TEST_DB_URI }
