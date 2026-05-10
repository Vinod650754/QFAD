# Deployment Checklist

- Create MongoDB Atlas cluster and copy the connection string.
- Set backend environment variables on Render/Railway.
- Deploy ML service and set backend `ML_SERVICE_URL`.
- Deploy backend and verify `/health`.
- Seed data once with `npm run seed`.
- Set `VITE_API_URL` on Vercel to the deployed backend `/api` URL.
- Deploy frontend.
- Register a user, answer the daily question, verify XP/streak/history.
- Login as seeded admin, create a scheduled question, verify admin analytics.
- Upload `datasets/sample_questions.json` from Admin Dataset Upload and verify imported questions.
- Run automated public dataset import: `npm run dataset:fetch -- 50`, `npm run dataset:clean`, `npm run import:dataset -- ../datasets/generated/opentdb_clean.json`.
- Train ML model with `cd ml-service && python -m scripts.train`.
- Verify ML prediction with `python -m scripts.test_predictions`.
