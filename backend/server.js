require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const authRoutes = require('./routes/auth');
const behaviorRoutes = require('./routes/behavior');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/behavior', behaviorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend server running', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 LocalPlaces Backend running on http://localhost:${PORT}`);
  console.log(`📊 Behavior tracking API ready`);
});
