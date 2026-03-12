export const SCORE_MAP = {
  common: 100,
  rare: 300,
  legendary: 200,
  mine: -50
};

export const SOCKET_EVENTS = {
  JOIN_LOBBY: "joinLobby",
  LOBBY_UPDATE: "lobbyUpdate",
  SESSION_STARTED: "sessionStarted",
  SESSION_STOPPED: "sessionStopped",
  TEAM_UPDATE: "teamUpdate",
  LEADERBOARD_UPDATE: "leaderboardUpdate",
  // Level 1 Socket events
  MESSAGE_BOX: "messageBox",
  LEVEL1_RANK_UPDATE: "level1:rankUpdate"
};

export const SESSION_STATUS = {
  WAITING: "waiting",
  RUNNING: "running",
  STOPPED: "stopped",
  FINISHED: "finished"
};

