import { isLocalDevelopmentMode } from "@/lib/environmentMode";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import {
  finishTransaction,
  initConnection,
  purchaseUpdatedListener,
} from "react-native-iap";

const isJwsShape = (v: unknown) =>
  typeof v === "string" && v.length > 20 && v.split(".").length === 3;

export function RenewalListener() {
  const utils = trpc.useUtils();
  const verifyReceiptMutation = trpc.subscriptions.verifyReceipt.useMutation();
  const seenTxIds = useRef(new Set<string>());

  const mutateRef = useRef(verifyReceiptMutation.mutateAsync);
  useEffect(() => {
    mutateRef.current = verifyReceiptMutation.mutateAsync;
  });

  useEffect(() => {
    if (isLocalDevelopmentMode()) return;

    let listener: { remove(): void } | null = null;

    const setup = async () => {
      try {
        await initConnection();
      } catch {
        // connection may already be initialized by the Paywall — safe to ignore
      }

      listener = purchaseUpdatedListener(async (purchase) => {
        const txId = purchase.transactionId ?? null;
        if (txId && seenTxIds.current.has(txId)) return;
        if (txId) seenTxIds.current.add(txId);

        const isAndroid = Platform.OS === "android";
        const p = purchase as any;

        let signedTransactionJWS: string | null = null;
        if (!isAndroid) {
          const candidates = [
            p.jwsRepresentation,
            p.signedTransactionInfo,
            p.signedTransactionJWS,
            p.purchaseToken,
          ];
          signedTransactionJWS = candidates.find(isJwsShape) ?? null;
          if (!signedTransactionJWS) {
            if (txId) seenTxIds.current.delete(txId);
            return;
          }
        }

        try {
          await mutateRef.current({
            platform: isAndroid ? "ANDROID" : "IOS",
            productId: purchase.productId,
            transactionId: txId,
            purchaseToken: isAndroid ? p.purchaseToken : null,
            transactionReceipt: null,
            signedTransactionJWS: !isAndroid ? signedTransactionJWS : null,
          });

          await utils.subscriptions.getStatus.invalidate();

          try {
            await finishTransaction({ purchase });
          } catch {
            // finishTransaction failure is non-fatal; entitlement already updated
          }
        } catch {
          // Silent — don't surface background renewal errors to the user.
          // Remove from seen set so a later app open can retry.
          if (txId) seenTxIds.current.delete(txId);
        }
      });
    };

    setup();
    return () => {
      listener?.remove();
    };
  }, []);

  return null;
}
