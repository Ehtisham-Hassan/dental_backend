import { neon } from '@neondatabase/serverless';
import Logger from '../utils/logger.js';

let sql = null;

export function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
    Logger.error('Database initialization failed', error);
    throw error;
  }
  
  if (!sql) {
    try {
      sql = neon(process.env.DATABASE_URL);
      Logger.info('Database connection initialized successfully');
    } catch (error) {
      Logger.error('Failed to initialize database connection', error);
      throw error;
    }
  }
  
  return sql;
}

export function getSql() {
  if (!sql) {
    return initializeDatabase();
  }
  return sql;
}

// For backward compatibility
export { getSql as sql };
