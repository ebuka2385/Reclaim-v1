// All code written in this file was created by AI. the prompt was: "Create a file for the messaging routes for the backend that follows the same format as the item.routes.ts file"

// All comments were created by AI after the code was written. The prompt was "Add comments to the messaging routes file"

import { Router } from "express";
import { messagingController } from "../controllers/messaging.controller";

const router: Router = Router();

// GET /messages/user/:userId - Get all conversations for a user
router.get("/user/:userId", (req, res) => messagingController.getConversationsByUser(req, res));

// POST /messages/threads/:threadId - Post a message to a thread
router.post("/threads/:threadId", (req, res) => messagingController.postMessage(req, res));

// GET /messages/threads/:threadId - List messages in a thread with pagination
router.get("/threads/:threadId", (req, res) => messagingController.listMessages(req, res));

// POST /messages/threads/claim/:claimId - Ensure thread exists for a claim
router.post("/threads/claim/:claimId", (req, res) => messagingController.ensureThread(req, res));

export default router;

