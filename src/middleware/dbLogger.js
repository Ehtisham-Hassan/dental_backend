import Logger from '../utils/logger.js';

// Database logging middleware
export const withDbLogging = (operation) => {
  return async (...args) => {
    const start = Date.now();
    try {
      const result = await operation(...args);
      const duration = Date.now() - start;
      
      Logger.database(
        operation.name || 'database_operation',
        'Query executed successfully',
        { args: args.length },
        duration
      );
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      Logger.database(
        operation.name || 'database_operation',
        'Query failed',
        { args: args.length },
        duration,
        error
      );
      
      throw error;
    }
  };
};

// Wrapper for database service methods
export const wrapDbService = (dbService) => {
  const wrappedService = {};
  
  for (const [methodName, method] of Object.entries(dbService)) {
    if (typeof method === 'function') {
      wrappedService[methodName] = withDbLogging(method);
    } else {
      wrappedService[methodName] = method;
    }
  }
  
  return wrappedService;
};
