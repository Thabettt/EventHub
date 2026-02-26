const winston = require("winston");

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    errors({ stack: true }), // Capture stack traces
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    process.env.NODE_ENV === "production" ? json() : devFormat,
  ),
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? combine(timestamp(), json())
          : combine(
              colorize(),
              timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
              devFormat,
            ),
    }),
  ],
});

module.exports = logger;
