import { google } from "googleapis";
import { env } from "../../env";
import { prisma } from "../../prisma";
import { verifyReceiptSchema } from "../../schemas/validation";
import { protectedProcedure } from "../../trpc";

/**
 * Stub for Apple receipt verification
 */
async function verifyWithApple(receipt: string, productId: string) {
  console.log(
    "Stub: Verifying with Apple...",
    receipt.substring(0, 10) + "...",
  );

  // For testing purposes, we'll look for product IDs in the mock "receipt"
  let durationDays = 30;

  if (receipt.includes("trial") || productId.includes("trial")) {
    durationDays = 7;
  } else if (receipt.includes("yearly") || productId.includes("yearly")) {
    durationDays = 365;
  }

  return {
    originalTxId: "ios_tx_" + Math.random().toString(36).substring(7),
    productId: productId,
    expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
  };
}

/**
 * Real implementation for Google receipt verification
 */
async function verifyWithGoogle(productId: string, purchaseToken: string) {
  console.log("Verifying with Google Play...", {
    productId,
    purchaseToken: `${purchaseToken.slice(0, 8)}...`,
  });

  if (!env.GOOGLE_PLAY_SERVICE_ACCOUNT) {
    throw new Error("Google Play Service Account not configured");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: env.GOOGLE_PLAY_SERVICE_ACCOUNT,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });

  const authClient = await auth.getClient();
  const publisher = google.androidpublisher({
    version: "v3",
    auth: authClient as any,
  });

  const res = await publisher.purchases.subscriptions.get({
    packageName: "com.grouply.grouply",
    subscriptionId: productId,
    token: purchaseToken,
  });

  const { expiryTimeMillis, orderId } = res.data;

  if (!expiryTimeMillis) {
    throw new Error("Missing expiryTimeMillis");
  }

  const expiryTime = parseInt(expiryTimeMillis, 10);
  const isActive = expiryTime > Date.now();

  if (!isActive) {
    throw new Error("Subscription expired");
  }

  return {
    originalTxId: orderId || purchaseToken,
    productId,
    purchaseToken,
    expiresAt: new Date(expiryTime),
  };
}

/**
 * Local mock implementation for Android receipt verification
 */
async function verifyWithGoogleMock(productId: string, purchaseToken: string) {
  console.log("Mock: Verifying with Google Play (local mode)...", {
    productId,
    purchaseToken: `${purchaseToken.slice(0, 8)}...`,
  });

  let durationDays = 30;

  if (productId.includes("trial")) {
    durationDays = 7;
  } else if (productId.includes("yearly")) {
    durationDays = 365;
  }

  return {
    originalTxId: `android_local_${purchaseToken}`,
    productId,
    purchaseToken,
    expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
  };
}

export const verifyReceipt = protectedProcedure
  .input(verifyReceiptSchema)
  .mutation(async ({ input, ctx }) => {
    const {
      platform,
      productId,
      transactionId,
      purchaseToken,
      transactionReceipt,
    } = input;

    console.log("📦 Purchase data from app:", {
      platform,
      productId,
      transactionId,
      purchaseToken: purchaseToken ? `${purchaseToken.slice(0, 8)}...` : null,
      transactionReceipt: transactionReceipt
        ? `${transactionReceipt.slice(0, 10)}...`
        : null,
    });

    let verificationResult: {
      originalTxId: string;
      productId: string;
      expiresAt: Date;
      purchaseToken?: string;
    };

    if (platform === "ANDROID") {
      if (!purchaseToken) {
        throw new Error("Purchase token is required for Android verification");
      }

      if (env.IS_LOCAL_MODE) {
        verificationResult = await verifyWithGoogleMock(
          productId,
          purchaseToken,
        );
      } else {
        if (!env.GOOGLE_PLAY_SERVICE_ACCOUNT) {
          throw new Error(
            "Google Play Service Account is required for non-local Android verification",
          );
        }
        verificationResult = await verifyWithGoogle(productId, purchaseToken);
      }
    } else if (platform === "IOS") {
      if (!transactionReceipt) {
        throw new Error("Transaction receipt is required for iOS verification");
      }
      verificationResult = await verifyWithApple(transactionReceipt, productId);
    } else {
      throw new Error(`Platform ${platform} verification not implemented`);
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { originalTxId: verificationResult.originalTxId },
          ...(verificationResult.purchaseToken
            ? [{ purchaseToken: verificationResult.purchaseToken }]
            : []),
        ],
      },
    });

    // If the token/txId is already linked to a different user, block restore
    if (existingSubscription && existingSubscription.userId !== ctx.user.id) {
      throw new Error(
        "This purchase is already linked to another account. Please contact support if you believe this is an error.",
      );
    }

    const subscription = existingSubscription
      ? await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            productId: verificationResult.productId,
            platform,
            userId: ctx.user.id,
            currentPeriodEnd: verificationResult.expiresAt,
            originalTxId: verificationResult.originalTxId,
            purchaseToken: verificationResult.purchaseToken ?? undefined,
          },
        })
      : await prisma.subscription.create({
          data: {
            originalTxId: verificationResult.originalTxId,
            purchaseToken: verificationResult.purchaseToken ?? null,
            productId: verificationResult.productId,
            platform,
            userId: ctx.user.id,
            currentPeriodEnd: verificationResult.expiresAt,
          },
        });

    return {
      ok: true,
      subscriptionId: subscription.id,
      expiresAt: verificationResult.expiresAt,
    };
  });
