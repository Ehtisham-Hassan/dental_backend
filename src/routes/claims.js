import express from 'express';
import { body, validationResult } from 'express-validator';
import { DatabaseService } from '../models/dbUtils.js';

const router = express.Router();

// GET /api/claims - Get all claims with optional filtering
router.get('/', async (req, res) => {
  try {
    const { practiceId, status, limit = 50, offset = 0 } = req.query;

    let claims;
    if (practiceId && practiceId !== 'null') {
      claims = await DatabaseService.getClaimsByPractice(practiceId, parseInt(limit), parseInt(offset));
    } else {
      claims = await DatabaseService.getAllClaims(parseInt(limit), parseInt(offset));
    }

    // Filter by status if provided
    if (status) {
      claims = claims.filter(claim => claim.status === status);
    }

    res.json({ 
      success: true, 
      data: claims,
      count: claims.length 
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch claims'
    });
  }
});

// POST /api/claims - Create a new claim
router.post('/', [
  body('practice_id').isUUID(),
  body('patient_id').isUUID(),
  body('insurer_name').isLength({ min: 1 }),
  body('treatment_description').isLength({ min: 1 }),
  body('submitted_amount').isFloat({ min: 0 })
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

    const claimData = {
      practice_id: req.body.practice_id,
      patient_id: req.body.patient_id,
      external_claim_id: req.body.external_claim_id || null,
      insurer_name: req.body.insurer_name,
      treatment_code: req.body.treatment_code || null,
      treatment_description: req.body.treatment_description,
      submitted_amount: parseFloat(req.body.submitted_amount),
      expected_amount: req.body.expected_amount ? parseFloat(req.body.expected_amount) : null,
      received_amount: req.body.received_amount ? parseFloat(req.body.received_amount) : null,
      status: req.body.status || 'pending',
      submission_date: req.body.submission_date || new Date().toISOString(),
      payment_date: req.body.payment_date || null,
      notes: req.body.notes || null
    };

    const newClaim = await DatabaseService.createClaim(claimData);
    
    res.status(201).json({ 
      success: true, 
      data: newClaim 
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create claim'
    });
  }
});

// GET /api/claims/:id - Get a specific claim
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await DatabaseService.getClaimById(id);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }

    res.json({ 
      success: true, 
      data: claim 
    });
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch claim'
    });
  }
});

// PUT /api/claims/:id - Update a specific claim
router.put('/:id', [
  body('insurer_name').optional().isLength({ min: 1 }),
  body('treatment_description').optional().isLength({ min: 1 }),
  body('submitted_amount').optional().isFloat({ min: 0 }),
  body('expected_amount').optional().isFloat({ min: 0 }),
  body('received_amount').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['pending', 'paid', 'underpaid', 'unpaid', 'rejected'])
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
      insurer_name: req.body.insurer_name,
      treatment_code: req.body.treatment_code,
      treatment_description: req.body.treatment_description,
      submitted_amount: req.body.submitted_amount ? parseFloat(req.body.submitted_amount) : undefined,
      expected_amount: req.body.expected_amount ? parseFloat(req.body.expected_amount) : undefined,
      received_amount: req.body.received_amount ? parseFloat(req.body.received_amount) : undefined,
      status: req.body.status,
      payment_date: req.body.payment_date,
      notes: req.body.notes
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const updatedClaim = await DatabaseService.updateClaim(id, updateData);
    
    if (!updatedClaim) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }

    res.json({ 
      success: true, 
      data: updatedClaim 
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update claim'
    });
  }
});

// DELETE /api/claims/:id - Delete a specific claim
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DatabaseService.deleteClaim(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }

    res.json({ 
      success: true, 
      message: 'Claim deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting claim:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete claim'
    });
  }
});

export default router;
