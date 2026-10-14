import { Router } from "express";
import {
  registerCitizen,
  loginUser,
  logoutUser,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public
router.post("/register", registerCitizen); // POST /api/v1/auth/register
router.post("/login", loginUser); //          POST /api/v1/auth/login

// Logged-in users
router.post("/logout", verifyJWT, logoutUser); // POST /api/v1/auth/logout
router.get("/me", verifyJWT, getCurrentUser); //  GET  /api/v1/auth/me

export default router;
