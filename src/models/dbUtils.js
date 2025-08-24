import { getSql } from './database.js';

export class DatabaseService {
  // Practices
  static async createPractice(practiceData) {
    const { name, system_type, api_credentials } = practiceData;
    const sql = getSql();
    
    const result = await sql`
      INSERT INTO practices (name, system_type, api_credentials)
      VALUES (${name}, ${system_type}, ${JSON.stringify(api_credentials)})
      RETURNING *
    `;
    
    return result[0];
  }

  static async getPractices() {
    const sql = getSql();
    return await sql`SELECT * FROM practices ORDER BY created_at DESC`;
  }

  static async getPracticeById(id) {
    const sql = getSql();
    const result = await sql`SELECT * FROM practices WHERE id = ${id}`;
    return result[0];
  }

  static async updatePractice(id, updateData) {
    const sql = getSql();
    const result = await sql`
      UPDATE practices 
      SET name = ${updateData.name}, 
          system_type = ${updateData.system_type}, 
          api_credentials = ${JSON.stringify(updateData.api_credentials)}
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }

  static async deletePractice(id) {
    const sql = getSql();
    const result = await sql`DELETE FROM practices WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  // Patients
  static async createPatient(patientData) {
    const {
      practice_id,
      external_id,
      first_name,
      last_name,
      email,
      phone,
      insurance_info
    } = patientData;
    const sql = getSql();

    const result = await sql`
      INSERT INTO patients (practice_id, external_id, first_name, last_name, email, phone, insurance_info)
      VALUES (${practice_id}, ${external_id}, ${first_name}, ${last_name}, ${email}, ${phone}, ${JSON.stringify(insurance_info)})
      RETURNING *
    `;

    return result[0];
  }

  static async getPatientsByPractice(practiceId, limit = 50, offset = 0) {
    const sql = getSql();
    // Handle null practiceId properly
    if (!practiceId || practiceId === 'null') {
      return await sql`
        SELECT * FROM patients 
        ORDER BY last_name, first_name
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql`
      SELECT * FROM patients 
      WHERE practice_id = ${practiceId} 
      ORDER BY last_name, first_name
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  static async getAllPatients(limit = 50, offset = 0) {
    const sql = getSql();
    return await sql`
      SELECT * FROM patients 
      ORDER BY last_name, first_name
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  static async getPatientById(id) {
    const sql = getSql();
    const result = await sql`SELECT * FROM patients WHERE id = ${id}`;
    return result[0];
  }

  static async updatePatient(id, updateData) {
    const sql = getSql();
    const result = await sql`
      UPDATE patients 
      SET external_id = ${updateData.external_id},
          first_name = ${updateData.first_name},
          last_name = ${updateData.last_name},
          email = ${updateData.email},
          phone = ${updateData.phone},
          insurance_info = ${JSON.stringify(updateData.insurance_info)}
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }

  static async deletePatient(id) {
    const sql = getSql();
    const result = await sql`DELETE FROM patients WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  // Claims
  static async createClaim(claimData) {
    const {
      practice_id,
      patient_id,
      external_claim_id,
      insurer_name,
      treatment_code,
      treatment_description,
      submitted_amount,
      expected_amount,
      received_amount,
      status,
      submission_date,
      payment_date,
      notes
    } = claimData;
    const sql = getSql();

    const result = await sql`
      INSERT INTO claims (
        practice_id, patient_id, external_claim_id, insurer_name,
        treatment_code, treatment_description, submitted_amount,
        expected_amount, received_amount, status, submission_date,
        payment_date, notes
      )
      VALUES (
        ${practice_id}, ${patient_id}, ${external_claim_id}, ${insurer_name},
        ${treatment_code}, ${treatment_description}, ${submitted_amount},
        ${expected_amount}, ${received_amount}, ${status}, ${submission_date},
        ${payment_date}, ${notes}
      )
      RETURNING *
    `;

    return result[0];
  }

  static async getClaimsByPractice(practiceId, limit = 50, offset = 0) {
    const sql = getSql();
    // Handle null practiceId properly
    if (!practiceId || practiceId === 'null') {
      return await sql`
        SELECT c.*, p.first_name, p.last_name, pr.name as practice_name
        FROM claims c
        LEFT JOIN patients p ON c.patient_id = p.id
        LEFT JOIN practices pr ON c.practice_id = pr.id
        ORDER BY c.submission_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql`
      SELECT c.*, p.first_name, p.last_name, pr.name as practice_name
      FROM claims c
      LEFT JOIN patients p ON c.patient_id = p.id
      LEFT JOIN practices pr ON c.practice_id = pr.id
      WHERE c.practice_id = ${practiceId}
      ORDER BY c.submission_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  static async getAllClaims(limit = 50, offset = 0) {
    const sql = getSql();
    return await sql`
      SELECT c.*, p.first_name, p.last_name, pr.name as practice_name
      FROM claims c
      LEFT JOIN patients p ON c.patient_id = p.id
      LEFT JOIN practices pr ON c.practice_id = pr.id
      ORDER BY c.submission_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  static async getClaimById(id) {
    const sql = getSql();
    const result = await sql`
      SELECT c.*, p.first_name, p.last_name, pr.name as practice_name
      FROM claims c
      LEFT JOIN patients p ON c.patient_id = p.id
      LEFT JOIN practices pr ON c.practice_id = pr.id
      WHERE c.id = ${id}
    `;
    return result[0];
  }

  static async updateClaim(id, updateData) {
    const sql = getSql();
    const result = await sql`
      UPDATE claims 
      SET insurer_name = ${updateData.insurer_name},
          treatment_code = ${updateData.treatment_code},
          treatment_description = ${updateData.treatment_description},
          submitted_amount = ${updateData.submitted_amount},
          expected_amount = ${updateData.expected_amount},
          received_amount = ${updateData.received_amount},
          status = ${updateData.status},
          payment_date = ${updateData.payment_date},
          notes = ${updateData.notes}
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }

  static async deleteClaim(id) {
    const sql = getSql();
    const result = await sql`DELETE FROM claims WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  // Alerts
  static async createAlert(alertData) {
    const {
      practice_id,
      related_claim_id,
      related_patient_id,
      alert_type,
      message,
      priority,
      details
    } = alertData;
    const sql = getSql();

    const result = await sql`
      INSERT INTO alerts (practice_id, related_claim_id, related_patient_id, alert_type, message, priority, details)
      VALUES (${practice_id}, ${related_claim_id}, ${related_patient_id}, ${alert_type}, ${message}, ${priority}, ${JSON.stringify(details)})
      RETURNING *
    `;

    return result[0];
  }

  static async getAlertsByPractice(practiceId, limit = 50, offset = 0) {
    const sql = getSql();
    // Handle null practiceId properly
    if (!practiceId || practiceId === 'null') {
      return await sql`
        SELECT a.*, p.first_name, p.last_name, pr.name as practice_name
        FROM alerts a
        LEFT JOIN patients p ON a.related_patient_id = p.id
        LEFT JOIN practices pr ON a.practice_id = pr.id
        ORDER BY a.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql`
      SELECT a.*, p.first_name, p.last_name, pr.name as practice_name
      FROM alerts a
      LEFT JOIN patients p ON a.related_patient_id = p.id
      LEFT JOIN practices pr ON a.practice_id = pr.id
      WHERE a.practice_id = ${practiceId}
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  static async getAllAlerts(limit = 50, offset = 0) {
    const sql = getSql();
    return await sql`
      SELECT a.*, p.first_name, p.last_name, pr.name as practice_name
      FROM alerts a
      LEFT JOIN patients p ON a.related_patient_id = p.id
      LEFT JOIN practices pr ON a.practice_id = pr.id
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  static async getAlertById(id) {
    const sql = getSql();
    const result = await sql`
      SELECT a.*, p.first_name, p.last_name, pr.name as practice_name
      FROM alerts a
      LEFT JOIN patients p ON a.related_patient_id = p.id
      LEFT JOIN practices pr ON a.practice_id = pr.id
      WHERE a.id = ${id}
    `;
    return result[0];
  }

  static async updateAlert(id, updateData) {
    const sql = getSql();
    const result = await sql`
      UPDATE alerts 
      SET alert_type = ${updateData.alert_type},
          message = ${updateData.message},
          priority = ${updateData.priority},
          is_resolved = ${updateData.is_resolved},
          details = ${JSON.stringify(updateData.details)},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  }

  static async deleteAlert(id) {
    const sql = getSql();
    const result = await sql`DELETE FROM alerts WHERE id = ${id} RETURNING *`;
    return result[0];
  }

  // Users
  static async createUser(userData) {
    const {
      practice_id,
      email,
      password_hash,
      role,
      first_name,
      last_name
    } = userData;
    const sql = getSql();

    const result = await sql`
      INSERT INTO users (practice_id, email, password_hash, role, first_name, last_name)
      VALUES (${practice_id}, ${email}, ${password_hash}, ${role}, ${first_name}, ${last_name})
      RETURNING *
    `;

    return result[0];
  }

  static async getUsersByPractice(practiceId, limit = 50, offset = 0) {
    const sql = getSql();
    // Handle null practiceId properly
    if (!practiceId || practiceId === 'null') {
      return await sql`
        SELECT u.*, pr.name as practice_name
        FROM users u
        LEFT JOIN practices pr ON u.practice_id = pr.id
        ORDER BY u.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql`
      SELECT u.*, pr.name as practice_name
      FROM users u
      LEFT JOIN practices pr ON u.practice_id = pr.id
      WHERE u.practice_id = ${practiceId}
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  static async getAllUsers(limit = 50, offset = 0) {
    const sql = getSql();
    return await sql`
      SELECT u.*, pr.name as practice_name
      FROM users u
      LEFT JOIN practices pr ON u.practice_id = pr.id
      ORDER BY u.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  static async getUserByEmail(email) {
    const sql = getSql();
    const result = await sql`SELECT * FROM users WHERE email = ${email}`;
    return result[0];
  }

  static async getUserById(id) {
    const sql = getSql();
    const result = await sql`SELECT * FROM users WHERE id = ${id}`;
    return result[0];
  }

  // Automation Logs
  static async createAutomationLog(logData) {
    const {
      practice_id,
      automation_type,
      status,
      details
    } = logData;
    const sql = getSql();

    const result = await sql`
      INSERT INTO automation_logs (practice_id, automation_type, status, details)
      VALUES (${practice_id}, ${automation_type}, ${status}, ${JSON.stringify(details)})
      RETURNING *
    `;

    return result[0];
  }

  static async getAutomationLogsByPractice(practiceId, limit = 50, offset = 0) {
    const sql = getSql();
    // Handle null practiceId properly
    if (!practiceId || practiceId === 'null') {
      return await sql`
        SELECT al.*, pr.name as practice_name
        FROM automation_logs al
        LEFT JOIN practices pr ON al.practice_id = pr.id
        ORDER BY al.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql`
      SELECT al.*, pr.name as practice_name
      FROM automation_logs al
      LEFT JOIN practices pr ON al.practice_id = pr.id
      WHERE al.practice_id = ${practiceId}
      ORDER BY al.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  static async getAllAutomationLogs(limit = 50, offset = 0) {
    const sql = getSql();
    return await sql`
      SELECT al.*, pr.name as practice_name
      FROM automation_logs al
      LEFT JOIN practices pr ON al.practice_id = pr.id
      ORDER BY al.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  // Analytics
  static async getDashboardStats(practiceId = null) {
    const sql = getSql();
    
    let claimsQuery, alertsQuery, automationQuery;
    
    if (practiceId) {
      claimsQuery = sql`SELECT * FROM claims WHERE practice_id = ${practiceId}`;
      alertsQuery = sql`SELECT * FROM alerts WHERE practice_id = ${practiceId} AND is_resolved = false`;
      automationQuery = sql`SELECT * FROM automation_logs WHERE practice_id = ${practiceId}`;
    } else {
      claimsQuery = sql`SELECT * FROM claims`;
      alertsQuery = sql`SELECT * FROM alerts WHERE is_resolved = false`;
      automationQuery = sql`SELECT * FROM automation_logs`;
    }

    const [claims, alerts, automationLogs] = await Promise.all([
      claimsQuery,
      alertsQuery,
      automationQuery
    ]);

    const totalClaims = claims.length;
    const totalRevenue = claims.reduce((sum, claim) => sum + (parseFloat(claim.received_amount) || 0), 0);
    const pendingClaims = claims.filter(claim => claim.status === 'pending').length;
    const activeAlerts = alerts.length;

    // Get recent claims for dashboard
    const recentClaims = claims
      .sort((a, b) => new Date(b.submission_date) - new Date(a.submission_date))
      .slice(0, 5);

    return {
      totalClaims,
      totalRevenue,
      pendingClaims,
      activeAlerts,
      recentClaims
    };
  }
}
