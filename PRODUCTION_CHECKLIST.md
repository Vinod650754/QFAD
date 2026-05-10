# PRODUCTION SETUP CHECKLIST

## ✅ Pre-Deployment

### Frontend (Vercel)
- [ ] Repository pushed to GitHub
- [ ] Build command set to: `npm install && npm run build`
- [ ] Start command set to: `npm run preview`
- [ ] Environment variables set in Vercel Dashboard:

```
VITE_API_URL=https://qfad.onrender.com/api
```

### Backend (Render)
- [ ] Repository pushed to GitHub
- [ ] Build command set to: `npm install`
- [ ] Start command set to: `npm start`
- [ ] Environment variables set in Render Dashboard:

```
NODE_ENV=production
PORT=10000
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<Secure random string>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://qfad.vercel.app
ML_SERVICE_URL=https://qfad-ml.onrender.com
SMTP_HOST=<your smtp host>
SMTP_PORT=587
SMTP_USER=<your smtp user>
SMTP_PASS=<your smtp password>
EMAIL_FROM=Question For The Day <hello@example.com>
```

### ML Service (Render)
- [ ] Repository `ml-service/` pushed to GitHub
- [ ] Build command set to: `pip install -r requirements.txt`
- [ ] Start command set to: `uvicorn app:app --host 0.0.0.0 --port 10000`
- [ ] `python-3.11.9` specified in `runtime.txt`
- [ ] `models/model.pkl` exists in repository
- [ ] Trained model committed to Git: `git add ml-service/models/model.pkl && git commit -m "add trained model"`

### MongoDB Atlas
- [ ] Cluster created
- [ ] Network Access includes `0.0.0.0/0` (all IPs)
- [ ] Database user created
- [ ] Connection string obtained
- [ ] Connection string set in Backend MONGO_URI

## ✅ Post-Deployment Verification

### Test Frontend
- [ ] Navigate to https://qfad.vercel.app
- [ ] Page loads without errors
- [ ] Vercel deployment shows "Production"

### Test Backend
- [ ] GET https://qfad.onrender.com/ returns success message
- [ ] GET https://qfad.onrender.com/health returns `{status: "ok"}`

### Test ML Service
- [ ] GET https://qfad-ml.onrender.com/health returns model status
- [ ] POST https://qfad-ml.onrender.com/predict returns valid prediction

### Test Auth Flow
```bash
# 1. Signup
curl -X POST https://qfad.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 2. Login (get token)
curl -X POST https://qfad.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Verify user (use token from login response)
curl -X GET https://qfad.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test End-to-End
- [ ] Frontend signup form works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can submit answers
- [ ] Can view profile
- [ ] Leaderboard loads
- [ ] Recommendations work

## ✅ Environment Variables Reference

### Frontend (Vercel Dashboard → Settings → Environment Variables)
```
VITE_API_URL = https://qfad.onrender.com/api
```

### Backend (Render Dashboard → Environment)
```
NODE_ENV = production
PORT = 10000
MONGO_URI = (Get from MongoDB Atlas)
JWT_SECRET = (Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://qfad.vercel.app
ML_SERVICE_URL = https://qfad-ml.onrender.com
SMTP_HOST = (Email service SMTP host)
SMTP_PORT = 587
SMTP_USER = (Email service user)
SMTP_PASS = (Email service password)
EMAIL_FROM = Question For The Day <hello@example.com>
```

### ML Service (Render Dashboard → Environment)
No special environment variables needed beyond what's in runtime.txt and requirements.txt

## ✅ Troubleshooting

### Frontend Shows 404 on API Calls
- [ ] Check VITE_API_URL is set in Vercel
- [ ] Check backend is running on Render
- [ ] Check backend URL is correct
- [ ] Rebuild frontend in Vercel

### Backend Can't Connect to MongoDB
- [ ] Check MONGO_URI is correct
- [ ] Check Network Access in MongoDB Atlas includes `0.0.0.0/0`
- [ ] Check database user credentials
- [ ] Rebuild backend in Render

### ML Service Returns 503 Model Not Loaded
- [ ] Check `models/model.pkl` exists in repository
- [ ] Run `python train.py` locally to generate model
- [ ] Commit and push model.pkl
- [ ] Rebuild ML service in Render
- [ ] Check ML service logs

### CORS Errors
- [ ] Backend has `app.use(cors())` which allows all origins
- [ ] Check browser console for actual error
- [ ] Verify request headers

### JWT Token Errors
- [ ] Check JWT_SECRET matches between requests
- [ ] Check token format is `Bearer <token>`
- [ ] Check token hasn't expired
- [ ] Try logging in again to get fresh token

## ✅ Monitoring & Logs

### View Logs
- **Vercel**: Frontend logs under Deployments → Function logs
- **Render**: Backend logs under Logs tab
- **Render**: ML Service logs under Logs tab

### Common Log Patterns
```
# Backend starting
API running on port 10000

# MongoDB connection
MongoDB connected: cluster0.d1x56cj.mongodb.net

# ML Service starting
Uvicorn running on 0.0.0.0:10000

# ML Service loaded model
Model loaded: models/model.pkl
```

## ✅ Security Reminders

- [ ] Never commit `.env` files with real credentials
- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Rotate JWT_SECRET if compromised
- [ ] Keep SMTP credentials secure
- [ ] Use HTTPS for all communications
- [ ] Monitor MongoDB Atlas for unusual activity
- [ ] Regular backups of MongoDB

## ✅ Performance Tips

1. **Frontend Caching**
   - Vercel automatically caches static assets
   - Production builds are minified

2. **Backend Optimization**
   - Connection pooling to MongoDB
   - Rate limiting enabled (300 req/15min)
   - Compression enabled via helmet

3. **ML Service Optimization**
   - Model loads only once at startup
   - Uses memory mapping for model file
   - Timeout set to 5 seconds

## ✅ Scaling Considerations

- **Render Free Tier**: Limited resources, may need upgrade for production traffic
- **MongoDB Atlas**: Free tier has 512MB storage, may need upgrade
- **Vercel**: Edge functions scale automatically
- **Consider upgrade path**: Pro plans available for all services

## ✅ Support & Resources

- **Frontend Issues**: Check Vercel docs https://vercel.com/docs
- **Backend Issues**: Check Express docs https://expressjs.com/
- **ML Service Issues**: Check FastAPI docs https://fastapi.tiangolo.com/
- **Database Issues**: Check MongoDB docs https://docs.mongodb.com/
- **Deployment Issues**: Check Render docs https://render.com/docs
