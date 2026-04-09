import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { SOCKET_EVENTS } from "../utils/constants.js";
import GameSession from "../models/GameSession.js";
import Team from "../models/Team.js";

export const initSockets = (httpServer, corsOrigin) => {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.sub;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    // Join lobby
            socket.on(SOCKET_EVENTS.JOIN_LOBBY, async () => {
              socket.join("lobby");
              const teams = await Team.find({}).select("name points score attemptsLeft");
              io.to("lobby").emit(SOCKET_EVENTS.LOBBY_UPDATE, teams);
            });

    // Join game room for team-specific updates
    socket.on("joinGame", async ({ teamId }) => {
      if (socket.userRole === "team" && socket.userId === teamId) {
        socket.join(teamId);
      }
    });

    socket.on("disconnect", () => {
      // Cleanup if needed
    });
  });

  return io;
};

export const emitSessionUpdate = (io, status, session = null) => {
  if (!io) {
    console.error("[Socket] emitSessionUpdate called but io is not initialized!");
    return;
  }
  if (status === "running" && session) {
    // Ensure dates are properly serialized as ISO strings
    const sessionData = {
      sessionId: session._id,
      startedAt: session.startedAt ? new Date(session.startedAt).toISOString() : null,
      endsAt: session.endsAt ? new Date(session.endsAt).toISOString() : null,
      config: session.config
    };
    console.log(`[Socket] Emitting ${SOCKET_EVENTS.SESSION_STARTED} to all clients`, { sessionId: session._id, endsAt: sessionData.endsAt });
    io.emit(SOCKET_EVENTS.SESSION_STARTED, sessionData);
  } else {
    console.log(`[Socket] Emitting ${SOCKET_EVENTS.SESSION_STOPPED} to all clients`);
    io.emit(SOCKET_EVENTS.SESSION_STOPPED);
  }
};

export const emitTeamUpdate = (io, team) => {
  io.to(team._id.toString()).emit(SOCKET_EVENTS.TEAM_UPDATE, team);
};

export const emitLeaderboard = async (io, payload) => {
  io.emit(SOCKET_EVENTS.LEADERBOARD_UPDATE, payload);
};

export const emitMessage = (io, teamId, payload) => {
  io.to(teamId.toString()).emit(SOCKET_EVENTS.MESSAGE_BOX, payload);
};

