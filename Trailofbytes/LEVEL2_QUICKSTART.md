# 🚀 Quick Start Guide: Level 2 DEBUG RUSH

## Prerequisites
- MongoDB running
- Node.js installed
- Level 1 working (do not modify!)

## Setup (5 steps)

### 1. Seed Debug Questions
```bash
cd server
npm run seed:level2
```

Expected output:
```
Connected to MongoDB
Cleared existing debug questions
Inserted 10 debug questions
```

### 2. Start Backend Server
```bash
cd server
npm run dev
```

Server should start on port 5000 (or your configured PORT)

### 3. Start Frontend Client
```bash
cd client
npm run dev
```

Client should start on port 5173 (or your configured PORT)

### 4. Test Access
Open browser to: `http://localhost:5173/level2`

### 5. Verify Functionality
- ✅ Timer starts at 40:00:00 and counts down
- ✅ 10 questions appear as collapsible cards
- ✅ Click question to expand and see code
- ✅ Click "Hint" to reveal hint (-50 points)
- ✅ Enter output and click "Submit"
- ✅ Correct answer awards +200 points
- ✅ Points update instantly
- ✅ Click "Leaderboard" to see rankings
- ✅ Click "Instructions" to see rules

## Example Answer

**Question 1:**
```javascript
function sum(a, b) {
  return a + b;
}
console.log(sum(5, "10"));
```

**Correct Output:** `510`  
**Explanation:** JavaScript converts 5 to string "5", then concatenates: "5" + "10" = "510"

## Troubleshooting

### Problem: Can't seed questions
**Solution:** Check MongoDB connection string in `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/trial-of-bytes
```

### Problem: Timer not starting
**Solution:** Ensure `startLevel2()` API call succeeds. Check browser console for errors.

### Problem: Points not updating
**Solution:** Verify Socket.IO connection. Check:
1. SERVER_URL in client `.env`
2. CLIENT_URL in server `.env`
3. Browser console for Socket errors

### Problem: Can't submit answers
**Solution:** Ensure you're logged in as a team. Check authentication token in cookies.

## File Locations

**Backend:**
- Model: `server/src/models/DebugQuestion.js`
- Controller: `server/src/controllers/level2Controller.js`
- Routes: `server/src/routes/level2Routes.js`
- Seed: `server/seeds/seedDebugQuestions.js`

**Frontend:**
- Page: `client/src/pages/Level2Page.jsx`
- Route: `client/src/App.jsx` (line ~17)
- Styles: `client/src/styles/index.css`

## API Endpoints Quick Reference

```
GET    /api/level2/questions           - Fetch questions
POST   /api/level2/start/:teamId       - Start timer
POST   /api/level2/hint/:teamId        - Use hint
POST   /api/level2/submit/:teamId      - Submit answer
GET    /api/level2/leaderboard         - Get rankings
GET    /api/level2/status/:teamId      - Get team status
```

## Scoring Rules

| Action | Points |
|--------|--------|
| Correct Answer | +200 |
| Wrong Answer | 0 (can retry) |
| Use Hint | -50 (one-time) |

**Total Possible:** 2000 points (10 questions × 200)  
**With All Hints:** 1500 points (2000 - 10 × 50)

## 10 Debug Questions Summary

1. Type coercion (medium)
2. Closure + var scope (hard)
3. Object reference (medium)
4. typeof null quirk (medium)
5. Array.sort() lexicographic (hard)
6. Variable hoisting (medium)
7. map + parseInt radix (hard)
8. Floating-point precision (medium)
9. Array equality (medium)
10. ASI after return (hard)

## Testing Flow

1. Login as team "TestTeam" (or create new team)
2. Navigate to `/level2`
3. Expand Question 1
4. Enter output: `510`
5. Click Submit
6. Verify: +200 points added
7. Click "Hint" on Question 2
8. Verify: -50 points deducted
9. Open Leaderboard modal
10. Verify: Your team appears with correct points

## Common Outputs for Testing

- Q1: `510`
- Q3: `10`
- Q4: `object\nundefined\ntrue\nfalse` (4 lines)
- Q5: `1,10,1000,25,40,5`
- Q6: `undefined\n5` (2 lines)
- Q8: `0.30000000000000004\nfalse` (2 lines)
- Q9: `false\nfalse` (2 lines)
- Q10: `undefined`

**Note:** \n means newline. For multiline outputs, press Enter in the textarea.

## Success Criteria

✅ Level 1 still works without issues  
✅ Level 2 accessible via `/level2` route  
✅ 10 questions loaded from database  
✅ Timer counts down from 40:00:00  
✅ Expandable question cards work smoothly  
✅ Hints cost 50 points  
✅ Correct answers award 200 points  
✅ Leaderboard updates in real-time  
✅ All teams see synchronized updates  
✅ Game ends when timer hits 00:00:00  

---

**You're ready to test Level 2! Good luck debugging! 🐛🚀**
