import { express, app, http, io } from './config/serverConfig.js'
import {
  userRoutes,
  messageRoutes,
  speedTestRoutes,
  annoucementRoutes,
  searchRoutes,
  exerciseRoutes,
} from './config/index.js'
import DBConnection from './config/database.js'
import { PRODUCTION_DB_URI, TEST_DB_URI } from './config/serverConfig.js'
import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

app.use(express.json())
app.use(express.static('views'))

if (process.env.NODE_ENV !== 'test') {
  Sentry.init({
    dsn: 'https://c7ff13503724cc1a1fbe24d1912d06bf@o4507020676431872.ingest.us.sentry.io/4507020687704064',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  })

  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler())

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler())

  if (process.env.NODE_ENV !== 'test') {
    DBConnection.getInstance(PRODUCTION_DB_URI).then((connection) => {
      console.log('Database is connected')
    })
  }

  // app.use(checkSpeedTestMode);
  app.use(userRoutes)
  app.use(messageRoutes)
  app.use(speedTestRoutes)
  app.use(annoucementRoutes)
  app.use(searchRoutes)
  app.use(exerciseRoutes)

  app.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error('My first Sentry error!')
  })

  app.use(Sentry.Handlers.errorHandler())

  // Optional fallthrough error handler
  app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500
    res.end(res.sentry + '\n')
  })
}

// app.use(checkSpeedTestMode);
app.use(userRoutes)
app.use(messageRoutes)
app.use(speedTestRoutes)
app.use(annoucementRoutes)
app.use(searchRoutes)
app.use(exerciseRoutes)

export { http, io, app, PRODUCTION_DB_URI, TEST_DB_URI }
