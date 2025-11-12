import { Router } from "express";
import { claimController } from "../controllers/claim.controller";

const router: Router = Router();


// PATCH /claims/:id/approve - Approve a claim
router.patch("/:id/approve", (req, res) => claimController.approveClaim(req, res));

// GET /claims/user/:userId - Get all claims by user
router.get("/user/:userId", (req, res) => claimController.getClaimsByUser(req, res));

// POST /claims - Create a new claim
router.post("/", (req, res) => claimController.createClaim(req, res));

// PATCH /claims/:id/deny - Deny a claim
router.patch("/:id/deny", (req, res) => claimController.denyClaim(req, res));

// PATCH /claims/:id/handoff - Mark item as handed off
router.patch("/:id/handoff", (req, res) => claimController.markHandedOff(req, res));

// PATCH /claims/:id/confirm - Confirm receipt of item
router.patch("/:id/confirm", (req, res) => claimController.confirmReceipt(req, res));

export default router;

