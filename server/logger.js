// Structured logs with pino: JSON lines in production (one object per event, easy to search
// with journalctl or ship to a log service) and readable colored output in development.
const pino = require('pino')
const config = require('./config')

const logger = pino({
  level: config.logLevel,
  // Never write credentials or session tokens to the logs
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.password2', '*.token'],
    censor: '[redacted]',
  },
  // pino-pretty is a dev dependency, so it is not installed in production
  ...(!config.isProduction &&
    !config.isTest && {
      transport: {
        target: 'pino-pretty',
        options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname,req,res,responseTime' },
      },
    }),
})

module.exports = logger
