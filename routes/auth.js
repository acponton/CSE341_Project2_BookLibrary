const express = require('express');
const { body } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Validation error or user already exists.
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      const hashed = await bcrypt.hash(password, 10);

      const user = new User({ email, password: hashed });
      await user.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticate a user and return a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful.
 *       401:
 *         description: Invalid credentials.
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );

      res.json({ token });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     description: Return the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info.
 *       401:
 *         description: Unauthorized.
 */
router.get('/me', auth, async (req, res) => {
  res.json({ id: req.user.id, email: req.user.email });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user
 *     description: For JWT-based auth, logout is handled client-side by discarding the token.
 *     responses:
 *       200:
 *         description: Logout acknowledged.
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out (discard token on client)' });
});

module.exports = router;