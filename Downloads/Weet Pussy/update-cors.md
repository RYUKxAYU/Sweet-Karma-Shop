# 🔧 Update CORS Settings on Render

Your frontend is deployed at: `https://sweet-karma-shop-8xmg.vercel.app/`

## 🚨 **IMMEDIATE FIX NEEDED:**

Your backend on Render needs to allow requests from your deployed frontend. Here's how to fix it:

### Option 1: Update Environment Variables on Render (RECOMMENDED)

1. **Go to your Render dashboard**: https://dashboard.render.com
2. **Find your backend service**: `sweet-karma-shop`
3. **Go to Environment tab**
4. **Update the `ALLOWED_ORIGINS` variable** to include:
   ```
   http://localhost:5173,http://localhost:5174,http://localhost:3000,https://sweet-karma-shop-8xmg.vercel.app,https://sweet-karma-shop-frontend.vercel.app,https://sweet-karma-shop-frontend.netlify.app,https://sweet-karma-shop.vercel.app,https://sweet-karma-shop.netlify.app
   ```
5. **Save and redeploy** the service

### Option 2: Quick Test - Allow All Origins (TEMPORARY)

For immediate testing, you can temporarily set:
```
ALLOWED_ORIGINS=*
```

**⚠️ WARNING: Only use this for testing! It's not secure for production.**

### Option 3: Push Updated Code

The CORS settings have been updated in this repository. You can:

1. **Push the changes** (already done)
2. **Redeploy your backend** on Render
3. **It will automatically pick up** the new CORS settings

## 🧪 **Test the Connection:**

After updating CORS settings:

1. **Wait 2-3 minutes** for Render to redeploy
2. **Visit your frontend**: https://sweet-karma-shop-8xmg.vercel.app/
3. **Check browser console** for any remaining errors
4. **Try to register/login** to test the connection

## 🔍 **Debug Steps:**

If it still doesn't work:

1. **Check browser console** (F12 → Console tab)
2. **Look for CORS errors** or network failures
3. **Test backend directly**: https://sweet-karma-shop.onrender.com/health
4. **Verify API endpoint**: https://sweet-karma-shop.onrender.com/api/sweets

## 📱 **Expected Result:**

After fixing CORS, your frontend should:
- ✅ Load without connection errors
- ✅ Show the sweet catalog
- ✅ Allow user registration/login
- ✅ Enable admin functionality

---

**Need help?** Check the browser console for specific error messages!