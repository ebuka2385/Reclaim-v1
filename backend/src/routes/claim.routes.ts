// All code written in this file was created by AI. the prompt was: "Create a file for the claim routes for the backend that follows the same format as the item.routes.ts file"

// All comments were created by AI after the code was written. The prompt was "Add comments to the claim routes file"

import { Router } from "express";
import { claimController } from "../controllers/claim.controller";

const router: Router = Router();

// GET /claims/user/:userId - Get all claims by user (must come before /:id route)
router.get("/user/:userId", (req, res) => claimController.getClaimsByUser(req, res));

// GET /claims/:id - Get a claim by ID
router.get("/:id", (req, res) => claimController.getClaimById(req, res));

// PATCH /claims/:id/approve - Approve a claim
router.patch("/:id/approve", (req, res) => claimController.approveClaim(req, res));

// POST /claims - Create a new claim
router.post("/", (req, res) => claimController.createClaim(req, res));

// PATCH /claims/:id/deny - Deny a claim
router.patch("/:id/deny", (req, res) => claimController.denyClaim(req, res));

// PATCH /claims/:id/handoff - Mark item as handed off
router.patch("/:id/handoff", (req, res) => claimController.markHandedOff(req, res));

// PATCH /claims/:id/confirm - Confirm receipt of item
router.patch("/:id/confirm", (req, res) => claimController.confirmReceipt(req, res));

export default router;

