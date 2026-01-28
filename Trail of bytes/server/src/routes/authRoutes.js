import { Router } from "express";
import Joi from "joi";
import { teamLogin, adminLogin } from "../controllers/authController.js";
import validate from "../middleware/validate.js";

const router = Router();

const teamSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).required(),
    code: Joi.string().min(3).required()
  }).required(),
  params: Joi.object().unknown(true),
  query: Joi.object().unknown(true)
});

const adminSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }).required(),
  params: Joi.object().unknown(true),
  query: Joi.object().unknown(true)
});

router.post("/team-login", validate(teamSchema), teamLogin);
router.post("/admin/login", validate(adminSchema), adminLogin);

export default router;

