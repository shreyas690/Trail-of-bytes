# Implementation Plan: Multi-Team Level System with Score Persistence

## Overview
This plan outlines the changes needed to implement:
1. Multiple teams playing Level 1 simultaneously with first-completion lockout
2. Level 2 disconnected from admin page (independent progression)
3. Cumulative scoring across all levels
4. Backward compatibility with existing features

---

## 1. Database Schema Updates

### 1.1 GameSession Model
**File:** `server/src/models/GameSession.js`

**Changes:**
- Add `level1CompletedBy` field to track which team completed Level 1 first
- Add `level1CompletedAt` timestamp
- Add `level1Locked` boolean to indicate if Level 1 is locked

```javascript
level1CompletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
level1CompletedAt: { type: Date, default: null },
level1Locked: { type: Boolean, default: false }
```

### 1.2 Team Model
**File:** `server/src/models/Team.js`

**Changes:**
- Add `totalScore` field for cumulative score across all levels
- Add `level1CompletedAt` timestamp
- Add `level1Rank` to track completion order
- Modify score calculation to include cumulative points

```javascript
totalScore: { type: Number, default: 0 }, // Cumulative score across all levels
level1CompletedAt: { type: Date, default: null },
level1Rank: { type: Number, default: null }
```

**Pre-save Hook Update:**
- Calculate `totalScore = points + level2Points`

---

## 2. Backend Logic Updates

### 2.1 Session Controller
**File:** `server/src/controllers/sessionController.js`

**Changes:**
- Modify `startSession` to reset Level 1 lockout fields
- Add logic to unlock Level 1 when session starts

### 2.2 Team Controller / Game Service
**File:** `server/src/services/gameService.js`

**Changes:**
- Add check for Level 1 completion lockout before allowing cell clicks
- When a team completes Level 1 (finds all treasures or reaches goal):
  - Mark the session as `level1Locked = true`
  - Set `level1CompletedBy` to the team ID
  - Set `level1CompletedAt` to current timestamp
  - Assign `level1Rank` to teams based on completion order
  - Emit socket event to notify all teams that Level 1 is locked
  - Prevent other teams from continuing Level 1

### 2.3 Level 2 Controller
**File:** `server/src/controllers/level2Controller.js`

**Changes:**
- Modify `startLevel2` to carry over Level 1 points:
  - Set `level2Points = 0` (fresh start for Level 2)
  - Keep `points` from Level 1 intact
  - Calculate `totalScore = points + level2Points`
- Update leaderboard to show `totalScore` instead of just `level2Points`
- Remove any admin control dependencies (already independent)

### 2.4 New Controller: Completion Controller
**File:** `server/src/controllers/completionController.js` (NEW)

**Purpose:** Handle level completion logic

**Functions:**
- `completeLevel1(teamId)` - Mark Level 1 as complete for a team
  - Check if Level 1 is already locked
  - If not locked, lock it and mark this team as the winner
  - If locked, prevent completion and return error
  - Calculate and assign rank
  - Emit socket events

---

## 3. Socket Events Updates

### 3.1 New Socket Events
**File:** `server/src/sockets/index.js`

**Add:**
- `level1:locked` - Emitted when Level 1 is locked (first team completes)
- `level1:completed` - Emitted when a team completes Level 1
- `level1:rankUpdate` - Emitted to update team ranks

**Payload Structure:**
```javascript
{
  event: "level1:locked",
  data: {
    completedBy: teamId,
    completedAt: timestamp,
    winningTeam: teamName
  }
}
```

---

## 4. Frontend Updates

### 4.1 GamePage (Level 1)
**File:** `client/src/pages/GamePage.jsx`

**Changes:**
- Add state for `level1Locked` status
- Listen for `level1:locked` socket event
- Display banner/modal when Level 1 is locked by another team
- Disable grid clicks and question submissions when locked
- Show "Level 1 completed by Team X" message
- Add "Continue to Level 2" button for teams that completed Level 1
- Show cumulative score (Level 1 + Level 2)

### 4.2 Level2Page
**File:** `client/src/pages/Level2Page.jsx`

**Changes:**
- Display cumulative score (Level 1 points + Level 2 points)
- Update leaderboard to show total scores
- Ensure no admin control UI elements are present
- Show Level 1 score separately for reference

### 4.3 AdminDashboardPage
**File:** `client/src/pages/AdminDashboardPage.jsx`

**Changes:**
- Only show Level 1 session controls
- Display which team completed Level 1 first
- Show Level 1 lockout status
- Remove any Level 2 controls (if present)
- Show teams' cumulative scores in the lobby

