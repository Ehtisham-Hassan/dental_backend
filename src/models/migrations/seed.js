import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { getSql } from '../database.js';

// Load environment variables
dotenv.config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    const sql = getSql();

    // Create sample practices
    console.log('🏥 Creating sample practices...');
    const practice1 = await sql`
      INSERT INTO practices (name, system_type, api_credentials)
      VALUES ('Downtown Dental', 'easy_dental', '{"api_key": "test_key_1", "api_secret": "test_secret_1"}')
      RETURNING *
    `;

    const practice2 = await sql`
      INSERT INTO practices (name, system_type, api_credentials)
      VALUES ('Uptown Dental', 'dentemax', '{"api_key": "test_key_2", "api_secret": "test_secret_2"}')
      RETURNING *
    `;

    // Create sample users
    console.log('👤 Creating sample users...');
    const passwordHash = await bcrypt.hash('password123', 12);

    try {
      const user1 = await sql`
        INSERT INTO users (practice_id, email, password_hash, role, first_name, last_name)
        VALUES (${practice1[0].id}, 'admin@downtowndental.com', ${passwordHash}, 'admin', 'Admin', 'User')
        RETURNING *
      `;
      console.log('✅ User 1 created:', user1[0].email);
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        console.log('⚠️ User 1 already exists, skipping...');
      } else {
        throw error;
      }
    }

    try {
      const user2 = await sql`
        INSERT INTO users (practice_id, email, password_hash, role, first_name, last_name)
        VALUES (${practice2[0].id}, 'admin@uptowndental.com', ${passwordHash}, 'admin', 'Admin', 'User')
        RETURNING *
      `;
      console.log('✅ User 2 created:', user2[0].email);
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        console.log('⚠️ User 2 already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Create sample patients
    console.log('👥 Creating sample patients...');
    const patients = await sql`
      INSERT INTO patients (practice_id, external_id, first_name, last_name, email, phone, insurance_info)
      VALUES 
        (${practice1[0].id}, 'PAT001', 'John', 'Doe', 'john.doe@email.com', '(555) 123-4567', '{"provider": "Delta Dental", "member_id": "123456789", "group_number": "ABC123"}'),
        (${practice1[0].id}, 'PAT002', 'Jane', 'Smith', 'jane.smith@email.com', '(555) 234-5678', '{"provider": "Blue Cross", "member_id": "987654321", "group_number": "XYZ789"}'),
        (${practice2[0].id}, 'PAT003', 'Mike', 'Johnson', 'mike.johnson@email.com', '(555) 345-6789', '{"provider": "Aetna", "member_id": "456789123", "group_number": "DEF456"}'),
        (${practice2[0].id}, 'PAT004', 'Sarah', 'Williams', 'sarah.williams@email.com', '(555) 456-7890', '{"provider": "Cigna", "member_id": "789123456", "group_number": "GHI789"}'),
        (${practice1[0].id}, 'PAT005', 'David', 'Brown', 'david.brown@email.com', '(555) 567-8901', '{"provider": "Humana", "member_id": "321654987", "group_number": "JKL012"}')
      RETURNING *
    `;

    // Create sample claims
    console.log('📄 Creating sample claims...');
    const claims = await sql`
      INSERT INTO claims (practice_id, patient_id, external_claim_id, insurer_name, treatment_code, treatment_description, submitted_amount, expected_amount, received_amount, status, submission_date, payment_date, notes)
      VALUES 
        (${practice1[0].id}, ${patients[0].id}, 'CLM001', 'Delta Dental', 'D0210', 'Comprehensive Oral Evaluation', 150.00, 150.00, 120.00, 'underpaid', '2024-01-15', '2024-01-20', 'Patient notes'),
        (${practice1[0].id}, ${patients[1].id}, 'CLM002', 'Blue Cross', 'D1110', 'Adult Prophylaxis', 120.00, 120.00, 120.00, 'paid', '2024-01-16', '2024-01-21', 'Regular cleaning'),
        (${practice2[0].id}, ${patients[2].id}, 'CLM003', 'Aetna', 'D2330', 'Resin-based Composite', 200.00, 200.00, 0.00, 'unpaid', '2024-01-17', NULL, 'Cavity filling'),
        (${practice2[0].id}, ${patients[3].id}, 'CLM004', 'Cigna', 'D0150', 'Comprehensive Oral Evaluation', 150.00, 150.00, 150.00, 'paid', '2024-01-18', '2024-01-22', 'New patient exam'),
        (${practice1[0].id}, ${patients[4].id}, 'CLM005', 'Humana', 'D1351', 'Sealant', 80.00, 80.00, 60.00, 'underpaid', '2024-01-19', '2024-01-23', 'Sealant application'),
        (${practice1[0].id}, ${patients[0].id}, 'CLM006', 'Delta Dental', 'D2330', 'Resin-based Composite', 250.00, 250.00, 0.00, 'pending', '2024-01-20', NULL, 'Follow-up treatment'),
        (${practice2[0].id}, ${patients[2].id}, 'CLM007', 'Aetna', 'D1110', 'Adult Prophylaxis', 120.00, 120.00, 0.00, 'pending', '2024-01-21', NULL, 'Regular cleaning'),
        (${practice2[0].id}, ${patients[3].id}, 'CLM008', 'Cigna', 'D0210', 'Comprehensive Oral Evaluation', 150.00, 150.00, 0.00, 'pending', '2024-01-22', NULL, 'Follow-up exam')
      RETURNING *
    `;

    // Create sample alerts
    console.log('🔔 Creating sample alerts...');
    await sql`
      INSERT INTO alerts (practice_id, related_claim_id, related_patient_id, alert_type, message, priority, details)
      VALUES 
        (${practice1[0].id}, ${claims[0].id}, ${patients[0].id}, 'payment_discrepancy', 'Payment discrepancy found in claim #001', 'high', '{"expected": 150.00, "received": 120.00}'),
        (${practice2[0].id}, ${claims[2].id}, ${patients[2].id}, 'unpaid_claim', 'Unpaid claim #003 requires attention', 'high', '{"amount": 200.00, "days_overdue": 5}'),
        (${practice1[0].id}, ${claims[4].id}, ${patients[4].id}, 'payment_discrepancy', 'Payment discrepancy found in claim #005', 'medium', '{"expected": 80.00, "received": 60.00}'),
        (${practice1[0].id}, ${claims[5].id}, ${patients[0].id}, 'pending_claim', 'Pending claim #006 requires follow-up', 'low', '{"amount": 250.00, "days_pending": 3}'),
        (${practice2[0].id}, ${claims[6].id}, ${patients[2].id}, 'pending_claim', 'Pending claim #007 requires follow-up', 'low', '{"amount": 120.00, "days_pending": 2}'),
        (${practice2[0].id}, ${claims[7].id}, ${patients[3].id}, 'pending_claim', 'Pending claim #008 requires follow-up', 'low', '{"amount": 150.00, "days_pending": 1}')
    `;

    // Create sample automation logs
    console.log('🤖 Creating sample automation logs...');
    await sql`
      INSERT INTO automation_logs (practice_id, automation_type, status, details)
      VALUES 
        (${practice1[0].id}, 'claims_processing', 'completed', '{"claims_processed": 25, "successful": 23, "failed": 2}'),
        (${practice2[0].id}, 'patient_followup', 'completed', '{"reminders_sent": 15, "successful": 12, "failed": 3}'),
        (${practice1[0].id}, 'payment_verification', 'completed', '{"payments_verified": 10, "discrepancies_found": 2}'),
        (${practice2[0].id}, 'insurance_verification', 'completed', '{"verifications_processed": 8, "successful": 7, "failed": 1}'),
        (${practice1[0].id}, 'report_generation', 'completed', '{"reports_generated": 3, "format": "pdf"}')
    `;

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Sample data created:');
    console.log('   - 2 practices (Easy Dental + Dentemax)');
    console.log('   - 2 admin users');
    console.log('   - 5 patients');
    console.log('   - 8 claims (mix of paid, unpaid, underpaid)');
    console.log('   - 6 alerts');
    console.log('   - 5 automation logs');
    console.log('');
    console.log('🔑 Test credentials:');
    console.log('   Email: admin@downtowndental.com');
    console.log('   Password: password123');
    console.log('   Email: admin@uptowndental.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
}

seedDatabase();
