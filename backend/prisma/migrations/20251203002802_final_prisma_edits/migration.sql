/*
  Warnings:

  - The values [PENDING,APPROVED,REJECTED,VERIFIED] on the enum `ClaimStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `finderId` to the `Claim` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ClaimStatus_new" AS ENUM ('OPEN', 'ACCEPTED', 'DECLINED');
ALTER TABLE "Claim" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Claim" ALTER COLUMN "status" TYPE "ClaimStatus_new" USING ("status"::text::"ClaimStatus_new");
ALTER TYPE "ClaimStatus" RENAME TO "ClaimStatus_old";
ALTER TYPE "ClaimStatus_new" RENAME TO "ClaimStatus";
DROP TYPE "ClaimStatus_old";
ALTER TABLE "Claim" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "finderId" TEXT NOT NULL,
ADD COLUMN     "handedOff" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "category" TEXT;

-- CreateIndex
CREATE INDEX "Claim_finderId_idx" ON "Claim"("finderId");

-- CreateIndex
CREATE INDEX "Item_category_idx" ON "Item"("category");
