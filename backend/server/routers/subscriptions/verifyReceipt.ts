import { TRPCError } from "@trpc/server";
import { prisma } from "../../prisma";
import { verifyReceiptSchema } from "../../schemas/validation";
import { protectedProcedure } from "../../trpc";

/**
 * Stub for Apple receipt verification
 */
async function verifyWithApple(receipt: string) {
  console.log("Stub: Verifying with Apple...", receipt.substring(0, 10) + "...");
  // In a real app, you would call Apple's verifyReceipt endpoint or use a library
  return {
    originalTxId: "ios_tx_" + Math.random().toString(36).substring(7),
    productId: "grouply_premium_monthly",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };
}

/**
 * Stub for Google receipt verification
 */
async function verifyWithGoogle(receipt: string) {
  console.log("Stub: Verifying with Google...", receipt.substring(0, 10) + "...");
  // In a real app, you would use googleapis to check the purchase token
  return {
    originalTxId: "android_tx_" + Math.random().toString(36).substring(7),
    productId: "grouply_premium_monthly",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };
}

export const verifyReceipt = protectedProcedure
  .input(verifyReceiptSchema)
  .mutation(async ({ input, ctx }) => {
    const { receipt, platform } = input;
    let verificationResult;

    try {
      if (platform === "IOS") {
        verificationResult = await verifyWithApple(receipt);
      } else if (platform === "ANDROID") {
        verificationResult = await verifyWithGoogle(receipt);
      } else {
        // Handle WEB or other platforms if needed
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Platform ${platform} not supported for receipt verification yet.`,
        });
      }

      const { originalTxId, productId, expiresAt } = verificationResult;

      // Upsert the subscription record
      const subscription = await prisma.subscription.upsert({
        where: {
          originalTxId: originalTxId,
        },
        update: {
          currentPeriodEnd: expiresAt,
          productId: productId,
          platform: platform,
          userId: ctx.user.id, // Update user in case it changed (e.g. restore purchase)
        },
        create: {
          originalTxId: originalTxId,
          productId: productId,
          platform: platform,
          currentPeriodEnd: expiresAt,
          userId: ctx.user.id,
        },
      });

      return {
        hasAccess: subscription.currentPeriodEnd > new Date(),
        expiresAt: subscription.currentPeriodEnd,
        subscriptionId: subscription.id,
      };
    } catch (error: any) {
      console.error("Receipt verification failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to verify receipt with the platform provider.",
        cause: error,
      });
    }
  });
