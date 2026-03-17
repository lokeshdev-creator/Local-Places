const { getDB } = require('../db');

class User {
  static async create(userData) {
    const db = getDB();
    const usersCollection = db.collection('users');

    const user = {
      userId: userData.userId,
      email: userData.email,
      displayName: userData.displayName || 'Explorer',
      location: userData.location || { lat: 22.7196, lng: 75.8577 },
      interests: userData.interests || [],
      points: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(user);
    return { _id: result.insertedId, ...user };
  }

  static async findByUserId(userId) {
    const db = getDB();
    const usersCollection = db.collection('users');
    return await usersCollection.findOne({ userId });
  }

  static async findByEmail(email) {
    const db = getDB();
    const usersCollection = db.collection('users');
    return await usersCollection.findOne({ email });
  }

  static async updatePoints(userId, points) {
    const db = getDB();
    const usersCollection = db.collection('users');
    
    const result = await usersCollection.updateOne(
      { userId },
      { 
        $inc: { points },
        $set: { updatedAt: new Date() }
      }
    );

    return result.modifiedCount > 0;
  }

  static async updateLocation(userId, location) {
    const db = getDB();
    const usersCollection = db.collection('users');
    
    const result = await usersCollection.updateOne(
      { userId },
      { 
        $set: { 
          location, 
          updatedAt: new Date() 
        }
      }
    );

    return result.modifiedCount > 0;
  }

  static async getOrCreate(userId, userData) {
    let user = await this.findByUserId(userId);
    if (!user) {
      user = await this.create({ userId, ...userData });
    }
    return user;
  }
}

module.exports = User;
