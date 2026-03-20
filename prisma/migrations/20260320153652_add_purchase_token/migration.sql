/*
  Warnings:

  - A unique constraint covering the columns `[purchaseToken]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "purchaseToken" TEXT,
ALTER COLUMN "originalTxId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_purchaseToken_key" ON "public"."Subscription"("purchaseToken");
