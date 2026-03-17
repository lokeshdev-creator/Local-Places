# 🚀 LocalPlaces - Complete Setup Guide

Complete guide to set up and run both **Frontend** and **Backend** for the AI-powered local discovery platform with real user behavior tracking.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vanilla JS)                    │
│                  http://localhost:8000                       │
│                                                              │
│  • AI Recommendations Engine                                │
│  • User Behavior Tracking (localStorage + API)              │
│  • Dynamic Score Calculation                                │
│  • Real-time UI Updates                                     │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      │ HTTP/REST
                      ↓
┌─────────────────────────────────────────────────────────────┐
│               Backend (Node.js + Express)                   │
│                  http://localhost:5000                       │
│                                                              │
│  • User Authentication & Management                         │
│  • Behavior Tracking API                                    │
│  • Score Calculation Engine                                 │
│  • Analytics & Insights                                     │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      │ MongoDB Driver
                      ↓
          ┌──────────────────────────┐
          │   MongoDB Database       │
          │  (local or MongoDB Atlas)│
          └──────────────────────────┘
```

---

## 📦 Project Structure

```
local-places/
├── index.html                    # Main frontend HTML
├── script.js                     # AI engine + behavior tracking
├── style.css                     # UI styling
├── server.js                     # Original Node server (for frontend serving)
├── package.json                  # Node.js dependencies
├── BACKEND_README.md             # Backend documentation
├── SETUP_GUIDE.md               # This file
│
├── backend/                      # Express backend
│   ├── server.js               # Express app
│   ├── db.js                   # MongoDB connection
│   ├── models/
│   │   ├── User.js             # User model
│   │   └── Interaction.js      # Behavior tracking model
│   └── routes/
│       ├── auth.js             # Auth endpoints
│       └── behavior.js         # Tracking endpoints
│
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
└── login-info.json             # User credentials (local)
```

---

## ⚙️ Step-by-Step Setup

### Step 1: Clone Repository

```bash
cd Local-Places
ls -la  # Verify all files are present
```

### Step 2: Set Up MongoDB

**Option A: Local MongoDB**

```bash
# Install MongoDB Community Edition
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com
# Linux: sudo apt-get install mongodb

# Start MongoDB service
mongod  # Keep running in a separate terminal
```

**Option B: MongoDB Atlas Cloud**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/local-places?retryWrites=true&w=majority`

### Step 3: Install Backend Dependencies

```bash
npm install
```

This installs:
- `express` - Web framework
- `mongodb` - Database driver
- `cors` - Cross-origin support
- `dotenv` - Environment variables
- `nodemon` (dev) - Auto-reload

### Step 4: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/local-places
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8000

# OR For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/local-places?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

### Step 5: Start Backend Server

Terminal 1 - Backend:
```bash
npm start
# Or with auto-reload:
npm run dev
```

Expected output:
```
🚀 LocalPlaces Backend running on http://localhost:5000
📊 Behavior tracking API ready
✅ Connected to MongoDB
```

### Step 6: Start Frontend Server

Terminal 2 - Frontend:
```bash
node server.js
# Or:
npx http-server
```

Expected output:
```
Server running at http://localhost:8000
```

### Step 7: Open Application

Open browser: **http://localhost:8000**

---

## 🔌 Frontend to Backend Integration

The frontend now connects to the backend for persistent behavior tracking:

### Key Integration Points

**1. User Sync (On Login)**
```javascript
// In script.js - auth listener
const userId = currentUser.uid;
const email = currentUser.email;

await fetch('http://localhost:5000/api/auth/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId,
    email,
    displayName: currentUser.displayName
  })
});
```

**2. Track Interactions (On Place View/Click)**
```javascript
// Modified trackUserInteraction() function
function trackUserInteraction(placeId, type) {
  // Local tracking (localStorage)
  trackUserInteractionLocal(placeId, type);
  
  // Backend tracking (MongoDB)
  if (navigator.onLine) {
    fetch('http://localhost:5000/api/behavior/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.uid,
        placeId,
        type,
        placeName: place?.name
      })
    });
  }
}
```

