import jwt from "jsonwebtoken";
import createError from "http-errors";
import Admin from "../models/Admin.js";
import Team from "../models/Team.js";

const extractToken = (req) => {
  const bearer = req.headers.authorization;
  if (bearer && bearer.startsWith("Bearer ")) {
    return bearer.substring(7);
  }
  if (req.cookies) {
    // Check for teamToken (set by team login) or token (generic)
    return req.cookies.teamToken || req.cookies.token || null;
  }
  return null;
};

export const adminAuth = async (req, _res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw createError(401, "Missing token");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.sub);
    if (!admin) throw createError(401, "Invalid token");

    req.admin = admin;
    next();
  } catch (err) {
    next(createError(401, "Unauthorized"));
  }
};

export const teamAuth = async (req, _res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw createError(401, "Missing token");

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const team = await Team.findById(payload.sub);
    if (!team) throw createError(401, "Invalid token");

    req.team = team;
    next();
  } catch (err) {
    next(createError(401, "Unauthorized"));
  }
};

