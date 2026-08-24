-- AlterTable: Add conversation tracking fields to drivers
ALTER TABLE "drivers" ADD COLUMN "conversationStartedAt" TIMESTAMP(3);
ALTER TABLE "drivers" ADD COLUMN "conversationLastActivity" TIMESTAMP(3);
ALTER TABLE "drivers" ADD COLUMN "conversationStage" TEXT NOT NULL DEFAULT 'needs_activation';
ALTER TABLE "drivers" ADD COLUMN "totalConversations" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "drivers_conversationStage_idx" ON "drivers"("conversationStage");
