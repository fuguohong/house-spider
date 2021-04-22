const winston = require('winston')
const util = require('util')
const config = require('./config')
const path = require('path')

const { format } = winston

const logger = winston.createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    format.errors({ stack: true }),
    format.splat(),
    // format.colorize({ level: true }),
    format.printf(info => {
      if (typeof info.message !== 'string') {
        info.message = util.format('%o', info.message)
      }
      // if (info.stack && info.code) {
      //   info.stack = `code: ${info.code},${info.stack}`
      // }
      return `${info.level} ${info.timestamp} ${info.message} ${info.stack || ''}`
    })
  ),
  transports: [
    new winston.transports.Console({
      level: config.consoleLevel
    }),
    new winston.transports.File({
      filename: path.join(config.logDir, 'out.log'),
      level: config.fileLevel
    }),
    new winston.transports.File({
      filename: path.join(config.logDir, 'error.log'),
      level: 'error'
    })
  ]
})

module.exports = logger
