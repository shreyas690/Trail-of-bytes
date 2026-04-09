# Redis & Environment Setup Guide

This project now uses Redis for **real-time leaderboards**, **performance caching**, and **submission rate limiting**. While Redis is optional, it is highly recommended for stability with 300+ concurrent participants.

## 📋 Environment Variables

Update your `server/.env` file with the following:

```env
# Existing variables
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
PORT=5000 
CLIENT_URL=http://localhost:5173

# Redis Configuration
REDIS_URL=redis://localhost:6379
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `REDIS_URL` | The connection string for your Redis instance. | `redis://localhost:6379` |

---

## 🛠️ Redis Installation

### Windows
1. Download the latest `.msi` or `.zip` from [Redis for Windows](https://github.com/microsoftarchive/redis/releases).
2. Alternatively, use [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) and install via `apt`:
   ```bash
   sudo apt install redis-server
   sudo service redis-server start
   ```
3. Or use Docker:
   ```bash
   docker run --name trail-redis -p 6379:6379 -d redis
   ```

### macOS
```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

## 🚀 Verifying the Setup

1. **Start the Redis Server.**
2. **Start the Backend:**
   ```bash
   cd server
   npm run dev
   ```
3. **Check Logs:**
   - If successful: `Redis connected successfully`
   - If Redis is missing: `Redis not configured - running without cache` (System will fallback to MongoDB).

## 🛡️ Rate Limiting & Leaderboard

- **Rate Limiting:** Defaults to 3 seconds per submission per team (`submit_lock:{teamId}`).
- **Leaderboard:** Stored in a Redis Sorted Set (`leaderboard`) for O(log(N)) ranking performance.

---

> [!TIP]
> If you are running in production, ensure your Redis instance is password-protected and update the `REDIS_URL` accordingly: `redis://:password@host:port`.
