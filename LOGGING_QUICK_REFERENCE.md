# Logging & Error Handling - Quick Reference

## 🚀 Quick Start

### View Logs

```bash
# View error logs
cat backend/logs/error.log

# View all logs
cat backend/logs/combined.log

# Watch logs in real-time
tail -f backend/logs/combined.log

# View last 50 lines
tail -n 50 backend/logs/combined.log
```

### Log Locations

```
backend/logs/
├── error.log          # Errors only
├── combined.log       # All logs
├── exceptions.log     # Uncaught exceptions
└── rejections.log     # Unhandled promises
```

---

## 📝 Using Logger in Code

### Import Logger

```javascript
const logger = require('../config/logger');
```

### Log Levels

```javascript
// Error - Critical issues
logger.error('Payment failed', { userId, amount, error: err.message });

// Warning - Important but not critical
logger.warn('Low inventory stock', { medicineName, stock: 5 });

// Info - General information
logger.info('User logged in', { userId, email });

// Debug - Detailed debugging info
logger.debug('Processing data', { data });
```

---

## 🛡️ Error Handling

### Use asyncHandler for Routes

```javascript
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/data', asyncHandler(async (req, res) => {
  const data = await Model.find();
  res.json({ success: true, data });
}));
```

### Throw Custom Errors

```javascript
const { AppError } = require('../middleware/errorHandler');

if (!user) {
  throw new AppError('User not found', 404);
}

if (!authorized) {
  throw new AppError('Unauthorized access', 403);
}
```

---

## 🔍 Common Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid/expired token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry |
| 500 | Server Error | Unexpected error |

---

## 📊 Log Format

### HTTP Requests (Morgan)
```
::1 - - [02/Oct/2025:10:30:15 +0000] "GET /api/appointments HTTP/1.1" 200 1234
```

### Application Logs (Winston)
```
2025-10-02 10:30:15 [info]: User logged in { userId: '123', email: 'user@example.com' }
2025-10-02 10:30:16 [error]: Payment failed { userId: '123', error: 'Insufficient funds' }
```

---

## 🧪 Testing Error Handling

```bash
# Test 404
curl http://localhost:5000/api/invalid

# Test invalid ObjectId
curl http://localhost:5000/api/appointments/invalid-id

# Test unauthorized
curl http://localhost:5000/api/protected-route
```

---

## ⚙️ Configuration

### Environment Variables

```env
LOG_LEVEL=info          # error, warn, info, debug
NODE_ENV=development    # development, production
```

### Change Log Level

Edit `.env`:
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - General info (default)
- `debug` - Everything

---

## 🎯 Best Practices

### DO:
✅ Use asyncHandler for all async routes
✅ Log important business events
✅ Include context in error logs
✅ Use appropriate log levels
✅ Throw AppError for operational errors

### DON'T:
❌ Log sensitive data (passwords, tokens)
❌ Use console.log in production
❌ Ignore errors silently
❌ Log everything (too noisy)
❌ Expose stack traces to users

---

## 🚨 Emergency Debugging

### Application Won't Start

```bash
# Check error logs
cat backend/logs/error.log

# Check exceptions
cat backend/logs/exceptions.log

# Run with debug logging
LOG_LEVEL=debug npm run dev
```

### High Error Rate

```bash
# Count errors in last hour
grep "error" backend/logs/error.log | tail -n 100

# Find most common errors
grep "error" backend/logs/error.log | sort | uniq -c | sort -rn
```

### Performance Issues

```bash
# Check slow requests (>1000ms)
grep "1[0-9][0-9][0-9]ms" backend/logs/combined.log
```

---

## 📦 Dependencies

Already installed in package.json:
- `winston` - Logging library
- `morgan` - HTTP request logger

No additional installation needed!

---

## 🔗 Related Files

- `backend/config/logger.js` - Logger configuration
- `backend/middleware/errorHandler.js` - Error handling
- `backend/server.js` - Main application setup
- `ERROR_HANDLING_AND_LOGGING_IMPLEMENTATION.md` - Full documentation
