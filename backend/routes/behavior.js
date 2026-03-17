const express = require('express');
const Interaction = require('../models/Interaction');
const User = require('../models/User');

const router = express.Router();

// Track user interaction
router.post('/track', async (req, res) => {
  try {
    const { userId, placeId, type, placeName, category, distance, rating } = req.body;

    if (!userId || !placeId) {
      return res.status(400).json({ error: 'userId and placeId are required' });
    }

    const interaction = await Interaction.create(userId, placeId, {
      type,
      placeName,
      category,
      distance,
      rating
    });

    res.status(201).json({
      message: 'Interaction tracked',
      interaction
    });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user interactions
router.get('/interactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const interactions = await Interaction.getUserInteractions(userId, parseInt(days));

    res.json({
      userId,
      totalInteractions: interactions.length,
      interactions
    });
  } catch (error) {
    console.error('Fetch interactions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get place interactions
router.get('/place/:userId/:placeId', async (req, res) => {
  try {
    const { userId, placeId } = req.params;

    const interactions = await Interaction.getPlaceInteractions(userId, placeId);

    res.json({
      userId,
      placeId,
      interactionCount: interactions.length,
      interactions
    });
  } catch (error) {
    console.error('Place interactions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get interaction statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await Interaction.getInteractionStats(userId);
    const categoryAffinity = await Interaction.getCategoryAffinity(userId);
    const score = await Interaction.calculateUserScore(userId);

    res.json({
      userId,
      interactionTypes: stats,
      categoryAffinity,
      engagement: score
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user score and components
router.get('/score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const interactions = await Interaction.getUserInteractions(userId, 30);
    const user = await User.findByUserId(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate score components
    let stats = {
      views: 0,
      clicks: 0,
      favorites: 0,
      categoryScores: {}
    };

    interactions.forEach(i => {
      if (i.type === 'view') stats.views++;
      if (i.type === 'click') stats.clicks++;
      if (i.type === 'favorite') stats.favorites++;

      if (i.category) {
        stats.categoryScores[i.category] = (stats.categoryScores[i.category] || 0) + 1;
      }
    });

    // Calculate components
    const preferences = Math.min(100, (stats.clicks * 2 + stats.views) / Math.max(interactions.length, 1) * 100);
    const timeRelevance = Math.min(100, interactions.length * 10);
    const popularity = 15; // Base value, can be enhanced with rating data
    const distance = 25; // Base value, can be calculated from user location

    const totalScore = Math.round(
      (preferences * 0.4) + (distance * 0.25) + (timeRelevance * 0.2) + (popularity * 0.15)
    );

    res.json({
      userId,
      scoreComponents: {
        preferences: {
          value: Math.round(preferences),
          weight: 0.4
        },
        distance: {
          value: distance,
          weight: 0.25
        },
        timeRelevance: {
          value: Math.round(timeRelevance),
          weight: 0.2
        },
        popularity: {
          value: popularity,
          weight: 0.15
        }
      },
      totalScore,
      stats: {
        totalInteractions: interactions.length,
        views: stats.views,
        clicks: stats.clicks,
        favorites: stats.favorites,
        categories: Object.keys(stats.categoryScores).length
      }
    });
  } catch (error) {
    console.error('Score calculation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
