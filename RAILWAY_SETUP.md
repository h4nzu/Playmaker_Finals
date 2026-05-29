# Deploy Your App to Railway - Quick Start

## 🚀 Step-by-Step Guide

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Authorize Railway to access your GitHub account

### 2. Deploy Backend to Railway

1. Click **"New Project"** in Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Find and select **h4nzu/testy** repository
4. Railway will auto-detect it's a Python project
5. **In the configuration step**, specify the directory: `backend`
6. Click **"Deploy"**
7. Wait for deployment to complete (you'll see a green checkmark)

### 3. Get Your Backend URL

1. Once deployment is complete, click on the "backend" service
2. Go to **Settings** tab
3. Under **Networking**, copy the **Public URL** (looks like: `https://testy-prod-xxxx.railway.app`)
4. **Save this URL** - you'll need it in the next step

### 4. Update Your Frontend

**Option A: Using Environment Variables (Recommended)**

1. Create a `.env` file in your project root (not in git):
```
VITE_API_BASE_URL=https://testy-prod-xxxx.railway.app
```
Replace `https://testy-prod-xxxx.railway.app` with your actual Railway URL.

2. If deploying to Vercel, add this same environment variable:
   - Go to Vercel project settings
   - Environment Variables
   - Add `VITE_API_BASE_URL` = your Railway URL

**Option B: Direct Update**
If you want to hardcode it (not recommended for production):
- Edit `src/pages/Login.jsx`, `src/components/AdminDashboard.jsx`, `src/App.jsx`
- Change: `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'`
- To: `const API_BASE_URL = 'https://your-railway-url.railway.app'`

### 5. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your **h4nzu/testy** repository
4. Vercel will auto-detect it's a Vite/React project
5. In **Environment Variables**, add:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-railway-url.railway.app`
6. Click **"Deploy"**

### 6. Test Your Deployment

1. Go to your Vercel URL (something like: `https://testy-username.vercel.app`)
2. Try to **Sign Up** with a new account
3. You should see the success message and redirect to login
4. Log in with your new credentials
5. Check that the dashboard works!

## ✅ What Should Work

- ✓ Registration → Success message → Redirect to login
- ✓ Login with new account
- ✓ View dashboard
- ✓ Admin features (if you have admin login)

## 🆘 Troubleshooting

### "Network error" on registration/login
- Check that your Railway backend URL in `.env` is correct
- Make sure Railway deployment is active (green status in Railway dashboard)
- Test the backend directly: `curl https://your-railway-url.railway.app/docs`

### "422 Unprocessable Entity" error
- This usually means the backend needs dependencies
- Check Railway logs: click on deployment → Logs tab
- Make sure `requirements.txt` has all dependencies

### 401 Unauthorized on login
- Make sure you registered first and got the success message
- Try with the exact email/password you registered with
- Check Railway logs for any user storage errors

### API URL is still hitting localhost
- Make sure `.env` file is in the **project root** (not in src or backend)
- The file should contain: `VITE_API_BASE_URL=https://your-railway-url`
- Restart your dev server if testing locally

## 📝 Environment Variables Summary

| Variable | Local Dev | Railway |
|----------|-----------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | `https://your-railway-url.railway.app` |

## 🎯 Final Checklist

- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] Got Railway backend URL
- [ ] Added VITE_API_BASE_URL to `.env` or Vercel settings
- [ ] Frontend deployed to Vercel
- [ ] Can register new account
- [ ] Can log in with new account
- [ ] Dashboard loads and works

You're done! 🎉
