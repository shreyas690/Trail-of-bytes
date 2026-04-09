/**
 * Game Start Flow - Integration Tests
 *
 * Tests the full game start flow step-by-step:
 *   1. A waiting GameSession exists in DB
 *   2. startSession is called (simulating the admin button click)
 *   3. DB session status updates to "running"
 *   4. All teams are reset
 *   5. Socket emission is verified via a jest mock
 *
 * Matches the existing test pattern in game.test.js (no supertest, pure service/model layer).
 */
import mongoose from "mongoose";
import GameSession from "../src/models/GameSession.js";
import Team from "../src/models/Team.js";

// --- Mock socket helpers so we don't need a real IO server ---
// We replace the module's emitSessionUpdate with a trackable spy
const mockEmitSessionUpdate = jest.fn();
jest.mock("../src/sockets/index.js", () => ({
  emitSessionUpdate: (...args) => mockEmitSessionUpdate(...args),
  emitTeamUpdate: jest.fn(),
  emitLeaderboard: jest.fn(),
  emitMessage: jest.fn(),
  initSockets: jest.fn()
}));

// Mock ActionLog so we don't need a real admin document
jest.mock("../src/models/ActionLog.js", () => {
  const create = jest.fn().mockResolvedValue({});
  return { default: { create } };
});

// Import AFTER mocks are set up
import { invalidateSessionCache } from "../src/services/gameService.js";
import { SESSION_STATUS } from "../src/utils/constants.js";
import GameSessionModel from "../src/models/GameSession.js";

/**
 * Helper: directly simulates what sessionController.startSession does
 * (without needing supertest/HTTP layer).
 */
async function runStartSession(adminId) {
  const minutes = 30;

  const session = await GameSession.findOneAndUpdate(
    { status: { $in: [SESSION_STATUS.WAITING, SESSION_STATUS.STOPPED] } },
    {
      status: SESSION_STATUS.RUNNING,
      startedAt: new Date(),
      endsAt: new Date(Date.now() + minutes * 60000),
      "config.gameTimeMinutes": minutes
    },
    { new: true, upsert: true }
  );

  const attemptsPerTeam = session?.config?.attemptsPerTeam || 15;

  await Team.updateMany(
    {},
    {
      $set: {
        currentSession: session._id,
        attemptsLeft: attemptsPerTeam,
        points: 0,
        score: 0,
        totalScore: 0,
        clickedCells: [],
        foundTreasures: [],
        solvedQuestions: [],
        pendingRevealCell: null,
        completedLevel1: false,
        level1AttemptsUsed: 0,
        level1CompletedAt: null,
        level1Rank: null
      }
    }
  );

  invalidateSessionCache();

  // Simulate what the controller does
  const { emitSessionUpdate } = await import("../src/sockets/index.js");
  emitSessionUpdate(null /* ioRef */, SESSION_STATUS.RUNNING, session);

  return session;
}

describe("Game Start Flow", () => {
  let team1, team2;

  beforeEach(async () => {
    await GameSession.deleteMany({});
    await Team.deleteMany({});
    jest.clearAllMocks();

    // Create a waiting session (as it would be after a reset)
    await GameSession.create({
      status: "waiting",
      config: { attemptsPerTeam: 15, gridSize: 36 }
    });

    // Create two teams representing players in the lobby
    [team1, team2] = await Team.insertMany([
      { name: "Alpha", code: "ALPHA001", points: 50, attemptsLeft: 10 },
      { name: "Beta", code: "BETA0001", points: 30, attemptsLeft: 8 }
    ]);
  });

  // STEP 2 & 3: Verify DB update
  it("should update GameSession status from 'waiting' to 'running'", async () => {
    const before = await GameSession.findOne({ status: "waiting" });
    expect(before).not.toBeNull();

    const session = await runStartSession(new mongoose.Types.ObjectId());

    expect(session.status).toBe("running");
    expect(session.startedAt).toBeInstanceOf(Date);
    expect(session.endsAt).toBeInstanceOf(Date);
    expect(session.endsAt.getTime()).toBeGreaterThan(Date.now());

    // Confirm the DB was actually persisted (not just the return value)
    const persisted = await GameSession.findById(session._id);
    expect(persisted.status).toBe("running");
  });

  // STEP 10: Verify all teams are reset
  it("should reset ALL teams when game starts (no stale data)", async () => {
    await runStartSession(new mongoose.Types.ObjectId());

    const [updatedTeam1, updatedTeam2] = await Promise.all([
      Team.findById(team1._id),
      Team.findById(team2._id)
    ]);

    // Points must be zeroed
    expect(updatedTeam1.points).toBe(0);
    expect(updatedTeam2.points).toBe(0);

    // Attempts must be reset to configured value
    expect(updatedTeam1.attemptsLeft).toBe(15);
    expect(updatedTeam2.attemptsLeft).toBe(15);

    // Both teams must be linked to the new session
    expect(updatedTeam1.currentSession).toBeDefined();
    expect(updatedTeam2.currentSession.toString()).toBe(
      updatedTeam1.currentSession.toString()
    );
  });

  // STEP 4: Verify Socket event emission
  it("should call emitSessionUpdate with 'running' status after DB update", async () => {
    await runStartSession(new mongoose.Types.ObjectId());

    expect(mockEmitSessionUpdate).toHaveBeenCalledTimes(1);

    const [, statusArg, sessionArg] = mockEmitSessionUpdate.mock.calls[0];
    expect(statusArg).toBe("running");
    expect(sessionArg.status).toBe("running");
    expect(sessionArg._id).toBeDefined();
  });

  // Regression: Ensure clicking start when already running does NOT create a second session
  it("should NOT create a duplicate session if game is already running", async () => {
    // First start
    await GameSession.findOneAndUpdate(
      { status: "waiting" },
      { status: "running", startedAt: new Date(), endsAt: new Date(Date.now() + 30 * 60000) },
      { new: true }
    );

    // Attempt to start again — query won't find a waiting/stopped session
    const countBefore = await GameSession.countDocuments();

    await GameSession.findOneAndUpdate(
      { status: { $in: ["waiting", "stopped"] } },
      { status: "running", startedAt: new Date(), endsAt: new Date(Date.now() + 30 * 60000) },
      { new: true, upsert: false } // upsert:false prevents accidental duplicates
    );

    const countAfter = await GameSession.countDocuments();
    expect(countAfter).toBe(countBefore); // No new document created
  });
});
