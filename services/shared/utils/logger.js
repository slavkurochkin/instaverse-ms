/**
 * Simple logger utility
 * Can be extended to use Winston or other logging libraries
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

class Logger {
  constructor(serviceName) {
    this.serviceName = serviceName;
  }

  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      service: this.serviceName,
      level,
      message,
      ...meta,
    };

    const formattedMessage = `[${timestamp}] [${this.serviceName}] [${level}] ${message}`;

    switch (level) {
      case LOG_LEVELS.ERROR:
        console.error(formattedMessage, meta);
        break;
      case LOG_LEVELS.WARN:
        console.warn(formattedMessage, meta);
        break;
      case LOG_LEVELS.INFO:
        console.info(formattedMessage, meta);
        break;
      case LOG_LEVELS.DEBUG:
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedMessage, meta);
        }
        break;
      default:
        console.log(formattedMessage, meta);
    }

    return logEntry;
  }

  error(message, meta = {}) {
    return this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    return this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    return this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    return this.log(LOG_LEVELS.DEBUG, message, meta);
  }
}

export default Logger;

// Create a default logger
export const createLogger = (serviceName) => new Logger(serviceName);

