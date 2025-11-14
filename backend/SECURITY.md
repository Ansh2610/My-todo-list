# Security Measures

## Overview
VisionPulse implements multiple layers of security to prevent abuse and ensure reliable service.

## 🛡️ Protection Layers

### 1. **File Upload Protection**
- **Size Limit**: 10MB per file (configurable)
- **Type Validation**: Only JPEG, PNG, WebP allowed
- **MIME Type Check**: Uses `python-magic` to verify actual file type (not just extension)
- **Session Limits**: Max 20 images per session (prevents single user from uploading 1000 images)

### 2. **Rate Limiting**
All endpoints are rate-limited per IP address:
- **Upload**: 10 requests/minute
- **Inference**: 20 requests/minute  
- **Export**: 30 requests/minute

Uses `slowapi` for in-memory rate limiting (production should use Redis for distributed limiting).

### 3. **Session Management**
- Tracks upload count per session
- Sessions expire after 60 minutes
- Automatic cleanup of stale session data
- Prevents session hijacking by limiting uploads

### 4. **Inference Protection**
- **Timeout**: 10 second maximum per inference
- **Confidence Threshold**: 0.25 minimum (filters noise)
- **Rate Limited**: 20/minute prevents CPU exhaustion
- **Lazy Loading**: Model loaded once, reused across requests

### 5. **Automatic Cleanup**
- **Background Task**: Runs every 10 minutes
- **File TTL**: Deletes uploaded files older than 60 minutes
- **Prevents Disk Exhaustion**: Critical for free tier hosting

## 📊 Current Limits (Configurable)

| Setting | Value | Location |
|---------|-------|----------|
| Max Upload Size | 10 MB | `security.py` |
| Max Images/Session | 20 | `security.py` |
| Session TTL | 60 min | `security.py` |
| File TTL | 60 min | `security.py` |
| Upload Rate | 10/min | `security.py` |
| Inference Rate | 20/min | `security.py` |
| Inference Timeout | 10 sec | `security.py` |
| Cleanup Interval | 10 min | `security.py` |

## 🔧 Adjusting Limits

Edit `backend/app/config/security.py`:

```python
# For stricter limits
MAX_IMAGES_PER_SESSION = 10  # Reduce to 10
UPLOAD_RATE_LIMIT = "5/minute"  # Reduce to 5/min

# For more lenient limits (if you have paid hosting)
MAX_IMAGES_PER_SESSION = 50
INFERENCE_RATE_LIMIT = "100/minute"
```

## 🚨 Attack Scenarios Mitigated

### 1. **Upload Spam**
- ❌ Attacker uploads 1000 images/minute
- ✅ Blocked by: Rate limit (10/min) + Session limit (20 total)

### 2. **Large File Attack**
- ❌ Attacker uploads 100MB files
- ✅ Blocked by: 10MB size limit + MIME validation

### 3. **CPU Exhaustion**
- ❌ Attacker triggers 1000 inferences/minute
- ✅ Blocked by: Inference rate limit (20/min) + 10s timeout

### 4. **Disk Space Exhaustion**
- ❌ Attacker fills disk with uploads
- ✅ Mitigated by: Auto-cleanup (60min TTL) + Session limits

### 5. **Malicious File Types**
- ❌ Attacker uploads .exe renamed to .jpg
- ✅ Blocked by: MIME type validation (checks actual file content)

## 🎯 Production Recommendations

### For Free Tier (Render/Vercel)
Current settings are optimal. Keep limits strict since resources are shared.

### For Paid Hosting (with dedicated CPU/GPU)
1. Increase `INFERENCE_RATE_LIMIT` to `100/minute`
2. Increase `MAX_IMAGES_PER_SESSION` to `50`
3. Consider Redis for distributed rate limiting
4. Add authentication for per-user limits

### For Enterprise
1. Add user authentication (JWT tokens)
2. Implement per-user quotas (not just per-IP)
3. Use Redis for rate limiting across multiple servers
4. Add monitoring (Prometheus/Grafana)
5. Implement request logging for audit trails

## 📈 Monitoring

Check rate limit status:
```bash
curl https://visionpulse-backend.onrender.com/limits
```

Response:
```json
{
  "max_upload_size_mb": 10,
  "max_images_per_session": 20,
  "upload_rate_limit": "10/minute",
  "inference_rate_limit": "20/minute",
  "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
}
```

## 🔒 Security Checklist

- [x] File size limits
- [x] MIME type validation
- [x] Rate limiting per IP
- [x] Session upload caps
- [x] Inference timeouts
- [x] Automatic file cleanup
- [x] CORS restrictions
- [ ] User authentication (future)
- [ ] Redis-based rate limiting (future)
- [ ] Request logging (future)

## 🆘 Handling Rate Limit Errors

Frontend automatically handles HTTP 429 (Too Many Requests):
- Shows user-friendly error message
- Suggests waiting before retrying
- Displays current limits via `/limits` endpoint

Backend returns:
```json
{
  "error": "Rate limit exceeded",
  "limit": "10 per 1 minute",
  "retry_after": 42
}
```

## 💡 Tips for Users

1. **If you hit rate limits**: Wait 60 seconds and try again
2. **For large batches**: Use "Next Image" button to stay within one session
3. **Session limit reached**: Click "Reset Session" to start fresh
4. **Files auto-delete after 60min**: Download/export results before then

---

**Note**: These limits are designed to protect the free tier deployment while still providing a great demo experience. Adjust based on your hosting plan!
