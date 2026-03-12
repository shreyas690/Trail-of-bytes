export const normalizeAnswer = (input = "") =>
  input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const sanitizeTeamCode = (code = "") =>
  code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

