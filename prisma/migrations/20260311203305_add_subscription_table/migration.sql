-- CreateEnum
CREATE TYPE "public"."SubscriptionPlatform" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "public"."SubscriptionPlatform" NOT NULL,
    "productId" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "originalTxId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "public"."Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_originalTxId_idx" ON "public"."Subscription"("originalTxId");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "public"."Subscription"("currentPeriodEnd");

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
