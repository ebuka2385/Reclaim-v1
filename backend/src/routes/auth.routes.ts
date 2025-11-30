import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const router: Router = Router();

// POST /auth/login - Login with Google ID token
router.post("/login", (req, res) => authController.login(req, res));

// POST /auth/sync - Sync Clerk user to database
router.post("/sync", (req, res) => authController.syncUser(req, res));

// GET /auth/me/:userId - Get user information
router.get("/me/:userId", (req, res) => authController.getMe(req, res));

export default router;

