-- CreateIndex
CREATE INDEX "Notification_timestamp_idx" ON "Notification"("timestamp");

-- CreateIndex
CREATE INDEX "Thread_archived_idx" ON "Thread"("archived");

-- CreateIndex
CREATE INDEX "Thread_hidden_idx" ON "Thread"("hidden");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
