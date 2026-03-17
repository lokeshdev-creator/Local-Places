const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Register/Create user
router.post('/register', async (req, res) => {
  try {
    const { userId, email, displayName, location } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    // Check if user already exists
    let user = await User.findByEmail(email);
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    user = await User.create({
      userId,
      email,
      displayName,
      location
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
        points: user.points
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get or create user
router.post('/sync', async (req, res) => {
  try {
    const { userId, email, displayName, location } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await User.getOrCreate(userId, {
      email,
      displayName,
      location
    });

    res.json({
      message: 'User synced',
      user: {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
        points: user.points,
        interests: user.interests
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByUserId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
      location: user.location,
      interests: user.interests,
      points: user.points,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user location
router.put('/location/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { location } = req.body;

    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ error: 'Valid location {lat, lng} is required' });
    }

    const success = await User.updateLocation(userId, location);
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
