import mongoose from "mongoose";
import GameSession from "../src/models/GameSession.js";
import Team from "../src/models/Team.js";
import Question from "../src/models/Question.js";
import { submitAnswer, clickCell } from "../src/services/gameService.js";
import { SCORE_MAP } from "../src/utils/constants.js";

describe("Game flow logic", () => {
  let session;
  let team;
  let question;

  beforeEach(async () => {
    await Promise.all([
      GameSession.deleteMany({}),
      Team.deleteMany({}),
      Question.deleteMany({})
    ]);

    session = await GameSession.create({
      status: "running",
      config: { attemptsPerTeam: 15, gridSize: 36 }
    });

    team = await Team.create({
      name: "Alpha",
      code: "ALPHA",
      currentSession: session._id,
      attemptsLeft: 15,
      points: 0,
      score: 0
    });

    question = await Question.create({
      text: "Capital of France?",
      answer: "paris",
      difficulty: "rare",
      treasureCellIndex: 5
    });
  });

  it("sets pendingRevealCell on correct answer without awarding points", async () => {
    await submitAnswer({ teamId: team._id, questionId: question._id, answer: "Paris" });
    const updated = await Team.findById(team._id);
    expect(updated.pendingRevealCell).toBe(question.treasureCellIndex);
    expect(updated.points).toBe(0);
    expect(updated.foundTreasures).toHaveLength(0);
  });

  it("clicking pending cell awards treasure and points", async () => {
    await Team.updateOne(
      { _id: team._id },
      { $set: { pendingRevealCell: question.treasureCellIndex } }
    );

    const result = await clickCell({ teamId: team._id, cellIndex: question.treasureCellIndex });

    expect(result.team.points).toBe(SCORE_MAP[question.difficulty]);
    expect(result.team.foundTreasures).toHaveLength(1);
    expect(result.team.clickedCells).toContain(question.treasureCellIndex);
    expect(result.team.pendingRevealCell).toBeNull();
  });

  it("clicking non-pending cell decrements attempts and subtracts mine points", async () => {
    const before = await Team.findById(team._id);
    const result = await clickCell({ teamId: team._id, cellIndex: 10 });

    expect(result.team.attemptsLeft).toBe(before.attemptsLeft - 1);
    expect(result.team.points).toBe(SCORE_MAP.mine);
    expect(result.team.clickedCells).toContain(10);
  });
});

