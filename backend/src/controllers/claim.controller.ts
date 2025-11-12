import { Request, Response } from 'express';
import { claimService } from '../services/claim.service';

export class ClaimController {
  // GET /claims/user/:userId - Get all claims by user
  async getClaimsByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const claims = await claimService.getClaimsByUser(userId);
      res.json({ claims });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch claims' });
    }
  }

  // POST /claims - Create a new claim
  async createClaim(req: Request, res: Response): Promise<void> {
    try {
      const { itemId, ownerId } = req.body;
      if (!itemId || !ownerId) {
        res.status(400).json({ error: 'Missing required fields: itemId, ownerId' });
        return;
      }
      const claim = await claimService.createClaim(itemId, ownerId);
      res.status(201).json(claim);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Item not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message === 'Cannot claim your own item') {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Failed to create claim' });
        }
      } else {
        res.status(500).json({ error: 'Failed to create claim' });
      }
    }
  }

  // PATCH /claims/:id/approve - Approve a claim
  async approveClaim(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { finderId } = req.body;
      if (!finderId) {
        res.status(400).json({ error: 'Missing required field: finderId' });
        return;
      }
      const claim = await claimService.approveClaim(id, finderId);
      res.json(claim);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Claim not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes('Only the finder') || error.message.includes('not open')) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Failed to approve claim' });
        }
      } else {
        res.status(500).json({ error: 'Failed to approve claim' });
      }
    }
  }

  // PATCH /claims/:id/deny - Deny a claim
  async denyClaim(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { finderId } = req.body;
      if (!finderId) {
        res.status(400).json({ error: 'Missing required field: finderId' });
        return;
      }
      const claim = await claimService.denyClaim(id, finderId);
      res.json(claim);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Claim not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes('Only the finder') || error.message.includes('not open')) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Failed to deny claim' });
        }
      } else {
        res.status(500).json({ error: 'Failed to deny claim' });
      }
    }
  }

  // PATCH /claims/:id/handoff - Mark item as handed off
  async markHandedOff(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { finderId } = req.body;
      if (!finderId) {
        res.status(400).json({ error: 'Missing required field: finderId' });
        return;
      }
      const claim = await claimService.markHandedOff(id, finderId);
      res.json(claim);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Claim not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Failed to mark item as handed off' });
      }
    }
  }

  // PATCH /claims/:id/confirm - Confirm receipt of item
  async confirmReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { claimerId } = req.body;
      if (!claimerId) {
        res.status(400).json({ error: 'Missing required field: claimerId' });
        return;
      }
      const claim = await claimService.confirmReceipt(id, claimerId);
      res.json(claim);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Claim not found') {
          res.status(404).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Failed to confirm receipt' });
      }
    }
  }
}

export const claimController = new ClaimController();

