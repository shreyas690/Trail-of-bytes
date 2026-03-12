import { Router } from "express";
import Joi from "joi";
import { teamAuth } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { answerQuestion, clickGrid } from "../controllers/teamController.js";
import { actionLimiter } from "../middleware/rateLimiter.js";

const router = Router();
router.use(teamAuth);
router.use(actionLimiter);

router.post(
  "/:id/answer",
  validate(
    Joi.object({
      params: Joi.object({ id: Joi.string().required() }).required(),
      body: Joi.object({
        questionId: Joi.string().required(),
        answer: Joi.string().required()
      }).required(),
      query: Joi.object().unknown(true)
    })
  ),
  answerQuestion
);

router.post(
  "/:id/click",
  validate(
    Joi.object({
      params: Joi.object({ id: Joi.string().required() }).required(),
      body: Joi.object({
        cellIndex: Joi.number().integer().min(0).max(35).required()
      }).required(),
      query: Joi.object().unknown(true)
    })
  ),
  clickGrid
);

export default router;

