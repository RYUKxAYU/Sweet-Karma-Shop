# 🚀 Deployment Guide - Sweet Shop Management System

## 📱 Current Deployment Status

- ✅ **Frontend**: https://sweet-karma-shop-8xmg.vercel.app/
- ✅ **Backend**: https://sweet-karma-shop.onrender.com
- 🔧 **Issue**: CORS configuration needs update

## 🚨 IMMEDIATE FIX REQUIRED

Your frontend is showing "Cannot connect to server" because of CORS configuration.

### Quick Fix (2 minutes):

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Find your service**: `sweet-karma-shop`
3. **Environment tab** → Find `ALLOWED_ORIGINS`
4. **Update value to**:
   ```
   http://localhost:5173,http://localhost:5174,http://localhost:3000,https://sweet-karma-shop-8xmg.vercel.app,https://sweet-karma-shop-frontend.vercel.app,https://sweet-karma-shop-frontend.netlify.app,https://sweet-karma-shop.vercel.app,https://sweet-karma-shop.netlify.app
   ```
5. **Save** and wait for redeploy (2-3 minutes)

### Test the Fix:

1. **Visit**: https://sweet-karma-shop-8xmg.vercel.app/
2. **Should see**: Sweet catalog instead of error
3. **Debug tool**: https://sweet-karma-shop-8xmg.vercel.app/debug-connection.html

## 🔍 Debugging Tools

### 1. Debug Connection Tool
- **URL**: https://sweet-karma-shop-8xmg.vercel.app/debug-connection.html
- **Features**: 
  - Tests all endpoints
  - Shows CORS status
  - Provides copy-paste CORS config
  - Real-time diagnostics

### 2. Python CORS Fix Script
```bash
python fix-cors-issue.py
```
- Tests backend connectivity
- Validates CORS configuration
- Provides step-by-step fix instructions

### 3. Manual Testing
```bash
# Test backend health
curl https://sweet-karma-shop.onrender.com/health

# Test API endpoint
curl https://sweet-karma-shop.onrender.com/api/sweets

# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: https://sweet-karma-shop-8xmg.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  https://sweet-karma-shop.onrender.com/api/sweets
```

## 📊 Expected Results After Fix

### ✅ Working Frontend:
- Sweet catalog loads
- User registration works
- Login functionality active
- Admin dashboard accessible
- No console errors

### ✅ Working Backend:
- Health endpoint responds
- API endpoints accessible
- CORS headers present
- No 403/404 errors

## 🔄 Redeployment Process

### Frontend (Vercel):
```bash
# Automatic on git push
git push origin main
# Vercel auto-deploys from GitHub
```

### Backend (Render):
- **Auto-deploy**: On git push to main branch
- **Manual**: Render dashboard → Manual Deploy
- **Environment**: Update via dashboard

## 🛠️ Environment Variables

### Frontend (.env):
```bash
VITE_API_BASE_URL=https://sweet-karma-shop.onrender.com/api
VITE_ENVIRONMENT=production
```

### Backend (Render Environment):
```bash
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000,https://sweet-karma-shop-8xmg.vercel.app
DATABASE_URL=your_postgres_url
JWT_SECRET_KEY=your_secure_secret
DEBUG=false
ENVIRONMENT=production
```

## 🎯 Success Checklist

- [ ] Backend CORS updated
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] Login functionality active
- [ ] Sweet catalog displays
- [ ] Admin dashboard accessible
- [ ] Image upload works
- [ ] Shopping cart functional

## 🆘 Still Having Issues?

1. **Check browser console** (F12 → Console)
2. **Use debug tool**: https://sweet-karma-shop-8xmg.vercel.app/debug-connection.html
3. **Run CORS fix script**: `python fix-cors-issue.py`
4. **Verify backend**: https://sweet-karma-shop.onrender.com/health
5. **Check Render logs** for backend errors

---

**Need immediate help?** The debug tool will show you exactly what's wrong!