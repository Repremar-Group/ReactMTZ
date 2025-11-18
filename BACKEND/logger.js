// logger.js
const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const { combine, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    format.timestamp({
      format: () => {
        const now = new Date();
        return now.toLocaleString("es-UY", {
          timeZone: "America/Montevideo",
          hour12: false
        });
      }
    }),
    logFormat
  ),
  transports: [
    new DailyRotateFile({
      filename: "logs/backend-%DATE%.log",     
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxFiles: "7d",                       
      createSymlink: true,                     
      symlinkName: "backend.log",              
      level: "info"
    }),

    new transports.Console()
  ]
});

module.exports = logger;