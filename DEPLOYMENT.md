# DEPLOYMENT CONFIGURATION GUIDE

## Frontend (Vercel)

Set these environment variables in Vercel Dashboard:
```
VITE_API_URL=https://qfad.onrender.com
```

The frontend will use this URL as the base and append `/api/auth/login`, `/api/users/profile`, etc.
All requests will automatically be prefixed with `/api/` by the frontend code.


---

## Backend (Render)

Set these environment variables in Render Dashboard:
```
NODE_ENV=production
PORT=10000
MONGO_URI=<Your MongoDB Atlas connection string>
JWT_SECRET=<Your secure JWT secret - long random string>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://qfad.vercel.app
ML_SERVICE_URL=https://qfad-ml.onrender.com
SMTP_HOST=<Email service SMTP host>
SMTP_PORT=587
SMTP_USER=<Email service user>
SMTP_PASS=<Email service password>
EMAIL_FROM="Question For The Day <hello@example.com>"
```

---

## ML Service (Render)

Set these environment variables in Render Dashboard:
```
PYTHON_VERSION=3.11.9
```

The ML service will run at: https://qfad-ml.onrender.com

Health check: GET https://qfad-ml.onrender.com/health
Prediction: POST https://qfad-ml.onrender.com/predict

---

## MongoDB Atlas Setup

1. Create a cluster on MongoDB Atlas
2. Add Network Access (allow 0.0.0.0/0 for Render)
3. Copy connection string
4. Set MONGO_URI in Render backend environment variables

---

## API Routes Summary

### Authentication Endpoints
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/me` - Get current user (requires token)
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Questions Endpoints
- `GET /api/questions/daily` - Get daily question (requires token)
- `GET /api/questions` - List all questions (admin only)
- `POST /api/questions` - Create question (admin only)
- `PUT /api/questions/:id` - Update question (admin only)
- `DELETE /api/questions/:id` - Delete question (admin only)

### Answers Endpoints
- `POST /api/answers` - Submit answer (requires token)
- `GET /api/answers/history` - Get answer history (requires token)

### Users Endpoints
- `GET /api/users/profile` - Get user profile (requires token)
- `PUT /api/users/profile` - Update user profile (requires token)
- `GET /api/users/leaderboard` - Get leaderboard (requires token)
- `GET /api/users/notifications` - Get notifications (requires token)
- `PATCH /api/users/notifications/:id/read` - Mark notification read (requires token)

### Recommendations Endpoints
- `GET /api/recommendations/next` - Get next recommended question (requires token)
- `GET /api/recommendations/topics` - Get topic progress (requires token)

### Admin Endpoints
- `GET /api/admin/analytics` - Get analytics (admin only)
- `GET /api/admin/users` - List all users (admin only)
- `PATCH /api/admin/users/:id` - Update user (admin only)
- `POST /api/admin/users/:id/reset-streak` - Reset user streak (admin only)
- `DELETE /api/admin/users/:id/content` - Delete user content (admin only)

### Datasets Endpoints
- `POST /api/datasets/import` - Import dataset (admin only)

### Health Check Endpoints
- `GET /` - Backend health with message
- `GET /health` - Backend health status
- `GET /health` - ML service health status

---

## Frontend → Backend Communication Flow

1. Frontend (https://qfad.vercel.app) makes requests to Backend
2. Backend URL: https://qfad.onrender.com/api
3. All requests include JWT token in Authorization header
4. Backend validates token and processes request
5. For recommendations, backend calls ML Service (https://qfad-ml.onrender.com)
6. Response returned to frontend

---

## Backend → Database Communication

1. Backend connects to MongoDB Atlas via MONGO_URI
2. Collections: users, questions, answers, streaks, notifications, xphistories

---

## Backend → ML Service Communication

1. When user requests recommendation, backend calls ML service `/predict`
2. ML service URL: https://qfad-ml.onrender.com
3. Request includes user features (accuracy, streak, weak_topics, etc.)
4. Response includes recommended difficulty and topic
5. Backend ranks candidates and returns question

---

## Testing in Production

1. **Frontend Health**: https://qfad.vercel.app
2. **Backend Health**: https://qfad.onrender.com/
3. **Backend Health Check**: https://qfad.onrender.com/health
4. **ML Service Health**: https://qfad-ml.onrender.com/health

Test signup flow:
```bash
curl -X POST https://qfad.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

Test login flow:
```bash
curl -X POST https://qfad.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Common Issues & Solutions

**Issue**: Frontend returns 404 on auth requests
**Solution**: Ensure VITE_API_URL is set correctly in Vercel for production

**Issue**: Backend can't reach MongoDB
**Solution**: Check MONGO_URI is correct and Network Access is allowed in MongoDB Atlas

**Issue**: ML service returns 503 Model not loaded
**Solution**: Ensure models/model.pkl exists and `python train.py` was run locally

**Issue**: CORS errors
**Solution**: Backend has `app.use(cors())` which allows all origins

**Issue**: JWT errors
**Solution**: Ensure JWT_SECRET is set and matches between requests

---

## Build and Deploy Commands

### Frontend (Vercel)
- Build: `npm install && npm run build`
- Start: `npm run preview`
- Deploy: `git push` (auto-deploys from GitHub)

### Backend (Render)
- Build: `npm install`
- Start: `npm start`
- Deploy: `git push` (auto-deploys from GitHub)

### ML Service (Render)
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app:app --host 0.0.0.0 --port 10000`
- Deploy: `git push ml-service/` (auto-deploys from GitHub)
