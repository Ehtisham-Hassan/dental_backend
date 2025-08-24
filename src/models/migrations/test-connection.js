import dotenv from 'dotenv';
import { getSql } from '../database.js';

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('💡 Please create a .env file with your DATABASE_URL');
      process.exit(1);
    }

    console.log('✅ DATABASE_URL is configured');
    console.log(`📏 URL length: ${process.env.DATABASE_URL.length} characters`);

    const sql = getSql();

    // Test basic connection
    console.log('🔌 Testing basic connection...');
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful!');
    console.log(`🕐 Current database time: ${result[0].current_time}`);

    // Check if tables exist
    console.log('📋 Checking existing tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('⚠️ No tables found in database');
      console.log('💡 Run "npm run migrate" to create tables');
    } else {
      console.log('✅ Found tables:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // Check table counts if they exist
    const tableNames = ['practices', 'patients', 'claims', 'alerts', 'users', 'automation_logs'];
    
    for (const tableName of tableNames) {
      try {
        const countResult = await sql`SELECT COUNT(*) as count FROM ${sql(tableName)}`;
        console.log(`📊 ${tableName}: ${countResult[0].count} records`);
      } catch (error) {
        console.log(`⚠️ ${tableName}: Table does not exist`);
      }
    }

    console.log('✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    
    if (error.message.includes('fetch failed')) {
      console.log('💡 This might be a network connectivity issue');
      console.log('💡 Check your internet connection and DATABASE_URL');
    } else if (error.message.includes('authentication')) {
      console.log('💡 This might be an authentication issue');
      console.log('💡 Check your DATABASE_URL credentials');
    } else if (error.message.includes('does not exist')) {
      console.log('💡 This might be a database name issue');
      console.log('💡 Check your DATABASE_URL database name');
    }
    
    process.exit(1);
  }
}

testConnection();