**3. Get Score Components (For Dashboard Display)**
```javascript
// Fetch calculated score from backend
async function getScoreComponents() {
  const response = await fetch(
    `http://localhost:5000/api/behavior/score/${currentUser.uid}`
  );
  const data = await response.json();
  
  // Update formula display with actual values
  updateFormulaWithComponents(data.scoreComponents);
}
```

---

## 📊 How User Behavior is Tracked

### Automatic Tracking

Users' interactions are automatically tracked:

1. **View**: User sees a place in feed
   - Recorded in localStorage + sent to backend
   
2. **Click**: User opens place details
   - Recorded in localStorage + sent to backend
   
3. **Favorite**: User adds to favorites
   - Recorded in localStorage + sent to backend

### Score Calculation

**Real-time (Frontend)**:
- Calculates from localStorage interactions
- Updates every time user interacts
- Displays in dashboard dynamically

**Persistent (Backend)**:
- Stores all interactions in MongoDB
- Available across devices
- Historical data for analytics

### Formula Components

```
Score = (Preferences × 0.4) + (Distance × 0.25) + (Time × 0.2) + (Popularity × 0.15)

Where:
- Preferences: Calculated from user's engagement with categories
- Distance: Proximity to user's location
- Time: Recency of interactions (last 30 days weighted)
- Popularity: Average Google rating of places
```

---

## 🎮 Test the System

### Test 1: User Signup & Sync

```bash
# Frontend: Create account with email
# Backend: User record created in MongoDB automatically

curl http://localhost:5000/api/auth/profile/user_123
```

### Test 2: Track Interactions

```bash
curl -X POST http://localhost:5000/api/behavior/track \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "placeId": "place_456",
    "type": "click",
    "placeName": "Java House"
  }'
```

### Test 3: Check Score

```bash
curl http://localhost:5000/api/behavior/score/user_123
```

Expected response:
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
  "stats": { ... }
}
```

### Test 4: View All Interactions

```bash
curl http://localhost:5000/api/behavior/interactions/user_123
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running
```bash
mongod  # Start MongoDB
# OR check MongoDB Atlas connection string
```

### CORS Error in Browser Console
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Backend CORS is already configured, but verify:
- Backend is running on port 5000
- Frontend is on port 8000
- `.env` has correct FRONTEND_URL

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Interactions Not Being Saved
- Check Network tab in browser DevTools
- Ensure backend is running (`npm start`)
- Check MongoDB is connected
- Look for errors in backend console

---

## 📈 Next Steps

1. **Deploy Backend**
   - Deploy to Heroku, Railway, or Render
   - Set `MONGODB_URI` environment variable
   - Update frontend API URL

2. **Add More Analytics**
   - View conversion rates
   - Category trends over time
   - User engagement heatmaps

3. **Enhance Recommendations**
   - Collaborative filtering
   - Content-based filtering
   - Hybrid approach

4. **Mobile App**
   - React Native version
   - Offline capability with sync
   - Push notifications

---

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| `script.js` | Frontend AI engine + interaction tracking |
| `backend/server.js` | Express API server |
| `backend/models/Interaction.js` | Behavior storage & querying |
| `backend/routes/behavior.js` | Tracking endpoints |
| `style.css` | UI with dynamic score display |
| `index.html` | Frontend structure |

---

## 🎯 Architecture Highlights

✅ **Dual Tracking System**
- Local: Fast, offline-capable
- Backend: Persistent, cross-device

✅ **Real-time Score Updates**
- Calculated from live user behavior
- Dynamic formula with actual values

✅ **Scalable Backend**
- MongoDB for unlimited data
- RESTful API design
- Ready for microservices

✅ **Privacy Focused**
- User data stays in their database
- No third-party tracking

---

## 🆘 Support

For issues or questions:
1. Check the error message carefully
2. Review BACKEND_README.md
3. Check MongoDB connection
4. Verify API endpoints in DevTools Network tab
5. Create GitHub issue with error details

---

**Ready to launch? Open http://localhost:8000 and start discovering! 🎉**
