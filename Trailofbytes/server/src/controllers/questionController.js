import Question from "../models/Question.js";
import { normalizeAnswer } from "../utils/normalize.js";

export const listQuestions = async (_req, res) => {
  const questions = await Question.find({}).sort({ createdAt: 1 });
  res.json({ success: true, questions });
};

export const createQuestion = async (req, res) => {
  const payload = {
    ...req.body,
    answer: normalizeAnswer(req.body.answer)
  };
  const question = await Question.create(payload);
  res.status(201).json({ success: true, question });
};

export const updateQuestion = async (req, res) => {
  const payload = { ...req.body };
  if (payload.answer) {
    payload.answer = normalizeAnswer(payload.answer);
  }
  const question = await Question.findByIdAndUpdate(req.params.id, payload, {
    new: true
  });
  res.json({ success: true, question });
};

export const deleteQuestion = async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.status(204).end();
};

