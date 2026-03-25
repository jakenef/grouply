import {
  Environment,
  SignedDataVerifier,
} from "@apple/app-store-server-library";
import fs from "fs";
import { google } from "googleapis";
import path from "path";
import { env } from "../../env";
import { prisma } from "../../prisma";
import { verifyReceiptSchema } from "../../schemas/validation";
import { protectedProcedure } from "../../trpc";

const APPLE_BUNDLE_ID = "com.grouply.grouplyapp";

/**
 * Mock for Apple receipt verification (local development)
 */
async function verifyWithAppleMock(productId: string) {
  console.log("Mock: Verifying with Apple (local mode)...", { productId });

  let durationDays = 30;

  if (productId.includes("trial")) {
    durationDays = 7;
  } else if (productId.includes("yearly")) {
    durationDays = 365;
  }

  return {
    originalTxId: "ios_local_" + Math.random().toString(36).substring(7),
    productId: productId,
    expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
  };
}

/**
 * Real implementation for Apple receipt verification via JWS
 */
async function verifyWithApple(
  signedTransactionJWS: string,
  productId: string,
  reqId?: string,
) {
  console.log(
    `[verifyReceipt:${reqId ?? "n/a"}] Verifying with Apple (JWS)...`,
    {
      productId,
      jws: `${signedTransactionJWS.substring(0, 10)}...`,
    },
  );

  const rootCaPaths = env.APPLE_ROOT_CA_PATHS?.length
    ? env.APPLE_ROOT_CA_PATHS
    : env.APPLE_ROOT_CA_PATH
      ? [env.APPLE_ROOT_CA_PATH]
      : [];

  // TEMP DEBUG: Trace iOS verification environment and certificate configuration.
  console.log(`[verifyReceipt:${reqId ?? "n/a"}] iOS verifier config`, {
    environment:
      env.APPLE_APP_STORE_ENV === "PRODUCTION" ? "PRODUCTION" : "SANDBOX",
    rootCertPathCount: rootCaPaths.length,
    hasAppAppleId: !!env.APPLE_APP_ID,
  });

  if (!rootCaPaths.length) {
    throw new Error("APPLE_ROOT_CA_PATHS or APPLE_ROOT_CA_PATH not configured");
  }

  // Load one or more Apple root CA certificates.
  const appleRootCAs = rootCaPaths.map((certPath) =>
    fs.readFileSync(path.resolve(certPath)),
  );

  // Create verifier with environment config
  const environment =
    env.APPLE_APP_STORE_ENV === "PRODUCTION"
      ? Environment.PRODUCTION
      : Environment.SANDBOX;

  const verifier = new SignedDataVerifier(
    appleRootCAs,
    true, // enableOnlineChecks
    environment,
    APPLE_BUNDLE_ID,
    env.APPLE_APP_ID,
  );

  try {
    // Decode and verify the JWS transaction
    const decodedTransaction =
      await verifier.verifyAndDecodeTransaction(signedTransactionJWS);

    // Extract critical fields from decoded transaction
    const decodedProductId = decodedTransaction.productId;
    const decodedBundleId = decodedTransaction.bundleId;
    const decodedOriginalTransactionId =
      decodedTransaction.originalTransactionId;
    const decodedTransactionId = decodedTransaction.transactionId;
    const decodedExpiresDate = decodedTransaction.expiresDate;

    if (!decodedProductId) {
      throw new Error("Apple transaction missing productId");
    }

    if (!decodedBundleId) {
      throw new Error("Apple transaction missing bundleId");
    }

    const originalTxId = decodedOriginalTransactionId || decodedTransactionId;
    if (!originalTxId) {
      throw new Error(
        "Apple transaction missing both originalTransactionId and transactionId",
      );
    }

    if (!decodedExpiresDate) {
      throw new Error("Apple transaction missing expiresDate");
    }

    // Validate bundle ID matches
    if (decodedBundleId !== APPLE_BUNDLE_ID) {
      throw new Error(
        `Bundle ID mismatch: expected ${APPLE_BUNDLE_ID}, got ${decodedBundleId}`,
      );
    }

    // Validate product ID matches (trust decoded value, not frontend)
    if (decodedProductId !== productId) {
      console.warn(
        `Product ID mismatch: frontend sent ${productId}, Apple decoded ${decodedProductId}. Using Apple value.`,
      );
    }

    // Use decoded product ID and original transaction ID as source of truth
    console.log(`[verifyReceipt:${reqId ?? "n/a"}] Apple JWS decode success`, {
      originalTxId,
      transactionId: decodedTransactionId,
      productId: decodedProductId,
      expiresAt: new Date(decodedExpiresDate).toISOString(),
    });

    return {
      originalTxId,
      productId: decodedProductId,
      expiresAt: new Date(decodedExpiresDate),
    };
  } catch (error) {
    console.error(
      `[verifyReceipt:${reqId ?? "n/a"}] JWS verification failed:`,
      error,
    );
    throw new Error(
      `Apple JWS verification failed: ${(error as Error).message}`,
    );
  }
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
    const reqId = Math.random().toString(36).slice(2, 10);
    const {
      platform,
      productId,
      transactionId,
      purchaseToken,
      transactionReceipt,
      signedTransactionJWS,
    } = input;

    console.log(`[verifyReceipt:${reqId}] 📦 Purchase data from app`, {
      reqId,
      userId: ctx.user.id,
      platform,
      productId,
      transactionId,
      hasPurchaseToken: !!purchaseToken,
      hasTransactionReceipt: !!transactionReceipt,
      hasSignedTransactionJWS: !!signedTransactionJWS,
    });

    try {
      let verificationResult: {
        originalTxId: string;
        productId: string;
        expiresAt: Date;
        purchaseToken?: string;
      };

      if (platform === "ANDROID") {
        if (!purchaseToken) {
          throw new Error(
            "Purchase token is required for Android verification",
          );
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
        // Trust boundary: prefer signed JWS over legacy receipt field
        const jwsToVerify = signedTransactionJWS;
        if (!jwsToVerify) {
          throw new Error(
            "signedTransactionJWS is required for iOS verification",
          );
        }

        if (env.IS_LOCAL_MODE) {
          verificationResult = await verifyWithAppleMock(productId);
        } else {
          verificationResult = await verifyWithApple(
            jwsToVerify,
            productId,
            reqId,
          );
        }
      } else {
        throw new Error(`Platform ${platform} verification not implemented`);
      }

      console.log(`[verifyReceipt:${reqId}] verification success`, {
        decodedOriginalTxId: verificationResult.originalTxId,
        decodedProductId: verificationResult.productId,
        expiresAt: verificationResult.expiresAt.toISOString(),
      });

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

      console.log(`[verifyReceipt:${reqId}] db write success`, {
        subscriptionId: subscription.id,
      });

      return {
        ok: true,
        subscriptionId: subscription.id,
        expiresAt: verificationResult.expiresAt,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown verifyReceipt error";
      console.error(`[verifyReceipt:${reqId}] structured error`, {
        reqId,
        platform,
        userId: ctx.user.id,
        productId,
        hasSignedTransactionJWS: !!signedTransactionJWS,
        message,
      });
      throw new Error(`${message} (reqId: ${reqId})`);
    }
  });
