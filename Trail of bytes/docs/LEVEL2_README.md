# Trial of Bytes - Level 2: DEBUG RUSH

## Overview
Level 2 is a debugging challenge where teams solve 10 JavaScript debugging questions by analyzing broken code and submitting the correct output.

## Features

### Timer
- **40-minute countdown timer** displayed in navbar
- Format: `HH:MM:SS`
- Game ends automatically when time runs out

### Scoring System
- **+200 points** per correct answer
- **-50 points** for using a hint (one-time penalty per question)
- Real-time point updates via Socket.IO

### Questions
Each of the 10 questions includes:
- `codeSnippet`: The buggy JavaScript code
- `expectedBehavior`: What the code should do
- `brokenLogic`: Description of what's wrong
- `correctOutput`: The actual output (hidden from client)
- `hint`: A helpful clue (costs 50 points to reveal)
- `difficulty`: "medium" or "hard"
- `points`: 200

### UI Features
- **Expandable questions**: Click to expand/collapse each question
- **Status badges**: "Pending" (yellow) or "Completed" (green)
- **Sketch-style borders**: 2px solid borders with drop shadows
- **Smooth animations**: CSS slide-down effect on expand
- **Real-time leaderboard**: Updates every 5 seconds
- **Instructions modal**: Game rules popup

## Setup Instructions

### 1. Seed Debug Questions
```bash
cd server
node seeds/seedDebugQuestions.js
```

### 2. Start Backend
```bash
cd server
npm run dev
```

### 3. Start Frontend
```bash
cd client
npm run dev
```

### 4. Access Level 2
1. Complete Level 1 (or navigate directly)
2. Click "Continue to Level 2: DEBUG RUSH" on Result Page
3. Or navigate to `/level2` directly

## API Endpoints

### GET `/api/level2/questions`
Fetch all debug questions (without answers)

### POST `/api/level2/start/:teamId`
Initialize Level 2 for a team (sets timer, resets progress)

### POST `/api/level2/hint/:teamId`
Use a hint for a question (deducts 50 points)
```json
{
  "questionNumber": 1
}
```

### POST `/api/level2/submit/:teamId`
Submit an answer for a question
```json
{
  "questionNumber": 1,
  "output": "510"
}
```

### GET `/api/level2/leaderboard`
Fetch Level 2 leaderboard (top 10 teams)

### GET `/api/level2/status/:teamId`
Get team's Level 2 status (points, solved questions, time remaining)

## Socket.IO Events

### Emitted by Server
- `level2:teamUpdate`: Team's points/progress updated
- `level2:leaderboardUpdate`: Leaderboard changed (triggered after answer submission)

### Consumed by Client
Both events trigger UI updates in real-time

## Database Schema

### Team Model (Extended)
```javascript
{
  level: Number,                    // Current level (1 or 2)
  level2Points: Number,             // Level 2 specific points
  level2SolvedQuestions: [ObjectId], // Solved debug question IDs
  level2HintsUsed: [Number],        // Question numbers with used hints
  level2StartTime: Date,            // When Level 2 started
  level2EndTime: Date               // When Level 2 should end
}
```

### DebugQuestion Model
```javascript
{
  questionNumber: Number,
  codeSnippet: String,
  expectedBehavior: String,
  brokenLogic: String,
  correctOutput: String,
  hint: String,
  difficulty: String,  // "medium" | "hard"
  points: Number       // 200
}
```

## Design Notes

### Navbar Layout
```
Points: XXX | Timer: 00:00:00 | [Leaderboard] [Instructions] [Next Level]
```

### Question Card States
1. **Collapsed**: Shows question number and status badge
2. **Expanded**: Shows code snippet, behavior, logic, input field, hint/submit buttons
3. **Completed**: Greyed out, cannot expand

### Color Scheme
- **Primary**: Cyan/Blue (matches existing cyberpunk theme)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#FBBF24)
- **Error**: Red (#EF4444)

## Testing Checklist
- [ ] Seed database with 10 questions
- [ ] Timer counts down correctly
- [ ] Hint button deducts 50 points immediately
- [ ] Correct answer awards 200 points
- [ ] Wrong answer shows error message
- [ ] Leaderboard updates in real-time
- [ ] Expand/collapse animation is smooth
- [ ] Game ends when timer reaches 00:00:00
- [ ] Cannot submit after time is up
- [ ] Instructions modal displays rules

## Future Enhancements
- Add more question categories (React, Node.js, etc.)
- Difficulty-based point multipliers
- Team chat for collaboration
- Answer history/attempt tracking
- Code editor with syntax highlighting
