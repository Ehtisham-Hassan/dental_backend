import express from 'express';
import { body, validationResult } from 'express-validator';
import { DatabaseService } from '../models/dbUtils.js';

const router = express.Router();

// GET /api/patients - Get all patients with optional filtering
router.get('/', async (req, res) => {
  try {
    const { practiceId, limit = 50, offset = 0 } = req.query;

    let patients;
    if (practiceId && practiceId !== 'null') {
      patients = await DatabaseService.getPatientsByPractice(practiceId, parseInt(limit), parseInt(offset));
    } else {
      patients = await DatabaseService.getAllPatients(parseInt(limit), parseInt(offset));
    }

    res.json({ 
      success: true, 
      data: patients,
      count: patients.length 
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patients'
    });
  }
});

// POST /api/patients - Create a new patient
router.post('/', [
  body('practice_id').isUUID(),
  body('first_name').isLength({ min: 1 }),
  body('last_name').isLength({ min: 1 }),
  body('email').optional().isEmail(),
  body('phone').optional().isLength({ min: 10 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: errors.array()
      });
    }

    const patientData = {
      practice_id: req.body.practice_id,
      external_id: req.body.external_id || null,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email || null,
      phone: req.body.phone || null,
      insurance_info: req.body.insurance_info || null
    };

    const newPatient = await DatabaseService.createPatient(patientData);
    
    res.status(201).json({ 
      success: true, 
      data: newPatient 
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create patient'
    });
  }
});

// GET /api/patients/:id - Get a specific patient
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await DatabaseService.getPatientById(id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.json({ 
      success: true, 
      data: patient 
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patient'
    });
  }
});

// PUT /api/patients/:id - Update a specific patient
router.put('/:id', [
  body('first_name').optional().isLength({ min: 1 }),
  body('last_name').optional().isLength({ min: 1 }),
  body('email').optional().isEmail(),
  body('phone').optional().isLength({ min: 10 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = {
      external_id: req.body.external_id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      phone: req.body.phone,
      insurance_info: req.body.insurance_info
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const updatedPatient = await DatabaseService.updatePatient(id, updateData);
    
    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.json({ 
      success: true, 
      data: updatedPatient 
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update patient'
    });
  }
});

// DELETE /api/patients/:id - Delete a specific patient
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DatabaseService.deletePatient(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.json({ 
      success: true, 
      message: 'Patient deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete patient'
    });
  }
});

export default router;
