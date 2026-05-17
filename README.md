# Question For The Day

A production-ready full stack adaptive learning app where users answer daily AI-recommended questions, earn XP, maintain streaks, track topic mastery, and compete on a leaderboard. Admins can schedule questions, import datasets, manage users, view analytics, reset streaks, and moderate content.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router DOM, Context API, Framer Motion
- Backend: Node.js, Express.js, JWT, bcrypt, Mongoose
- Database: MongoDB Atlas
- Deployment: Vercel frontend, Render or Railway backend

## Folder Structure

```text
Question_For_the_day/
  backend/
    src/
      config/          MongoDB and email configuration
      controllers/     Route handlers
      middleware/      Auth, validation, errors
      models/          MongoDB schemas
      routes/          REST route modules
      scripts/         Seed script
      utils/           Date and token helpers
  frontend/
    src/
      api/             Axios client
      components/      Layout, routes, reusable UI
      context/         Auth and theme providers
      pages/           App pages
      shared/          Shared page shells
  datasets/
    sample_questions.json
  docs/
```

## Local Setup

1. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Configure environment files:

```bash
cp backend/.env.example backe:

```bash
cp backend/.env.example backend/.env
```

3. Set `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/question_of_the_day
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

4d backend
npm run seed
npm run seed:demo
```

Admin seed login:

```text
admin@qotd.local / Admin123!
```

Demo student users:

```text
asha@example.com / Student123!
ravi@example.com / Student123!
mina@example.com / Student123!
```

6. Run both web apps:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.
5
## Database Schemas

- `User`: name, email, hashed password, role, XP, badges, avatar color, active status, reset password fields
- `Question`: title, prompt, category, topic, difficulty, options, correct answer, explanation, scheduled date, XP reward, timer, quote, publish status, source, tags
- `Answer`: user, question, answer, correctness, XP earned, time spent
- `Streak`: user, current streak, longest streak, last answered date
- `XpHistory`: user, points, reason, linked question
- `Notification`: user, title, message, type, read state

## API Routes

Base URL: `/api`

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /questions/daily`
- `GET /questions` admin
- `POST /questions` admin
- `PUT /questions/:id` admin
- `DELETE /questions/:id` admin
- `POST /answers`
- `GET /answers/history`
- `GET /users/profile`
- `PUT /users/profile`
- `GET /users/leaderboard`
- `GET /users/notifications`
- `PATCH /users/notifications/:id/read`
- `GET /recommendations/next`
- `GET /recommendations/topics`
- `POST /datasets/import` admin multipart upload with `dataset`
- `GET /admin/analytics`
- `GET /admin/users`
- `PATCH /admin/users/:id`
- `POST /admin/users/:id/reset-streak`
- `DELETE /admin/users/:id/content`

Protected routes require:

```http
Authorization: Bearer <jwt>
```

## Testing Guide

Run static production checks:

```bash
cd frontend
npm run build
```

```bash
cd backend
node -e "import('./src/app.js').then(()=>console.log('backend app import ok'))"
```

Manual API smoke test after setting MongoDB:

```bash
curl http://localhost:5000/health
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@qotd.local\",\"password\":\"Admin123!\"}"
```

Then use the returned token against `/api/questions/daily`, `/api/users/profile`, and `/api/admin/analytics`.

Automated public dataset pipeline:

```bash
cd backend
npm run dataset:fetch -- 50
npm run dataset:clean
npm run import:dataset -- ../datasets/generated/opentdb_clean.json
```

The default automation downloads free public questions from Open Trivia DB, which provides a no-key JSON API under Creative Commons Attribution-ShareAlike 4.0. The cleaner removes invalid rows and duplicates, then normalizes to `question`, `options`, `answer`, `explanation`, `topic`, and `difficulty`.

Sample dataset import:

```bash
cd backend
npm run import:dataset -- ../datasets/sample_questions.json
```

Kaggle/HuggingFace datasets should be exported or transformed to JSON/CSV fields:

```json
{
  "title": "Python Lists",
  "question": "Which method adds an item?",
  "category": "Coding",
  "topic": "Python Lists",
  "difficulty": "Easy",
  "options": ["append()", "pop()"],
  "answer": "append()",
  "explanation": "append() adds an item to the end."
}
```

## Deployment

### MongoDB Atlas

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with read/write access.
3. Add your Render/Railway IP range, or temporarily allow `0.0.0.0/0` if your host requires dynamic egress.
4. Copy the connection string into `MONGO_URI`.

### Backend on Render or Railway

1. Create a new web service from your GitHub repository.
2. Set root directory to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `CLIENT_URL=https://your-vercel-app.vercel.app`
   - `ML_SERVICE_URL=https://your-ml-service.onrender.com`
   - Optional SMTP variables for email notifications
6. Deploy and verify `https://your-api-host/health`.

### Frontend on Vercel

1. Import the GitHub repository into Vercel.
2. Set root directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL=https://your-api-host/api`
6. Deploy.

### ML API on Render

1. Create a Render web service from the same GitHub repository.
2. Set root directory to `ml-service`.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. De
## Production Notes

- Backend calls the ML service through `ML_SERVICE_URL` using Axios with retry and falls back to deterministic recommendation logic if ML is unavailable.
- The ML service automatically trains a starter Scikit-learn model if no `models/recommendation_model.joblib` exists.
- Retraining can be scheduled in Render cron jobs or CI by running `cd ml-service && python -m scripts.train`.
- Backend smoke tests can be run with `cd backend && npm run test:smoke` after the three services are running.
- ML prediction tests can be run with `cd ml-service && .venv\Scripts\python.exe -m scripts.test_predictions`.

## GitHub Setup

```bash
git init
git add .
gi Production Notes

- Backend uses rule-based heuristics for question recommendations (no external ML service required).
- Recommendation algorithm prioritizes weak topics, adjusts difficulty based on user accuracy and streak, and ranks candidates by topic/difficulty match.
- Backend smoke tests can be run with `cd backend && npm run test:smoke` after the services are running