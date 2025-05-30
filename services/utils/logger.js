const winston = require('winston');
const Sentry = require('@sentry/node');

// Initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
  });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${service || 'SYSTEM'}] ${level}: ${message} ${metaStr}`;
  })
);

// File format
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat
    }),
    
    // File transports
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat
    })
  ]
});

// Custom methods for different services
const createServiceLogger = (serviceName) => {
  return {
    info: (message, meta = {}) => logger.info(message, { service: serviceName, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { service: serviceName, ...meta }),
    error: (message, meta = {}) => {
      logger.error(message, { service: serviceName, ...meta });
      // Send to Sentry if configured
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(new Error(message), {
          tags: { service: serviceName },
          extra: meta
        });
      }
    },
    debug: (message, meta = {}) => logger.debug(message, { service: serviceName, ...meta })
  };
};

module.exports = {
  logger,
  createServiceLogger
}; 