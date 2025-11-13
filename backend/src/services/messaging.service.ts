/// All code written in this file was created by Ethan Hunt and is completely original in terms of its use. I used several resources to help aid my coding process as I have never used Prisma or TypeScript before.

import { PrismaClient } from "@prisma/client";
import { ClaimStatus } from "../types/claim.types";

const prisma = new PrismaClient();

export class MessagingService {
  // Creates or ensures a thread exists for a claim
  // Called when claim is approved (status ACCEPTED)
  // Returns threadId - creates thread if it doesn't exist, returns existing if it does
  async ensureThread(claimId: string): Promise<string> {
    // First verify the claim exists and is ACCEPTED
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId },
    });

    if (!claim) {
      throw new Error("Claim not found");
    }

    if (claim.status != ClaimStatus.ACCEPTED) {
      throw new Error("Thread can only be created for accepted claims");
    }

    // Check if thread already exists for this claim
    const existingThread = await (prisma as any).thread.findFirst({
      where: { claimId },
    });

    if (existingThread) {
      return existingThread.threadId;
    }

    // Create new thread
    // NOTE: Requires Thread model in Prisma schema with fields:
    // threadId (String @id @default(cuid()))
    // claimId (String, FK to Claim, unique)
    // claimerId (String, FK to User)
    // finderId (String, FK to User)
    // createdAt (DateTime @default(now()))
    // archived (Boolean @default(false))
    // hidden (Boolean @default(false))
    const thread = await (prisma as any).thread.create({
      data: {
        claimId: claimId,
        claimerId: claim.claimerId,
        finderId: claim.finderId,
        archived: false,
        hidden: false,
      },
    });

    return thread.threadId;
  }

  // Posts a message to a thread
  // Verifies user has access before posting
  async postMessage(threadId: string, userId: string, text: string): Promise<any> {
    // Verify user has access to this thread
    await this.verifyParticipantAccess(threadId, userId);

    // Create message
    // NOTE: Requires Message model in Prisma schema with fields:
    // messageId (String @id @default(cuid()))
    // threadId (String, FK to Thread)
    // userId (String, FK to User)
    // text (String)
    // createdAt (DateTime @default(now()))
    const message = await (prisma as any).message.create({
      data: {
        threadId: threadId,
        userId: userId,
        text: text,
      },
    });

    return message;
  }

  // Lists messages for a thread with pagination
  // Verifies user has access before listing
  async listMessages(threadId: string, userId: string, cursor: string | null, limit: number = 50): Promise<{ messages: any[]; nextCursor: string | null }> {
    // Verify user has access to this thread
    await this.verifyParticipantAccess(threadId, userId);

    // Build query with cursor for pagination
    const where: any = { threadId };
    if (cursor) {
      where.messageId = { lt: cursor };
    }

    const messages = await (prisma as any).message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1, // Take one extra to check if there are more
    });

    // Check if there are more messages
    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;

    // Get cursor for next page (last message's ID)
    const nextCursor = hasMore && messagesToReturn.length > 0
      ? messagesToReturn[messagesToReturn.length - 1].messageId
      : null;

    // Reverse to return oldest first (most recent at end)
    return {
      messages: messagesToReturn.reverse(),
      nextCursor,
    };
  }

  // Verifies that a user has access to a thread
  // User must be either the claimer or finder
  // Thread must not be archived or hidden (hidden/archived threads are only accessible by devs via archive)
  // Claim must be ACCEPTED (not DECLINED)
  async verifyParticipantAccess(threadId: string, userId: string): Promise<void> {
    const thread = await (prisma as any).thread.findUnique({
      where: { threadId },
      include: {
        claim: true, // Need to check claim status
      },
    });

    if (!thread) {
      throw new Error("Thread not found");
    }

    // Check if thread is archived
    if (thread.archived) {
      throw new Error("Thread is archived and cannot be accessed");
    }

    // Check if thread is hidden (completed claims - only accessible by devs via archive)
    if (thread.hidden) {
      throw new Error("Thread is hidden and cannot be accessed");
    }

    // Check if user is claimer or finder
    if (thread.claimerId != userId && thread.finderId !== userId) {
      throw new Error("User does not have access to this thread");
    }

    // Get claim to check status
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId: thread.claimId },
    });

    if (!claim) {
      throw new Error("Claim not found");
    }

    // Check claim status - must be ACCEPTED (not DECLINED)
    if (claim.status == ClaimStatus.DECLINED) {
      throw new Error("Thread is not accessible - claim was declined");
    }

    if (claim.status != ClaimStatus.ACCEPTED) {
      throw new Error("Thread is not accessible - claim is not accepted");
    }
  }

  // Archives a conversation when a claim is denied
  // Sets archived = true on the thread, preventing access
  async archiveConversation(claimId: string): Promise<void> {
    const thread = await (prisma as any).thread.findFirst({
      where: { claimId },
    });

    if (!thread) {
      // Thread might not exist if claim was denied before approval
      // This is fine, just return
      return;
    }

    await (prisma as any).thread.update({
      where: { threadId: thread.threadId },
      data: { archived: true },
    });
  }

  // Hides a conversation when receipt is confirmed (item CLAIMED)
  // Sets hidden = true on the thread
  // Hidden is different from archived - archived = denied, hidden = completed
  async hideConversation(claimId: string): Promise<void> {
    const thread = await (prisma as any).thread.findFirst({
      where: { claimId },
    });

    if (!thread) {
      throw new Error("Thread not found for this claim");
    }

    await (prisma as any).thread.update({
      where: { threadId: thread.threadId },
      data: { hidden: true },
    });
  }

  // Gets all conversations for a user
  // Returns threads where user is either claimer or finder
  // Filters out archived threads (denied claims) and hidden threads (completed claims)
  // Hidden threads are archived and not accessible to users
  async getConversationsByUser(userId: string): Promise<any[]> {
    const where: any = {
      OR: [
        { claimerId: userId },
        { finderId: userId },
      ],
      archived: false, // Don't include archived (denied) conversations
      hidden: false, // Don't include hidden (completed) conversations - these are archived
    };

    const threads = await (prisma as any).thread.findMany({
      where,
      include: {
        claim: {
          include: {
            item: true, // Include item info for display
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get last message for each thread
    const threadsWithLastMessage = await Promise.all(
      threads.map(async (thread: any) => {
        const lastMessage = await (prisma as any).message.findFirst({
          where: { threadId: thread.threadId },
          orderBy: { createdAt: "desc" },
        });

        return {
          ...thread,
          lastMessage: lastMessage || null,
        };
      })
    );

    return threadsWithLastMessage;
  }
}

export const messagingService = new MessagingService();

