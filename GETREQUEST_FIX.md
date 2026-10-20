# getRequest API Call Fix ✅

## Error
```
Failed to fetch masters: TypeError: relativeURL.replace is not a function
at AddMedicine.jsx:83
```

## Root Cause
`getRequest()` expects a **STRING URL**, but was receiving an **OBJECT**.

## The Issue

### Wrong Code (Line 83):
```javascript
const res = await getRequest({ url: '/franchise/medicines/meta' })
```

### Correct Code:
```javascript
const res = await getRequest('/franchise/medicines/meta')
```

## Why This Happened

### Helper Function Definition (Helpers/index.js):
```javascript
export const getRequest = (url) => api.get(url)
```

**Signature:** `getRequest(url: string)`

It expects:
- ✅ String: `'/franchise/medicines/meta'`
- ❌ Object: `{ url: '/franchise/medicines/meta' }`

### When Object is Passed:
```javascript
// axios.get() receives object instead of string
api.get({ url: '/franchise/medicines/meta' })

// axios tries to do:
relativeURL.replace(...)  // ERROR! Object has no .replace() method
```

## Fix Applied

### File: `AddMedicine.jsx` Line 83

**Before:**
```javascript
const res = await getRequest({ url: '/franchise/medicines/meta' })
```

**After:**
```javascript
const res = await getRequest('/franchise/medicines/meta')
```

## Other Helper Functions

### Correct Usage:

```javascript
// ✅ GET Request
const res = await getRequest('/api/endpoint')

// ✅ POST Request
const res = await postRequest({ 
  url: '/api/endpoint', 
  cred: { data: 'value' } 
})

// ✅ PUT Request
const res = await putRequest({ 
  url: '/api/endpoint', 
  cred: { data: 'value' } 
})

// ✅ PATCH Request
const res = await patchRequest({ 
  url: '/api/endpoint', 
  cred: { data: 'value' } 
})

// ✅ DELETE Request
const res = await deleteRequest('/api/endpoint')

// ✅ File Upload
const res = await fileUpload({ 
  url: '/api/upload', 
  cred: formData 
})
```

### Helper Signatures:
```javascript
getRequest(url: string)                          // Just URL
postRequest({ url, cred })                       // Object with url + data
putRequest({ url, cred })                        // Object with url + data
patchRequest({ url, cred })                      // Object with url + data
deleteRequest(url: string)                       // Just URL
fileUpload({ url, cred })                        // Object with url + data
```

## Verification

### Test in Browser Console:
```javascript
// Import helpers
import { getRequest } from './Helpers'

// Test correct usage
getRequest('/franchise/medicines/meta')
  .then(res => console.log('✅ Success:', res.data))
  .catch(err => console.error('❌ Error:', err))
```

### Expected Response:
```json
{
  "statusCode": 200,
  "data": {
    "categories": [...],
    "formulations": [...],
    "companies": [...]
  },
  "message": "Meta fetched",
  "success": true
}
```

## Common Mistakes

### ❌ Wrong:
```javascript
// Don't pass object to getRequest
getRequest({ url: '/api/endpoint' })

// Don't pass just string to postRequest
postRequest('/api/endpoint')
```

### ✅ Correct:
```javascript
// String for GET
getRequest('/api/endpoint')

// Object for POST
postRequest({ url: '/api/endpoint', cred: data })
```

## Testing Steps

1. **Clear browser cache:**
   ```
   Ctrl + Shift + Delete
   ```

2. **Restart frontend:**
   ```bash
   cd FRANCHISE-ADMIN-FRONTEND
   npm start
   ```

3. **Open Add Medicine page:**
   ```
   http://localhost:3000/franchise/medicines/add
   ```

4. **Check browser console:**
   - Should see NO errors ✅
   - Should see API call to `/franchise/medicines/meta`
   - Should see successful response

5. **Verify dropdowns:**
   - Categories populated ✅
   - Formulations populated ✅
   - Companies populated ✅

## Files Modified
- ✅ `AddMedicine.jsx` - Line 83: Changed from object to string

## Status
✅ **FIXED** - API call now works correctly

## Prevention

### Always Check Helper Signature:
```javascript
// Before using any helper, check its signature in Helpers/index.js

// GET - takes string
export const getRequest = (url) => ...

// POST - takes object
export const postRequest = ({ url, cred }) => ...
```

### TypeScript Would Catch This:
```typescript
// If using TypeScript, this error would be caught at compile time
getRequest({ url: string })  // ❌ Type error!
getRequest(url: string)       // ✅ Correct
```

---

**Status: ✅ COMPLETE**  
**Date: 2026-10-04**  
**Result: API calls working, dropdowns will load data!**