### 4.4 ResultPage
**File:** `client/src/pages/ResultPage.jsx`

**Changes:**
- Show cumulative score from all levels
- Display Level 1 rank (1st, 2nd, 3rd, etc.)
- Show breakdown: Level 1 points + Level 2 points = Total

---

## 5. API Endpoints

### 5.1 New Endpoints

**POST** `/api/team/:id/complete-level1`
- Mark Level 1 as complete for a team
- Check lockout status
- Return success/failure

**GET** `/api/session/level1-status`
- Get Level 1 lockout status
- Return which team completed first
- Return completion timestamp

### 5.2 Modified Endpoints

**GET** `/api/leaderboard`
- Return `totalScore` instead of just `points`
- Include Level 1 and Level 2 breakdown

**GET** `/api/team/:id`
- Include `totalScore`, `level1Rank`, `level1CompletedAt`

---

## 6. Implementation Order

1. **Database Schema** (Models)
   - Update `GameSession.js`
   - Update `Team.js`
   - Run migration/seed if needed

2. **Backend Logic** (Controllers & Services)
   - Create `completionController.js`
   - Update `sessionController.js`
   - Update `gameService.js`
   - Update `level2Controller.js`

3. **Socket Events**
   - Add new events to `sockets/index.js`
   - Update constants

4. **API Routes**
   - Add new routes
   - Update existing routes

5. **Frontend** (Pages & Components)
   - Update `GamePage.jsx`
   - Update `Level2Page.jsx`
   - Update `AdminDashboardPage.jsx`
   - Update `ResultPage.jsx`

6. **Testing**
   - Test multi-team Level 1 gameplay
   - Test Level 1 lockout mechanism
   - Test score persistence across levels
   - Test admin controls (Level 1 only)
   - Test Level 2 independence

---

## 7. Edge Cases & Considerations

### 7.1 Level 1 Completion Criteria
**Question:** What defines "completing Level 1"?
- Finding all treasures?
- Reaching a certain score?
- Answering all questions?

**Recommendation:** Use existing game completion logic (e.g., all treasures found or attempts exhausted)

### 7.2 Multiple Teams Completing Simultaneously
- Use database transaction or atomic update to ensure only one team can lock Level 1
- Use `findOneAndUpdate` with conditions to prevent race conditions

### 7.3 Teams Already in Level 2
- Teams that have already progressed to Level 2 should not be affected by Level 1 lockout
- Level 2 progression is independent

### 7.4 Score Persistence
- Ensure scores are never overwritten
- Use additive operations for score updates
- Maintain separate fields for each level's score

### 7.5 Admin Reset
- When admin resets the session, should Level 2 progress also reset?
- **Recommendation:** Only reset Level 1, keep Level 2 independent

---

## 8. Testing Checklist

- [ ] Multiple teams can join and play Level 1 simultaneously
- [ ] First team to complete Level 1 locks it for others
- [ ] Other teams receive real-time notification of lockout
- [ ] Locked teams cannot click cells or submit answers
- [ ] Level 1 scores persist when teams move to Level 2
- [ ] Level 2 shows cumulative score (Level 1 + Level 2)
- [ ] Admin page only controls Level 1
- [ ] Admin page shows Level 1 lockout status
- [ ] Level 2 operates independently (no admin control)
- [ ] Leaderboard shows cumulative scores
- [ ] Result page shows score breakdown
- [ ] Session reset only affects Level 1

---

## 9. Migration Notes

### Existing Data
- Existing teams will have `totalScore = 0` initially
- Run a migration script to calculate `totalScore` for existing teams:
  ```javascript
  db.teams.updateMany({}, [{ $set: { totalScore: { $add: ["$points", "$level2Points"] } } }])
  ```

### Backward Compatibility
- All existing fields remain intact
- New fields have default values
- Existing API endpoints continue to work

---

## 10. Constants & Configuration

**File:** `server/src/utils/constants.js`

**Add:**
```javascript
export const SOCKET_EVENTS = {
  // ... existing events
  LEVEL1_LOCKED: "level1:locked",
  LEVEL1_COMPLETED: "level1:completed",
  LEVEL1_RANK_UPDATE: "level1:rankUpdate"
};
```

---

## Summary

This implementation will:
✅ Allow multiple teams to play Level 1 simultaneously
✅ Lock Level 1 when first team completes
✅ Persist scores across levels
✅ Keep Level 2 independent from admin control
✅ Maintain backward compatibility
✅ Provide real-time updates via Socket.IO

**Estimated Implementation Time:** 4-6 hours
**Risk Level:** Medium (requires careful socket event handling and race condition prevention)
