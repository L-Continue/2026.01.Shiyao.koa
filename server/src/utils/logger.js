const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// 确保日志目录存在
const logDir = path.join(__dirname, '../../', config.log.dir);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 配置winston日志器
const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['timestamp', 'level', 'message'] })
  ),
  defaultMeta: { service: 'shiyao-space-server' },
  transports: [
    // 文件输出
    new winston.transports.File({
      filename: path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`),
      format: winston.format.combine(
        winston.format.json()
      ),
      maxsize: config.log.maxsize,
      maxFiles: config.log.maxFiles
    }),
    // 终端输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, metadata }) => {
          let logMessage = `${timestamp} [${level}] ${message}`;
          if (Object.keys(metadata).length > 0) {
            logMessage += ' ' + JSON.stringify(metadata);
          }
          return logMessage;
        })
      )
    })
  ]
});

// 导出日志器
module.exports = logger;
