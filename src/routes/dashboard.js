import express from 'express';
import { DatabaseService } from '../models/dbUtils.js';

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const { practiceId } = req.query;

    // Get all stats for the dashboard
    const stats = await DatabaseService.getDashboardStats(practiceId === 'null' ? null : practiceId);
    
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    });
  }
});

export default router;
