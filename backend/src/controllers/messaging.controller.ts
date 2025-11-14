import { Request, Response } from "express";
import { messagingService } from "../services/messaging.service";

export class MessagingController {
  // GET /messages/user/:userId - Get all conversations for a user
  async getConversationsByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const conversations = await messagingService.getConversationsByUser(userId);
      res.json({ conversations });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  }

  // POST /messages/threads/:threadId - Post a message to a thread
  async postMessage(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const { userId, text } = req.body;

      if (!userId || !text) {
        res.status(400).json({ error: "Missing required fields: userId, text" });
        return;
      }

      const message = await messagingService.postMessage(threadId, userId, text);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found") || error.message.includes("not accessible")) {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes("does not have access")) {
          res.status(403).json({ error: error.message });
        } else {
          res.status(500).json({ error: "Failed to post message" });
        }
      } else {
        res.status(500).json({ error: "Failed to post message" });
      }
    }
  }

  // GET /messages/threads/:threadId - List messages in a thread with pagination
  async listMessages(req: Request, res: Response): Promise<void> {
    try {
      const { threadId } = req.params;
      const { userId } = req.query;
      const cursor = req.query.cursor as string | null;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      if (!userId) {
        res.status(400).json({ error: "Missing required query parameter: userId" });
        return;
      }

      const result = await messagingService.listMessages(threadId, userId as string, cursor, limit);
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found") || error.message.includes("not accessible")) {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes("does not have access")) {
          res.status(403).json({ error: error.message });
        } else {
          res.status(500).json({ error: "Failed to fetch messages" });
        }
      } else {
        res.status(500).json({ error: "Failed to fetch messages" });
      }
    }
  }

  // POST /messages/threads/claim/:claimId - Ensure thread exists for a claim (mainly for internal use)
  async ensureThread(req: Request, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;
      const threadId = await messagingService.ensureThread(claimId);
      res.json({ threadId });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Claim not found") {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes("only be created for accepted claims")) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: "Failed to ensure thread" });
        }
      } else {
        res.status(500).json({ error: "Failed to ensure thread" });
      }
    }
  }
}

export const messagingController = new MessagingController();

