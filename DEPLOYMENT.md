# Deployment Guide

## Deploying Backend to Railway

### Step 1: Sign Up for Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub or create an account

### Step 2: Create a New Project
1. Click "New Project" 
2. Select "Deploy from GitHub"
3. Connect your GitHub repository (h4nzu/testy)
4. Authorize Railway to access your repo

### Step 3: Configure the Backend Service
1. After selecting the repo, Railway will auto-detect it's a Python project
2. In the "Select Directory" step, enter: `backend`
3. Click "Deploy"

### Step 4: Configure Environment Variables (if needed)
1. Go to your Railway project
2. Click on the "backend" service
3. Go to the "Variables" tab
4. No special env vars needed for basic setup - they'll be auto-configured

### Step 5: Get Your Backend URL
1. Once deployed, go to the "Deployments" tab
2. Click on the active deployment
3. Copy the "Public URL" (it will look like: `https://your-project-xxxx.railway.app`)

### Step 6: Update Frontend API URL
1. In your frontend code (`src/pages/Login.jsx`, `src/components/AdminDashboard.jsx`, `src/App.jsx`)
2. Update the `API_BASE_URL` constant from `http://localhost:8000` to your Railway URL
3. Example: `const API_BASE_URL = "https://your-project-xxxx.railway.app"`

**OR** Use an environment variable:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
```

Then create a `.env` file in your frontend root:
```
VITE_API_BASE_URL=https://your-project-xxxx.railway.app
```

### Step 7: Deploy Frontend to Vercel
1. Push your changes to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Select the root directory (or `/` for monorepo)
6. Deploy!

## Testing the Deployment
1. Go to your Vercel frontend URL
2. Try registering a new account
3. Check that it redirects to login with a success message
4. Log in with your new credentials
5. Verify you can see the dashboard

## Troubleshooting

### 422 Error on Registration
This usually means the backend isn't running or the API URL is wrong. Check:
- [ ] Railway deployment is active (green status in Railway dashboard)
- [ ] Frontend has correct API_BASE_URL pointing to your Railway URL
- [ ] CORS is configured (it should be by default)

### 401 Error on Login
This means the user doesn't exist. Make sure:
- [ ] You registered successfully (check for success message)
- [ ] User data was saved (check Railway logs for any errors)
- [ ] You're using the correct email/password

### Can't connect to backend
- Check the Railway deployment logs for startup errors
- Verify the public URL is accessible: `curl https://your-project-xxxx.railway.app/docs`
- Make sure port is set to 8000 in Railway settings

## Local Development
To run locally without Railway:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

In another terminal:
```bash
cd .. (go to project root)
npm run dev  # or yarn dev / pnpm dev
```
