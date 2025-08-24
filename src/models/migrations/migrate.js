import dotenv from 'dotenv';
import { getSql } from '../database.js';

// Load environment variables
dotenv.config();

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    const sql = getSql();

    // Create practices table
    console.log('📋 Creating practices table...');
    await sql`
      CREATE TABLE IF NOT EXISTS practices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        system_type VARCHAR(50) NOT NULL,
        api_credentials JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create patients table
    console.log('👥 Creating patients table...');
    await sql`
      CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        practice_id UUID REFERENCES practices(id),
        external_id VARCHAR(255),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        insurance_info JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create claims table
    console.log('📄 Creating claims table...');
    await sql`
      CREATE TABLE IF NOT EXISTS claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        practice_id UUID REFERENCES practices(id),
        patient_id UUID REFERENCES patients(id),
        external_claim_id VARCHAR(255),
        insurer_name VARCHAR(255),
        treatment_code VARCHAR(50),
        treatment_description TEXT,
        submitted_amount DECIMAL(10,2),
        expected_amount DECIMAL(10,2),
        received_amount DECIMAL(10,2),
        status VARCHAR(50),
        submission_date DATE,
        payment_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create alerts table
    console.log('🔔 Creating alerts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        practice_id UUID REFERENCES practices(id),
        related_claim_id UUID REFERENCES claims(id),
        related_patient_id UUID REFERENCES patients(id),
        alert_type VARCHAR(50),
        message TEXT,
        priority VARCHAR(20),
        is_resolved BOOLEAN DEFAULT FALSE,
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create automation_logs table
    console.log('🤖 Creating automation_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS automation_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        practice_id UUID REFERENCES practices(id),
        automation_type VARCHAR(50),
        status VARCHAR(20),
        details JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create users table
    console.log('👤 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        practice_id UUID REFERENCES practices(id),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes for better performance
    console.log('⚡ Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_claims_practice_id ON claims(practice_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_claims_insurer ON claims(insurer_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_claims_submission_date ON claims(submission_date)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_patients_practice_id ON patients(practice_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_alerts_practice_id ON alerts(practice_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_alerts_claim_id ON alerts(related_claim_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_alerts_priority ON alerts(priority)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_users_practice_id ON users(practice_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_automation_logs_practice_id ON automation_logs(practice_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_automation_logs_type ON automation_logs(automation_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON automation_logs(created_at)`;

    console.log('✅ Database migrations completed successfully!');
    console.log('📊 Tables created: practices, patients, claims, alerts, automation_logs, users');
    console.log('⚡ Indexes created for optimal performance');
    
  } catch (error) {
    console.error('❌ Failed to run migrations:', error);
    process.exit(1);
  }
}

runMigrations();
