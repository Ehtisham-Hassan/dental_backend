import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { DatabaseService } from '../models/dbUtils.js';
import Logger from '../utils/logger.js';

const router = express.Router();

// Login route
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  try {
    Logger.info('Login attempt', { email: req.body.email, ip: req.ip });
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      Logger.warn('Login validation failed', { 
        email: req.body.email, 
        errors: errors.array(),
        ip: req.ip 
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await DatabaseService.getUserByEmail(email);
    
    if (!user) {
      Logger.auth('login', null, false, { email, ip: req.ip, reason: 'User not found' });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      Logger.auth('login', user.id, false, { email, ip: req.ip, reason: 'Invalid password' });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      Logger.auth('login', user.id, false, { email, ip: req.ip, reason: 'Account deactivated' });
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        practiceId: user.practice_id 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    Logger.auth('login', user.id, true, { email, ip: req.ip, role: user.role });
    
    res.json({ 
      success: true, 
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    Logger.error('Login error occurred', error, { 
      email: req.body.email, 
      ip: req.ip 
    });
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Register route (optional - for creating new users)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').isLength({ min: 1 }),
  body('lastName').isLength({ min: 1 }),
  body('role').isIn(['admin', 'staff', 'billing']),
  body('practiceId').isUUID()
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

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role,
        practiceId: newUser.practice_id 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = newUser;

    res.status(201).json({ 
      success: true, 
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const user = await DatabaseService.getUserById(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        valid: true
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

export default router;
