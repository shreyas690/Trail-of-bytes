import morgan from "morgan";

export const requestLogger = morgan("combined");

export const auditLog = (ActionLog) => async (adminId, action, meta = {}) => {
  try {
    await ActionLog.create({ adminId, action, meta });
  } catch (err) {
    console.error("Failed to write action log", err);
  }
};

