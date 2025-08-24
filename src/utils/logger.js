import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const logFiles = {
  requests: path.join(logsDir, 'requests.log'),
  errors: path.join(logsDir, 'errors.log'),
  general: path.join(logsDir, 'general.log')
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Helper function to get timestamp
const getTimestamp = () => {
  return new Date().toISOString();
};

// Helper function to format log message
const formatLogMessage = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };
  
  return JSON.stringify(logEntry);
};

// Helper function to write to file
const writeToFile = (filePath, message) => {
  try {
    fs.appendFileSync(filePath, message + '\n');
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
};

// Helper function to get colored console output
const getColoredOutput = (level, message) => {
  const timestamp = getTimestamp();
  let color = colors.white;
  
  switch (level.toLowerCase()) {
    case 'error':
      color = colors.red;
      break;
    case 'warn':
      color = colors.yellow;
      break;
    case 'info':
      color = colors.green;
      break;
    case 'debug':
      color = colors.cyan;
      break;
    case 'request':
      color = colors.blue;
      break;
    case 'response':
      color = colors.magenta;
      break;
  }
  
  return `${colors.bright}${color}[${timestamp}] ${level.toUpperCase()}:${colors.reset} ${message}`;
};

// Logger class
class Logger {
  static error(message, error = null, context = {}) {
    const logData = {
      ...context,
      ...(error && { 
        errorMessage: error.message,
        errorStack: error.stack,
        errorName: error.name
      })
    };
    
    const logMessage = formatLogMessage('ERROR', message, logData);
    
    // Console output
    console.error(getColoredOutput('ERROR', message));
    if (error) {
      console.error(getColoredOutput('ERROR', `Stack: ${error.stack}`));
    }
    
    // File output
    writeToFile(logFiles.errors, logMessage);
    writeToFile(logFiles.general, logMessage);
  }

  static warn(message, data = null) {
    const logMessage = formatLogMessage('WARN', message, data);
    
    console.warn(getColoredOutput('WARN', message));
    writeToFile(logFiles.general, logMessage);
  }

  static info(message, data = null) {
    const logMessage = formatLogMessage('INFO', message, data);
    
    console.info(getColoredOutput('INFO', message));
    writeToFile(logFiles.general, logMessage);
  }

  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = formatLogMessage('DEBUG', message, data);
      
      console.debug(getColoredOutput('DEBUG', message));
      writeToFile(logFiles.general, logMessage);
    }
  }

  static request(req, res, next) {
    const start = Date.now();
    
    // Log incoming request
    const requestLog = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      headers: req.headers,
      body: req.method !== 'GET' ? req.body : undefined,
      query: req.query,
      params: req.params
    };
    
    const requestMessage = formatLogMessage('REQUEST', 'Incoming request', requestLog);
    console.log(getColoredOutput('REQUEST', `${req.method} ${req.originalUrl} - IP: ${requestLog.ip}`));
    writeToFile(logFiles.requests, requestMessage);
    
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - start;
      
      const responseLog = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('Content-Length'),
        headers: res.getHeaders()
      };
      
      const responseMessage = formatLogMessage('RESPONSE', 'Response sent', responseLog);
      
      // Color code based on status
      let statusColor = colors.green;
      if (res.statusCode >= 400 && res.statusCode < 500) {
        statusColor = colors.yellow;
      } else if (res.statusCode >= 500) {
        statusColor = colors.red;
      }
      
      console.log(`${colors.bright}${statusColor}[${getTimestamp()}] RESPONSE:${colors.reset} ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
      writeToFile(logFiles.requests, responseMessage);
      
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  }

  static database(operation, query, params = null, duration = null, error = null) {
    const logData = {
      operation,
      query,
      ...(params && { params }),
      ...(duration && { duration: `${duration}ms` }),
      ...(error && { 
        errorMessage: error.message,
        errorStack: error.stack
      })
    };
    
    const logMessage = formatLogMessage('DATABASE', `Database ${operation}`, logData);
    
    if (error) {
      console.error(getColoredOutput('DATABASE', `Database ${operation} failed: ${error.message}`));
      writeToFile(logFiles.errors, logMessage);
    } else {
      console.log(getColoredOutput('DATABASE', `Database ${operation} completed in ${duration}ms`));
      writeToFile(logFiles.general, logMessage);
    }
  }

  static auth(action, userId = null, success = true, details = {}) {
    const logData = {
      action,
      ...(userId && { userId }),
      success,
      ...details
    };
    
    const logMessage = formatLogMessage('AUTH', `Authentication ${action}`, logData);
    
    if (success) {
      console.log(getColoredOutput('AUTH', `Authentication ${action} successful${userId ? ` for user ${userId}` : ''}`));
    } else {
      console.warn(getColoredOutput('AUTH', `Authentication ${action} failed${userId ? ` for user ${userId}` : ''}`));
    }
    
    writeToFile(logFiles.general, logMessage);
  }
}

export default Logger;
