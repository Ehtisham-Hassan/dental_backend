import express from 'express';
import { body, validationResult } from 'express-validator';
import { DatabaseService } from '../models/dbUtils.js';

const router = express.Router();

// GET /api/automation - Get automation logs with optional filtering
router.get('/', async (req, res) => {
  try {
    const { practiceId, type, limit = 50, offset = 0 } = req.query;

    let logs;
    if (practiceId && practiceId !== 'null') {
      logs = await DatabaseService.getAutomationLogsByPractice(practiceId, parseInt(limit), parseInt(offset));
    } else {
      logs = await DatabaseService.getAllAutomationLogs(parseInt(limit), parseInt(offset));
    }

    // Filter by type if provided
    if (type) {
      logs = logs.filter(log => log.automation_type === type);
    }

    res.json({ 
      success: true, 
      data: logs,
      count: logs.length 
    });
  } catch (error) {
    console.error('Error fetching automation logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch automation logs'
    });
  }
});

// POST /api/automation - Create a new automation log
router.post('/', [
  body('practice_id').isUUID(),
  body('automation_type').isLength({ min: 1 }),
  body('status').isIn(['completed', 'failed', 'pending'])
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

    const logData = {
      practice_id: req.body.practice_id,
      automation_type: req.body.automation_type,
      status: req.body.status,
      details: req.body.details || null
    };

    const newLog = await DatabaseService.createAutomationLog(logData);
    
    res.status(201).json({ 
      success: true, 
      data: newLog 
    });
  } catch (error) {
    console.error('Error creating automation log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create automation log'
    });
  }
});

export default router;
