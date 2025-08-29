import express from 'express';
import { body, validationResult } from 'express-validator';
import { DatabaseService } from '../models/dbUtils.js';

const router = express.Router();

// GET /api/practices - Get all practices
router.get('/', async (req, res) => {
  try {
    const practices = await DatabaseService.getPractices();
    res.json({ 
      success: true, 
      data: practices,
      count: practices.length 
    });
  } catch (error) {
    console.error('Error fetching practices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch practices'
    });
  }
});

// POST /api/practices - Create a new practice
router.post('/', [
  body('name').isLength({ min: 1 }),
  body('system_type').isIn(['easy_dental', 'dentemax'])
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

    const practiceData = {
      name: req.body.name,
      system_type: req.body.system_type,
      api_credentials: req.body.api_credentials || null
    };

    const newPractice = await DatabaseService.createPractice(practiceData);
    
    res.status(201).json({ 
      success: true, 
      data: newPractice 
    });
  } catch (error) {
    console.error('Error creating practice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create practice'
    });
  }
});

// GET /api/practices/:id - Get a specific practice
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const practice = await DatabaseService.getPracticeById(id);
    
    if (!practice) {
      return res.status(404).json({
        success: false,
        error: 'Practice not found'
      });
    }

    res.json({ 
      success: true, 
      data: practice 
    });
  } catch (error) {
    console.error('Error fetching practice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch practice'
    });
  }
});

// PUT /api/practices/:id - Update a specific practice
router.put('/:id', [
  body('name').optional().isLength({ min: 1 }),
  body('system_type').optional().isIn(['easy_dental', 'dentemax'])
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
      name: req.body.name,
      system_type: req.body.system_type,
      api_credentials: req.body.api_credentials
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const updatedPractice = await DatabaseService.updatePractice(id, updateData);
    
    if (!updatedPractice) {
      return res.status(404).json({
        success: false,
        error: 'Practice not found'
      });
    }

    res.json({ 
      success: true, 
      data: updatedPractice 
    });
  } catch (error) {
    console.error('Error updating practice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update practice'
    });
  }
});

// DELETE /api/practices/:id - Delete a specific practice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DatabaseService.deletePractice(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Practice not found'
      });
    }

    res.json({ 
      success: true, 
      message: 'Practice deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting practice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete practice'
    });
  }
});

export default router;
