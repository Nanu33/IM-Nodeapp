var { addColors, createLogger, format, transports } = require("winston")
// import config from "config";
const { combine, colorize, printf, timestamp } = format;

const logFormat = printf((info) => {
  return `[${info.timestamp}] ${info.level}: ${info.message}`;
});

const rawFormat = printf((info) => {
  return `[${info.timestamp}] ${info.level}: ${info.message}`;
});

// const config = require('../config');

const winstonlog = createLogger({
//   level: config.DEBUG,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat,
  ),
  transports: [
    new transports.File({
      filename: 'winston.log', format: combine(format.timestamp(), format.json())
    }),
    new transports.Console({ format: combine(timestamp(), 
      colorize(), rawFormat) }),
  ],
});

addColors({
  debug: 'white',
  error: 'red',
  info: 'green',
  warn: 'yellow',
});

module.exports = winstonlog;