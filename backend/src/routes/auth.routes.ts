import express from "express";
import {
  register,
  login,
  registerValidation,
  loginValidation,
} from "../controllers/auth.controller";

const router = express.Router();

// Register a new user
router.post("/register", registerValidation, register);

// Login user
router.post("/login", loginValidation, login);

export default router;
