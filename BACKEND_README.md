# LocalPlaces Backend - Behavior Tracking & AI Scoring System

Complete Node.js + Express + MongoDB backend for tracking user behavior and calculating AI personalization scores.

## ✨ Features

- **User Management**: Register and sync user profiles
- **Behavior Tracking**: Track views, clicks, favorites, reviews, and visits
- **Score Calculation**: Real-time calculation of AI recommendation scores
- **Analytics**: Interaction statistics and category affinity analysis
- **RESTful API**: Complete API for frontend integration

## 📋 Prerequisites

- **Node.js** v16+
- **MongoDB** (local or MongoDB Atlas cloud instance)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and update with your MongoDB URI:

```bash
cp .env.example .env
```

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/local-places
PORT=5000
```

**For MongoDB Atlas Cloud:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/local-places?retryWrites=true&w=majority
PORT=5000
```

### 3. Start MongoDB

**If using local MongoDB:**
```bash
mongod
```

**If using MongoDB Atlas, connection string is in .env**

### 4. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Server will be available at `http://localhost:5000`

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "userId": "user_123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "location": { "lat": 22.7196, "lng": 75.8577 }
}
```

#### Sync User (Get or Create)
```bash
POST /api/auth/sync
Content-Type: application/json

{
  "userId": "user_123",
  "email": "user@example.com",
  "displayName": "John Doe"
}
```

#### Get User Profile
```bash
GET /api/auth/profile/:userId
```

#### Update User Location
```bash
PUT /api/auth/location/:userId
Content-Type: application/json

{
  "location": { "lat": 23.1815, "lng": 79.9864 }
}
```

### Behavior Tracking Routes (`/api/behavior`)

#### Track Interaction
```bash
POST /api/behavior/track
Content-Type: application/json

{
  "userId": "user_123",
  "placeId": "place_456",
  "type": "click",
  "placeName": "Java House Cafe",
  "category": "cafe",
  "distance": 1.2,
  "rating": 4.5
}
```

**Interaction Types:**
- `view` - User viewed the place
- `click` - User clicked/opened place details
- `favorite` - User added to favorites
- `share` - User shared the place
- `review` - User left a review
- `visit` - User visited the place

#### Get User Interactions
```bash
GET /api/behavior/interactions/:userId?days=30
```

#### Get Place Interactions
```bash
GET /api/behavior/place/:userId/:placeId
```

#### Get Interaction Stats
```bash
GET /api/behavior/stats/:userId
```

Response includes:
- Interaction type counts (views, clicks, favorites, etc.)
- Category affinity scores
- Engagement score

#### Get User Score Components
```bash
GET /api/behavior/score/:userId
```

Response includes:
```json
{
  "userId": "user_123",
  "scoreComponents": {
    "preferences": { "value": 45, "weight": 0.4 },
    "distance": { "value": 25, "weight": 0.25 },
    "timeRelevance": { "value": 67, "weight": 0.2 },
    "popularity": { "value": 15, "weight": 0.15 }
  },
  "totalScore": 46,
  "stats": {
    "totalInteractions": 42,
    "views": 30,
    "clicks": 10,
    "favorites": 2,
    "categories": 5
  }
}
```

## 🔗 Integrate with Frontend

Update your frontend's `script.js` to call the backend APIs:

```javascript
const BACKEND_API = 'http://localhost:5000/api';

// Sync user on login
async function syncUserWithBackend(userId, email) {
  try {
    const response = await fetch(`${BACKEND_API}/auth/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        displayName: currentUser?.displayName
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Sync error:', error);
  }
}

// Track interactions
async function trackInteraction(placeId, type) {
  try {
    const response = await fetch(`${BACKEND_API}/behavior/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser?.uid || 'guest',
        placeId,
        type,
        placeName: place?.name,
        category: filter
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Tracking error:', error);
  }
}

// Get user score
async function getUserScore() {
  try {
    const response = await fetch(`${BACKEND_API}/behavior/score/${currentUser?.uid}`);
    return await response.json();
  } catch (error) {
    console.error('Score fetch error:', error);
  }
}
```

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  userId: String (unique),
  email: String (unique),
  displayName: String,
  location: { lat: Number, lng: Number },
  interests: [String],
  points: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Interactions Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  placeId: String,
  type: String, // view, click, favorite, share, review, visit
  placeName: String,
  category: String,
  distance: Number,
  rating: Number,
  timestamp: Date,
  metadata: {}
}
```

## 🧮 Score Calculation Formula

```
Score = (User Preferences × 0.4) + (Distance × 0.25) + (Time Relevance × 0.2) + (Popularity × 0.15)
```

Where:
- **User Preferences** (0-100): Based on user engagement with similar categories
- **Distance** (0-100): Normalized proximity score
- **Time Relevance** (0-100): Based on recency of interactions
- **Popularity** (0-100): Based on Google ratings and review counts

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/local-places` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:8000` |

## 📝 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running: `mongod`
- Check connection string in `.env`
- For MongoDB Atlas: Whitelist your IP address in Security settings

### Port Already in Use
```bash
# Change PORT in .env or kill process using port 5000
```

### CORS Errors
- Update `FRONTEND_URL` in `.env`
- Ensure CORS middleware is enabled in `server.js`

## 🚀 Deployment

### Deploy to Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI=your_mongodb_uri
```

### Deploy to Railway/Render
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy button will trigger automatic deployment

## 📞 Support

For issues or questions, create an issue in the GitHub repository.

---

**LocalPlaces Backend v1.0.0** | AI-Powered Local Discovery
