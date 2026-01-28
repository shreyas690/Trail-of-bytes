import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Team from "../models/Team.js";
import Admin from "../models/Admin.js";
import GameSession from "../models/GameSession.js";
import { sanitizeTeamCode } from "../utils/normalize.js";
import { SESSION_STATUS } from "../utils/constants.js";

const signToken = (id, role = "team") => {
  return jwt.sign(
    { sub: id, role },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );
};

export const teamLogin = async (req, res) => {
  const { name, code } = req.body;
  const sanitizedCode = sanitizeTeamCode(code);

  const activeSession = await GameSession.findOne({ status: SESSION_STATUS.RUNNING }).sort({
    createdAt: -1
  });

  let team = await Team.findOne({ code: sanitizedCode });
  if (!team) {
    team = await Team.create({
      name,
      code: sanitizedCode,
      currentSession: activeSession?._id || null,
      attemptsLeft: activeSession?.config?.attemptsPerTeam ?? 15,
      points: 0,
      score: 0,
      pendingRevealCell: null,
      level: 1
    });
  } else {
    let needsSave = false;

    if (typeof team.points !== "number") {
      team.points = typeof team.score === "number" ? team.score : 0;
      needsSave = true;
    }
    if (typeof team.score !== "number") {
      team.score = team.points;
      needsSave = true;
    }

    if (
      activeSession &&
      (!team.currentSession || !team.currentSession.equals(activeSession._id))
    ) {
      team.currentSession = activeSession._id;
      team.attemptsLeft = activeSession?.config?.attemptsPerTeam ?? 15;
      team.clickedCells = [];
      team.foundTreasures = [];
      team.solvedQuestions = [];
      team.pendingRevealCell = null;
      needsSave = true;
    }

    if (needsSave) {
      await team.save();
    }
  }

  const token = signToken(team._id.toString(), "team");

  res
    .cookie("teamToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    })
    .json({ success: true, team, token });
};

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = signToken(admin._id.toString(), "admin");
  res.json({ success: true, token });
};

