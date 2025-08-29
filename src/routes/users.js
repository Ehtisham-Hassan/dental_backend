import express from 'express';
import { body, validationResult } from 'express-validator';
import { DatabaseService } from '../models/dbUtils.js';

const router = express.Router();

// GET /api/users - Get all users with optional filtering
router.get('/', async (req, res) => {
  try {
    const { practiceId, limit = 50, offset = 0 } = req.query;

    let users;
    if (practiceId && practiceId !== 'null') {
      users = await DatabaseService.getUsersByPractice(practiceId, parseInt(limit), parseInt(offset));
    } else {
      users = await DatabaseService.getAllUsers(parseInt(limit), parseInt(offset));
    }

    res.json({ 
      success: true, 
      data: users,
      count: users.length 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// POST /api/users - Create a new user
router.post('/', [
  body('practice_id').isUUID(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'staff', 'billing']),
  body('first_name').isLength({ min: 1 }),
  body('last_name').isLength({ min: 1 })
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

    const { email, password, firstName, lastName, role, practiceId } = req.body;

    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userData = {
      practice_id: practiceId,
      email,
      password_hash: passwordHash,
      role,
      first_name: firstName,
      last_name: lastName
    };

    const newUser = await DatabaseService.createUser(userData);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = newUser;

    res.status(201).json({ 
      success: true, 
      data: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

export default router;
