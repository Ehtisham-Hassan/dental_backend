# Logging System Documentation

This backend includes a comprehensive logging system that tracks all requests, responses, errors, and database operations.

## Features

- **Request/Response Logging**: Every HTTP request and response is logged with timing information
- **Error Logging**: All errors are logged with stack traces and context
- **Database Logging**: Database operations are logged with performance metrics
- **Authentication Logging**: Login attempts and authentication events are tracked
- **Colored Console Output**: Different log levels are color-coded for easy reading
- **File-based Logging**: All logs are saved to separate files for persistence
- **JSON Format**: Logs are stored in JSON format for easy parsing

## Log Files

The system creates three main log files in the `logs/` directory:

- `requests.log` - All HTTP requests and responses
- `errors.log` - All errors and exceptions
- `general.log` - General application logs (info, warnings, debug)

## Log Levels

- **ERROR**: Critical errors that need immediate attention
- **WARN**: Warning messages for potential issues
- **INFO**: General information about application flow
- **DEBUG**: Detailed debugging information (only in development)
- **REQUEST**: Incoming HTTP requests
- **RESPONSE**: Outgoing HTTP responses
- **DATABASE**: Database operations
- **AUTH**: Authentication events

## Usage

### Viewing Logs

```bash
# View general logs (last 50 entries)
npm run logs

# View specific log types
npm run logs:requests
npm run logs:errors
npm run logs:general

# View log statistics
npm run logs:stats

# View logs with custom parameters
node src/utils/logViewer.js [logType] [lines] [filter]

# Examples:
node src/utils/logViewer.js requests 100
node src/utils/logViewer.js errors 20 "database"
node src/utils/logViewer.js general 50 "login"
```

### Log Format

Each log entry is in JSON format:

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "message": "Login attempt successful",
  "data": {
    "userId": "123",
    "email": "user@example.com",
    "ip": "192.168.1.1"
  }
}
```

## Console Output

Logs are also displayed in the console with color coding:

- 🔴 **RED**: Errors
- 🟡 **YELLOW**: Warnings
- 🟢 **GREEN**: Info messages
- 🔵 **BLUE**: Requests
- 🟣 **MAGENTA**: Responses
- 🔵 **CYAN**: Debug messages

## Logging in Code

### Basic Logging

```javascript
import Logger from '../utils/logger.js';

// Info logging
Logger.info('User created successfully', { userId: 123, email: 'user@example.com' });

// Warning logging
Logger.warn('Rate limit approaching', { ip: req.ip, requests: 95 });

// Error logging
Logger.error('Database connection failed', error, { context: 'user creation' });

// Debug logging (only in development)
Logger.debug('Processing user data', { data: userData });
```

### Request Logging

The request logging middleware is automatically applied to all routes. It logs:

- HTTP method and URL
- Client IP address
- User agent
- Request headers
- Request body (for non-GET requests)
- Query parameters
- Response status code
- Response time
- Response headers

### Database Logging

Database operations are automatically logged with:

- Operation name
- Query details
- Parameters
- Execution time
- Success/failure status
- Error details (if failed)

### Authentication Logging

```javascript
// Successful login
Logger.auth('login', userId, true, { email, ip, role });

// Failed login
Logger.auth('login', null, false, { email, ip, reason: 'Invalid password' });

// Logout
Logger.auth('logout', userId, true, { ip });
```

## Configuration

### Environment Variables

The logging system respects these environment variables:

- `NODE_ENV`: Controls debug logging (only active in 'development')
- `LOG_LEVEL`: Set minimum log level (not currently implemented but can be added)

### Log File Management

Log files are automatically created in the `logs/` directory. For production environments, consider:

1. **Log Rotation**: Implement log rotation to prevent files from growing too large
2. **Log Retention**: Set up policies to delete old log files
3. **Log Monitoring**: Use tools like log aggregation services
4. **Sensitive Data**: Ensure sensitive information is not logged

## Security Considerations

- Passwords and sensitive data are automatically filtered from logs
- IP addresses are logged for security monitoring
- User IDs are logged for audit trails
- Consider GDPR compliance when logging user data

## Troubleshooting

### Logs Not Appearing

1. Check if the `logs/` directory exists
2. Ensure write permissions to the directory
3. Check if the server has started successfully

### Performance Impact

The logging system is designed to be lightweight, but in high-traffic scenarios:

1. Consider using async logging
2. Implement log buffering
3. Use log levels to reduce verbosity

### Log File Size

Monitor log file sizes and implement rotation if needed:

```bash
# Check log file sizes
ls -lh logs/

# View log statistics
npm run logs:stats
```
