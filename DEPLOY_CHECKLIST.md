# Deployment Checklist

## Pre-Deployment (Do These First!)

### Local Testing
- [ ] Backend is running: `python -m uvicorn main:app --host 0.0.0.0 --port 8000`
- [ ] Frontend is running: `npm run dev` (or `pnpm dev` / `yarn dev`)
- [ ] Can access frontend at http://localhost:5173
- [ ] Can access backend at http://localhost:8000/docs
- [ ] Registration works: Can create new account
- [ ] See green success message after registration
- [ ] Redirected to login page (not blank!)
- [ ] Can log in with new account
- [ ] Can see dashboard

### Git Setup
- [ ] Latest code is committed and pushed to GitHub
- [ ] All changes are in the `main` or your current branch
- [ ] No uncommitted changes: `git status` shows clean

## Railway Deployment

### Railway Backend
- [ ] Create Railway account at railway.app
- [ ] Connected GitHub to Railway
- [ ] Created new project from GitHub repo
- [ ] Set directory to `backend`
- [ ] Deployment is active (green status)
- [ ] Copied public URL from Railway (looks like: `https://testy-prod-xxxx.railway.app`)
- [ ] Backend URL is accessible: Can visit `https://your-url/docs`

### Update Frontend with Railway URL
- [ ] Updated `.env` file with Railway URL:
  ```
  VITE_API_BASE_URL=https://your-railway-url.railway.app
  ```
- [ ] Or updated `VITE_API_BASE_URL` for Vercel environment variables (if deploying frontend to Vercel)
- [ ] Committed `.env` changes (if using environment variables in .env)
- [ ] **DO NOT commit if using Vercel - add it only in Vercel dashboard**

## Vercel Deployment (Optional but Recommended)

### Frontend to Vercel
- [ ] Created account at vercel.com
- [ ] Connected GitHub to Vercel
- [ ] Imported `h4nzu/testy` repository
- [ ] Vercel auto-detected it as a Vite/React project
- [ ] Added environment variable in Vercel:
  - Key: `VITE_API_BASE_URL`
  - Value: `https://your-railway-url.railway.app`
- [ ] Deployment is active
- [ ] Can access frontend at Vercel URL

## Post-Deployment Testing

### Test Backend (Railway)
- [ ] Can access docs: `https://your-railway-url/docs`
- [ ] Health check passes
- [ ] No errors in Railway logs

### Test Frontend (Local or Vercel)
- [ ] Frontend loads without errors
- [ ] Navbar and all pages visible
- [ ] Can navigate between pages

### Test Registration Flow
- [ ] Go to login page
- [ ] Click "Sign Up"
- [ ] Create new account with email/password
- [ ] **See green success message**: "Account created successfully! You can now log in with your credentials."
- [ ] **Page redirected to login** (not blank)
- [ ] Email field pre-filled with registered email (if you coded that)
- [ ] Can log in with new credentials
- [ ] Dashboard loads and shows data

### Test Login Flow
- [ ] Old accounts still work (if any)
- [ ] Wrong password shows error: "401 Unauthorized"
- [ ] Non-existent email shows error: "401 Unauthorized"
- [ ] Correct credentials log in successfully

### Test Admin Dashboard
- [ ] Go to Admin Dashboard
- [ ] Click "Registered Users" tab
- [ ] New accounts appear in the list
- [ ] User data looks correct (name, email, registration date)

## Troubleshooting Checklist

### If Registration Gives "Network Error"
- [ ] Backend URL in `.env` is correct
- [ ] Backend is running on Railway (check Railway dashboard)
- [ ] Try accessing backend URL directly in browser
- [ ] Check browser console for CORS errors
- [ ] Check Railway logs for Python errors

### If Still Seeing Blank Page After Registration
- [ ] Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- [ ] Clear browser cache
- [ ] Check browser console for JavaScript errors
- [ ] Check that Login.jsx was updated (line 5 should have `import.meta.env`)

### If "422 Unprocessable Entity" on Registration
- [ ] Check that email format is valid (user@example.com)
- [ ] Check that password is at least 6 characters
- [ ] Check Railway logs for detailed error message
- [ ] Verify `requirements.txt` has all dependencies

### If Can't Log In After Registering
- [ ] Make sure you got the green success message
- [ ] Use exact same email and password
- [ ] Check Railway logs for user storage errors
- [ ] Try registering with a different email

## Final Verification

Once everything is deployed:

```
✅ I can sign up successfully
✅ I see the green success message
✅ I'm redirected to login (not blank)
✅ I can log in with my new account
✅ I can see the dashboard
✅ New users appear in admin dashboard
✅ All pages load without errors
```

## Keep These Handy

- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Backend URL**: https://your-railway-url.railway.app
- **Frontend URL**: https://your-vercel-url.vercel.app (if deployed to Vercel)
- **Backend Docs**: https://your-railway-url/docs

## After Deployment

- [ ] Share live URL with users
- [ ] Monitor Railway and Vercel dashboards for errors
- [ ] Set up error tracking (optional: Sentry, LogRocket, etc.)
- [ ] Monitor user registrations
- [ ] Back up user data regularly

---

**You're ready to go! Follow this checklist and your app will be live on Railway & Vercel!** 🚀
