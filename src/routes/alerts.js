import express from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';
import { DatabaseService } from '../models/dbUtils.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/alerts - Get all alerts with optional filtering
router.get('/', async (req, res) => {
  try {
    const { practiceId, resolved, priority, limit = 50, offset = 0 } = req.query;

    let alerts;
    if (practiceId && practiceId !== 'null') {
      alerts = await DatabaseService.getAlertsByPractice(practiceId, parseInt(limit), parseInt(offset));
    } else {
      alerts = await DatabaseService.getAllAlerts(parseInt(limit), parseInt(offset));
    }

    // Filter by resolved status if provided
    if (resolved !== undefined) {
      const isResolved = resolved === 'true';
      alerts = alerts.filter(alert => alert.is_resolved === isResolved);
    }

    // Filter by priority if provided
    if (priority) {
      alerts = alerts.filter(alert => alert.priority === priority);
    }

    res.json({ 
      success: true, 
      data: alerts,
      count: alerts.length 
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
});

// POST /api/alerts - Create a new alert
router.post('/', [
  body('practice_id').isUUID(),
  body('alert_type').isLength({ min: 1 }),
  body('message').isLength({ min: 1 }),
  body('priority').isIn(['low', 'medium', 'high'])
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

    const alertData = {
      practice_id: req.body.practice_id,
      related_claim_id: req.body.related_claim_id || null,
      related_patient_id: req.body.related_patient_id || null,
      alert_type: req.body.alert_type,
      message: req.body.message,
      priority: req.body.priority,
      details: req.body.details || null
    };

    const newAlert = await DatabaseService.createAlert(alertData);
    
    res.status(201).json({ 
      success: true, 
      data: newAlert 
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create alert'
    });
  }
});

// GET /api/alerts/:id - Get a specific alert
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await DatabaseService.getAlertById(id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({ 
      success: true, 
      data: alert 
    });
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alert'
    });
  }
});

// PUT /api/alerts/:id - Update a specific alert
router.put('/:id', [
  body('alert_type').optional().isLength({ min: 1 }),
  body('message').optional().isLength({ min: 1 }),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('is_resolved').optional().isBoolean()
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
      alert_type: req.body.alert_type,
      message: req.body.message,
      priority: req.body.priority,
      is_resolved: req.body.is_resolved,
      details: req.body.details
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const updatedAlert = await DatabaseService.updateAlert(id, updateData);
    
    if (!updatedAlert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({ 
      success: true, 
      data: updatedAlert 
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update alert'
    });
  }
});

// DELETE /api/alerts/:id - Delete a specific alert
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DatabaseService.deleteAlert(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({ 
      success: true, 
      message: 'Alert deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete alert'
    });
  }
});

export default router;
