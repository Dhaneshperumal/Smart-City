/**
 * Main API router for Smart City Application
 */
const express = require('express');
const router = express.Router();

// API health check route
router.get('/', (req, res) => {
  res.json({
    message: 'Smart City API is running',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// API documentation route
router.get('/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    endpoints: {
      auth: '/api/auth',
      attractions: '/api/attractions',
      events: '/api/events',
      transportation: '/api/transportation',
      feedback: '/api/feedback',
      notifications: '/api/notifications',
      maps: '/api/maps',
      users: '/api/users'
    }
  });
});

module.exports = router;
