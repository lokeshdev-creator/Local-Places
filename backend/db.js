const { MongoClient, ServerApiVersion } = require('mongodb');

let client;
let db;

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/local-places';
    
    client = new MongoClient(mongoUrl, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });

    await client.connect();
    db = client.db('local-places');

    // Create indexes
    await createIndexes();

    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const usersCollection = db.collection('users');
    const interactionsCollection = db.collection('interactions');

    // User indexes
    await usersCollection.createIndex({ userId: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    // Interaction indexes
    await interactionsCollection.createIndex({ userId: 1 });
    await interactionsCollection.createIndex({ placeId: 1 });
    await interactionsCollection.createIndex({ userId: 1, placeId: 1 });
    await interactionsCollection.createIndex({ timestamp: 1 });

    console.log('✅ Indexes created');
  } catch (error) {
    if (!error.message.includes('already exists')) {
      console.error('Error creating indexes:', error);
    }
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('💤 MongoDB connection closed');
  }
};

module.exports = { connectDB, getDB, closeDB };
