const { getDB } = require('../db');

class Interaction {
  static async create(userId, placeId, interactionData) {
    const db = getDB();
    const interactionsCollection = db.collection('interactions');

    const interaction = {
      userId,
      placeId,
      type: interactionData.type || 'view', // view, click, favorite, share, review, visit
      placeName: interactionData.placeName,
      category: interactionData.category,
      distance: interactionData.distance,
      rating: interactionData.rating,
      timestamp: new Date(),
      metadata: interactionData.metadata || {}
    };

    const result = await interactionsCollection.insertOne(interaction);
    return { _id: result.insertedId, ...interaction };
  }

  static async getUserInteractions(userId, days = 30) {
    const db = getDB();
    const interactionsCollection = db.collection('interactions');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await interactionsCollection.find({
      userId,
      timestamp: { $gte: cutoffDate }
    }).toArray();
  }

  static async getPlaceInteractions(userId, placeId) {
    const db = getDB();
    const interactionsCollection = db.collection('interactions');

    return await interactionsCollection.find({
      userId,
      placeId
    }).toArray();
  }

  static async getInteractionStats(userId) {
    const db = getDB();
    const interactionsCollection = db.collection('interactions');

    const stats = await interactionsCollection.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const result = {};
    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    return result;
  }

  static async getCategoryAffinity(userId) {
    const db = getDB();
    const interactionsCollection = db.collection('interactions');

    const affinity = await interactionsCollection.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    return affinity;
  }

  static async calculateUserScore(userId) {
    const db = getDB();
    const interactionsCollection = db.collection('interactions');

    const interactions = await this.getUserInteractions(userId, 30);
    
    let stats = {
      views: 0,
      clicks: 0,
      favorites: 0,
      reviews: 0,
      visits: 0,
      uniquePlaces: new Set()
    };

    interactions.forEach(interaction => {
      stats.uniquePlaces.add(interaction.placeId);
      
      switch (interaction.type) {
        case 'view':
          stats.views++;
          break;
        case 'click':
          stats.clicks++;
          break;
        case 'favorite':
          stats.favorites++;
          break;
        case 'review':
          stats.reviews++;
          break;
        case 'visit':
          stats.visits++;
          break;
      }
    });

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(
      100,
      (stats.clicks * 2 + stats.views + stats.favorites * 3) / Math.max(stats.uniquePlaces.size, 1)
    );

    return {
      engagementScore: Math.round(engagementScore),
      stats: {
        views: stats.views,
        clicks: stats.clicks,
        favorites: stats.favorites,
        reviews: stats.reviews,
        visits: stats.visits,
        uniquePlaces: stats.uniquePlaces.size
      }
    };
  }
}

module.exports = Interaction;
