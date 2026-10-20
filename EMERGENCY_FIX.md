# 🚨 Emergency Fix - TypeError: relativeURL.replace

## Issue
Still getting error even after fix:
```
TypeError: relativeURL.replace is not a function
```

## Root Cause
**Browser is using CACHED OLD CODE!**

Even though we fixed the code, browser is still running the old broken version from cache.

---

## Solution 1: Nuclear Option (FASTEST) 🔥

### Step-by-Step:

1. **Close ALL browser tabs**
2. **Close browser completely** (not just minimize)
3. **Clear Vite cache:**
   ```bash
   cd FRANCHISE-ADMIN-FRONTEND
   Remove-Item -Recurse -Force node_modules\.cache
   ```
4. **Kill all Node processes:**
   ```bash
   taskkill /F /IM node.exe
   ```
5. **Restart frontend:**
   ```bash
   npm start
   ```
6. **Open NEW browser window** (private/incognito mode recommended)
7. **Navigate to:**
   ```
   http://localhost:3000/franchise/medicines/add
   ```

---

## Solution 2: Use Batch Script (EASIEST) 🎯

**Run this file:**
```bash
CLEAR_AND_RESTART.bat
```

It will:
- Kill Node processes
- Clear Vite cache
- Prompt you to clear browser cache
- Start dev server
- Open browser

---

## Solution 3: Manual Browser Cache Clear

### Chrome/Edge:
1. Press `F12` (open DevTools)
2. Right-click the **Refresh button** (next to address bar)
3. Select **"Empty Cache and Hard Reload"**

### Firefox:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached Web Content"
3. Click "Clear Now"
4. Press `Ctrl + F5` (hard reload)

---

## Solution 4: Use Incognito/Private Window

### Quick Test:
1. Open **Incognito/Private** window
2. Go to: `http://localhost:3000/franchise/medicines/add`
3. Should work without error ✅

If works in incognito:
- Confirms browser cache issue
- Clear normal browser cache
- Test again in normal window

---

## Verification Checklist

### ✅ File is Fixed:
```javascript
// Line 83 in AddMedicine.jsx should be:
const res = await getRequest('/franchise/medicines/meta')

// NOT:
const res = await getRequest({ url: '/franchise/medicines/meta' })
```

Verify with:
```bash
cd FRANCHISE-ADMIN-FRONTEND
Get-Content "src\views\franchise\Medicines\AddMedicine.jsx" | Select-String "getRequest"
```

Expected output:
```
const res = await getRequest('/franchise/medicines/meta')
```

### ✅ Cache Cleared:
```bash
# Should return "not found"
Get-Item "node_modules\.cache" -ErrorAction SilentlyContinue
```

### ✅ Browser Cache Cleared:
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache" checkbox
4. Reload page

---

## Why This Keeps Happening

### Browser Cache:
- Browsers aggressively cache JavaScript files
- Even with hard reload, some cached code persists
- Service workers can cache old code
- LocalStorage can store old state

### Vite Cache:
- Vite caches built modules in `node_modules/.cache`
- Sometimes doesn't detect file changes
- Need to manually clear

### Solution:
1. Always clear Vite cache after fixing code
2. Use incognito mode for testing
3. Keep DevTools open with "Disable cache" checked

---

## Emergency Commands

### Kill Everything and Restart:
```powershell
# Kill all Node processes
taskkill /F /IM node.exe

# Clear Vite cache
Remove-Item -Recurse -Force FRANCHISE-ADMIN-FRONTEND\node_modules\.cache

# Start fresh
cd FRANCHISE-ADMIN-FRONTEND
npm start
```

### Test API Directly (Bypass UI):
```javascript
// Open browser console on ANY page
fetch('/franchise/medicines/meta', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('LMS')
  }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err))
```

If this works → Problem is DEFINITELY cached React code

---

## Still Not Working?

### Check if Fix Was Actually Saved:

```bash
# Open file in notepad
notepad FRANCHISE-ADMIN-FRONTEND\src\views\franchise\Medicines\AddMedicine.jsx

# Find line 83
# Should show:
const res = await getRequest('/franchise/medicines/meta')
```

### Check Vite Dev Server Output:

```
✓ 27 modules transformed.
```

If you see this, server rebuilt with new code.

If not seeing this → Server didn't detect change → Restart manually

---

## Nuclear Reset (Last Resort) 💣

If NOTHING works:

```bash
# 1. Kill all
taskkill /F /IM node.exe
taskkill /F /IM chrome.exe
taskkill /F /IM msedge.exe

# 2. Delete caches
Remove-Item -Recurse -Force FRANCHISE-ADMIN-FRONTEND\node_modules\.cache
Remove-Item -Recurse -Force FRANCHISE-ADMIN-FRONTEND\dist
Remove-Item -Recurse -Force $env:LOCALAPPDATA\Google\Chrome\"User Data"\Default\Cache
Remove-Item -Recurse -Force $env:LOCALAPPDATA\Microsoft\Edge\"User Data"\Default\Cache

# 3. Restart computer (yes, seriously)
shutdown /r /t 0

# 4. After restart
cd FRANCHISE-ADMIN-FRONTEND
npm start
```

---

## Prevention for Future

### In `package.json`, add script:
```json
{
  "scripts": {
    "clean": "rimraf node_modules/.cache dist",
    "dev:clean": "npm run clean && npm start"
  }
}
```

### Always run after fixing code:
```bash
npm run dev:clean
```

---

## Summary

### The Fix (Already Applied):
✅ Changed `getRequest({ url: '...' })` to `getRequest('...')`

### The Problem:
❌ Browser/Vite using cached old broken code

### The Solution:
1. ✅ Clear Vite cache: `Remove-Item -Recurse -Force node_modules\.cache`
2. ✅ Kill Node: `taskkill /F /IM node.exe`
3. ✅ Restart: `npm start`
4. ✅ Clear browser cache: `Ctrl + Shift + Delete`
5. ✅ Test in incognito mode first

---

**STATUS: Fix is applied, just need to clear caches! 🚀**
